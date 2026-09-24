"""
Tests que corren en modo mock: sin AWS, sin costo, en segundos.
Correr:  pytest -v
"""
import pytest
from fastapi.testclient import TestClient

from app.ai_provider import MockAI, parse_filters_json
from app.config import Settings
from app.embedding_cache import InMemoryEmbeddingCache
from app.inventory import InventoryError, load_inventory
from app.main import create_app
from app.schemas import Inventario, SearchFilters, SearchRequest
from app.search_service import VehicleSearchService, adjust_filters, matches_filters

API_KEY = "clave-de-prueba"
SETTINGS = Settings(use_mock=True, api_key=API_KEY, data_path="data/inventario.json")
HEADERS = {"X-Api-Key": API_KEY}


def inventario_base() -> Inventario:
    return load_inventory(SETTINGS)


def cliente(loader=None, ai=None) -> TestClient:
    return TestClient(create_app(SETTINGS, ai=ai, loader=loader))


@pytest.fixture(scope="module")
def client():
    with cliente() as c:  # el 'with' ejecuta el lifespan (arma el índice)
        yield c


def buscar(client, consulta: str, **extra) -> dict:
    response = client.post("/search", json={"consulta": consulta, **extra}, headers=HEADERS)
    assert response.status_code == 200, response.text
    return response.json()


def vehiculos_de(body: dict) -> list:
    por_id = {v.id: v for v in inventario_base().vehiculos}
    return [por_id[r["id"]] for r in body["resultados"]]


# --- API -------------------------------------------------------------------

def test_health(client):
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["vehiculosIndexados"] == 8


def test_search_requires_api_key(client):
    assert client.post("/search", json={"consulta": "suv familiar"}).status_code == 401
    wrong = client.post("/search", json={"consulta": "suv familiar"}, headers={"X-Api-Key": "otra"})
    assert wrong.status_code == 401
    assert client.post("/index/rebuild").status_code == 401


def test_query_validation(client):
    assert client.post("/search", json={"consulta": "a"}, headers=HEADERS).status_code == 422


def test_bedrock_without_api_key_refuses_to_start():
    with pytest.raises(RuntimeError):
        create_app(Settings(use_mock=False, api_key=""), ai=MockAI())


def test_provider_error_is_generic():
    class FallingAI(MockAI):
        def extract_filters(self, *args):
            raise RuntimeError("AccessDeniedException arn:aws:bedrock:us-east-1:123456789012")

    with cliente(ai=FallingAI()) as c:
        response = c.post("/search", json={"consulta": "suv familiar"}, headers=HEADERS)
    assert response.status_code == 502
    assert "arn:aws" not in response.text


def test_inventory_down_at_startup_retries_on_search():
    intentos = {"n": 0}

    def loader():
        intentos["n"] += 1
        if intentos["n"] == 1:
            raise InventoryError("Next no respondió")
        return inventario_base()

    with cliente(loader=loader) as c:
        assert c.get("/health").json()["vehiculosIndexados"] == 0
        assert buscar(c, "suv familiar")["resultados"]


def test_inventory_down_returns_503():
    def loader():
        raise InventoryError("Next no respondió")

    with cliente(loader=loader) as c:
        response = c.post("/search", json={"consulta": "suv familiar"}, headers=HEADERS)
    assert response.status_code == 503


# --- Filtros ---------------------------------------------------------------

def test_mock_extracts_filters():
    f = MockAI().extract_filters("SUV automática hasta 45 millones", ["suv", "sedan"], True)
    assert f.categoria == "suv"
    assert f.transmision == "AUTOMATICA"
    assert f.precio_max == 45_000_000


def test_mock_does_not_read_km_as_price():
    f = MockAI().extract_filters("usado con menos de 50 mil km", [], True)
    assert f.km_max == 50_000
    assert f.precio_max is None


def test_cvt_counts_as_automatic():
    corolla = next(v for v in inventario_base().vehiculos if v.id == "v002")
    assert matches_filters(corolla, SearchFilters(transmision="AUTOMATICA"))
    assert not matches_filters(corolla, SearchFilters(transmision="MANUAL"))


def test_invalid_llm_json_degrades_gracefully():
    assert parse_filters_json("esto no es json") == SearchFilters()
    assert parse_filters_json("[1, 2]") == SearchFilters()
    assert parse_filters_json('```json\n{"precio_max": 1000}\n```').precio_max == 1000


def test_invalid_field_does_not_drop_the_others():
    f = parse_filters_json('{"combustible": "nafta o diesel", "transmision": "automatica", "anio_min": 2020}')
    assert f.combustible is None
    assert f.transmision == "AUTOMATICA"
    assert f.anio_min == 2020


def test_unknown_category_is_dropped():
    f = adjust_filters(SearchFilters(categoria="coupe"), inventario_base())
    assert f.categoria is None
    assert adjust_filters(SearchFilters(categoria="SUV"), inventario_base()).categoria == "suv"


def test_usd_price_is_converted_with_exchange_rate():
    f = adjust_filters(SearchFilters(precio_max=30_000, moneda="USD"), inventario_base())
    assert f.precio_max == 30_000 * 1200
    assert f.moneda == "ARS"


def test_usd_price_without_exchange_rate_is_dropped():
    sin_cotizacion = inventario_base().model_copy(update={"cotizacion_dolar": None})
    f = adjust_filters(SearchFilters(precio_max=30_000, moneda="USD"), sin_cotizacion)
    assert f.precio_max is None


def test_unknown_price_does_not_pass_a_price_filter():
    auto = inventario_base().vehiculos[0].model_copy(update={"precio_ars": None})
    assert not matches_filters(auto, SearchFilters(precio_max=100_000_000))
    assert matches_filters(auto, SearchFilters())


# --- Búsqueda --------------------------------------------------------------

def test_search_respects_hard_filters(client):
    body = buscar(client, "SUV automática familiar hasta 45 millones")
    vehiculos = vehiculos_de(body)
    assert vehiculos, "debería encontrar al menos una SUV"
    for v in vehiculos:
        assert v.categoria == "suv"
        assert v.precio_ars <= 45_000_000
        assert v.transmision in ("AUTOMATICA", "CVT")
    # La RAV4 (45,6M) queda afuera.
    assert "v003" not in {r["id"] for r in body["resultados"]}


def test_search_returns_every_match_ordered(client):
    body = buscar(client, "auto familiar para ruta")
    assert len(body["resultados"]) == 8  # sin filtros, todo el stock, ordenado
    scores = [r["score"] for r in body["resultados"]]
    assert scores == sorted(scores, reverse=True)


def test_response_uses_camel_case(client):
    body = buscar(client, "SUV hasta 45 millones")
    assert body["filtros"]["precioMax"] == 45_000_000
    assert "precio_max" not in body["filtros"]


def test_no_results_does_not_hallucinate(client):
    body = buscar(client, "pickup hasta 5 millones", conRespuesta=True)
    assert body["resultados"] == []
    assert "No encontramos" in body["respuesta"]


def test_hidden_prices_disable_price_filters_and_answer():
    oculto = inventario_base().model_copy(update={"precios_visibles": False})
    with cliente(loader=lambda: oculto) as c:
        body = buscar(c, "SUV hasta 40 millones", conRespuesta=True)
    assert body["filtros"]["precioMax"] is None
    # Sin el filtro, la RAV4 de 45,6M aparece: el precio no pudo recortar nada.
    assert "v003" in {r["id"] for r in body["resultados"]}
    assert "$" not in body["respuesta"]


# --- Caché de embeddings ---------------------------------------------------

class CountingAI(MockAI):
    def __init__(self):
        self.embedded: list[str] = []

    def embed(self, text):
        self.embedded.append(text)
        return super().embed(text)


def test_rebuild_only_embeds_changed_vehicles():
    inventario = inventario_base()
    ai = CountingAI()
    service = VehicleSearchService(ai=ai, cache=InMemoryEmbeddingCache(), loader=lambda: inventario)

    assert service.rebuild() == 8
    assert len(ai.embedded) == 8

    # Reindexar sin cambios no llama al modelo.
    service.rebuild()
    assert len(ai.embedded) == 8

    # Editar una descripción recalcula solo esa unidad.
    editados = [v.model_copy(update={"descripcion": "Recién service"}) if v.id == "v001" else v
                for v in inventario.vehiculos]
    inventario = inventario.model_copy(update={"vehiculos": editados})
    service.rebuild()
    assert len(ai.embedded) == 9
    assert "Recién service" in ai.embedded[-1]


def test_price_change_does_not_reembed():
    inventario = inventario_base()
    ai = CountingAI()
    service = VehicleSearchService(ai=ai, cache=InMemoryEmbeddingCache(), loader=lambda: inventario)
    service.rebuild()

    # Cambia la cotización y con ella todos los precios en pesos: no es texto del embedding.
    repreciados = [v.model_copy(update={"precio_ars": v.precio_ars * 2}) for v in inventario.vehiculos]
    inventario = inventario.model_copy(update={"vehiculos": repreciados})
    service.rebuild()
    assert len(ai.embedded) == 8
    body = service.search(SearchRequest(consulta="SUV hasta 45 millones"))
    assert body.resultados == []  # los precios nuevos sí se aplican
