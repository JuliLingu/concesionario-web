"""
Piezas de producción, probadas sin AWS: la caché en DynamoDB contra un cliente
falso que imita la API (incluido el lote a medio procesar que devuelve cuando
se queda sin capacidad), y el handler de Lambda con un evento real de Function URL.
"""
import json

from fastapi.testclient import TestClient

from app.config import Settings
from app.embedding_cache import DynamoDBEmbeddingCache
from app.main import create_app


class FakeDynamoDB:
    """Guarda en un dict. Con `throttle`, la primera llamada de cada tipo deja
    un elemento sin procesar, como hace DynamoDB al quedarse sin capacidad."""

    def __init__(self, throttle: bool = False):
        self.rows: dict[str, bytes] = {}
        self.throttle = throttle
        self.calls = {"get": 0, "write": 0}

    def batch_get_item(self, RequestItems):
        self.calls["get"] += 1
        (table, request), = RequestItems.items()
        keys = request["Keys"]
        assert len(keys) <= 100, "BatchGetItem acepta hasta 100 claves"
        pendientes = keys[:1] if self.throttle and self.calls["get"] == 1 else []
        servidas = [k for k in keys if k not in pendientes]
        return {
            "Responses": {table: [{"k": k["k"], "v": {"B": self.rows[k["k"]["S"]]}}
                                  for k in servidas if k["k"]["S"] in self.rows]},
            "UnprocessedKeys": {table: {"Keys": pendientes}} if pendientes else {},
        }

    def batch_write_item(self, RequestItems):
        self.calls["write"] += 1
        (table, requests), = RequestItems.items()
        assert len(requests) <= 25, "BatchWriteItem acepta hasta 25 elementos"
        pendientes = requests[:1] if self.throttle and self.calls["write"] == 1 else []
        for r in requests:
            if r not in pendientes:
                item = r["PutRequest"]["Item"]
                self.rows[item["k"]["S"]] = item["v"]["B"]
        return {"UnprocessedItems": {table: pendientes} if pendientes else {}}


def vectores(n: int) -> dict[str, list[float]]:
    return {f"clave-{i}": [float(i), 0.5, -1.25] for i in range(n)}


def test_dynamodb_cache_roundtrip_in_batches():
    fake = FakeDynamoDB()
    cache = DynamoDBEmbeddingCache("tabla", client=fake)

    datos = vectores(130)  # más de un lote de lectura y varios de escritura
    cache.put_many(datos)
    assert fake.calls["write"] == 6  # 130 / 25

    leidos = cache.get_many(list(datos) + ["no-existe"])
    assert leidos == datos  # float32 conserva exacto estos valores
    assert fake.calls["get"] == 2  # 131 / 100


def test_dynamodb_cache_retries_unprocessed(monkeypatch):
    monkeypatch.setattr("app.embedding_cache.time.sleep", lambda _: None)
    fake = FakeDynamoDB(throttle=True)
    cache = DynamoDBEmbeddingCache("tabla", client=fake)

    datos = vectores(3)
    cache.put_many(datos)
    assert len(fake.rows) == 3
    assert cache.get_many(list(datos)) == datos


def test_vector_is_stored_compactly():
    # 512 dimensiones en float32 = 2 KB; como números de DynamoDB serían ~5 KB.
    assert len(DynamoDBEmbeddingCache._encode([0.123456789] * 512)) == 2048


def test_docs_hidden_outside_mock():
    from app.ai_provider import MockAI
    from app.inventory import load_inventory

    inventario = load_inventory(Settings(data_path="data/inventario.json"))
    prod = create_app(Settings(use_mock=False, api_key="x" * 32), ai=MockAI(),
                      loader=lambda: inventario)
    with TestClient(prod) as c:
        assert c.get("/docs").status_code == 404
        assert c.get("/openapi.json").status_code == 404


def function_url_event(method: str, path: str, body: dict | None = None,
                       headers: dict | None = None) -> dict:
    """Evento de Lambda Function URL (formato de payload 2.0)."""
    return {
        "version": "2.0",
        "routeKey": "$default",
        "rawPath": path,
        "rawQueryString": "",
        "headers": {"content-type": "application/json", "host": "abc.lambda-url.us-east-1.on.aws",
                    **(headers or {})},
        "requestContext": {
            "http": {"method": method, "path": path, "protocol": "HTTP/1.1",
                     "sourceIp": "1.2.3.4", "userAgent": "test"},
            "domainName": "abc.lambda-url.us-east-1.on.aws",
            "requestId": "id", "routeKey": "$default", "stage": "$default",
        },
        "body": json.dumps(body) if body is not None else None,
        "isBase64Encoded": False,
    }


def test_lambda_handler_serves_search(monkeypatch):
    # El handler lee la configuración del entorno al importarse.
    monkeypatch.setenv("USE_MOCK", "true")
    monkeypatch.setenv("API_KEY", "clave-lambda")
    monkeypatch.setenv("INVENTORY_URL", "")
    monkeypatch.setenv("EMBEDDING_CACHE_TABLE", "")
    import importlib
    import app.lambda_handler as modulo
    modulo = importlib.reload(modulo)

    health = modulo.handler(function_url_event("GET", "/health"), None)
    assert health["statusCode"] == 200
    assert json.loads(health["body"])["vehiculosIndexados"] == 8  # índice armado al importar

    sin_clave = modulo.handler(function_url_event("POST", "/search", {"consulta": "suv familiar"}), None)
    assert sin_clave["statusCode"] == 401

    ping = modulo.handler({"source": "aws.events"}, None)
    assert ping == {"indexados": 8}

    ok = modulo.handler(function_url_event("POST", "/search", {"consulta": "suv hasta 45 millones"},
                                           {"x-api-key": "clave-lambda"}), None)
    assert ok["statusCode"] == 200
    assert json.loads(ok["body"])["filtros"]["categoria"] == "suv"
