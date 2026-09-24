"""
Capa de IA.

Hay dos implementaciones con la misma interfaz (AIProvider):
  - BedrockAI: llama a Amazon Bedrock de verdad (Titan Embeddings + un LLM).
  - MockAI:    simula todo localmente para estudiar y testear sin AWS ni costos.

El resto de la app solo conoce la interfaz, no la implementación
(mismo principio que inyectar una interfaz en ASP.NET).
"""
import hashlib
import json
import math
import re
import unicodedata
from typing import Protocol

from pydantic import ValidationError

from .config import Settings
from .prompts import ANSWER_SYSTEM, build_answer_prompt, build_filter_system
from .schemas import SearchFilters, Vehicle


class AIProvider(Protocol):
    # Identifica el espacio de vectores (modelo + dimensiones). Entra en la
    # clave de la caché: un embedding de otro modelo no se puede comparar.
    embedding_id: str

    def embed(self, text: str) -> list[float]: ...
    def extract_filters(self, query: str, categorias: list[str],
                        precios_visibles: bool) -> SearchFilters: ...
    def generate_answer(self, query: str, vehicles: list[Vehicle],
                        precios_visibles: bool) -> str: ...


# ---------------------------------------------------------------------------
# Helpers compartidos
# ---------------------------------------------------------------------------

def format_ars(amount: int) -> str:
    return "$ " + f"{amount:,}".replace(",", ".")


def vehicles_to_context(vehicles: list[Vehicle], precios_visibles: bool) -> str:
    """Arma el 'contexto' del RAG: el LLM solo puede responder con esto.
    Con los precios ocultos el importe no entra al contexto: lo que el modelo
    no ve, no lo puede repetir."""
    lineas = []
    for v in vehicles:
        linea = (f"- [{v.id}] {v.marca} {v.modelo} {v.version or ''} {v.anio}, "
                 f"{v.kilometraje} km, {(v.transmision or '').lower()}, "
                 f"{(v.combustible or '').lower()}, {v.estado.lower()}.")
        if precios_visibles and v.precio_ars is not None:
            linea += f" Precio: {format_ars(v.precio_ars)}."
        lineas.append(linea)
    return "\n".join(lineas)


def parse_filters_json(raw: str) -> SearchFilters:
    """Los LLM a veces envuelven el JSON en ```json ... ```. Lo limpiamos y
    validamos campo por campo: un valor inválido (p. ej. "combustible": "nafta
    o diesel") se descarta solo, sin llevarse puestos los demás filtros. Si el
    JSON entero no se puede leer, devolvemos filtros vacíos: la búsqueda sigue
    funcionando solo con similitud semántica (degradación elegante, no error 500)."""
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        return SearchFilters()
    if not isinstance(data, dict):
        return SearchFilters()

    validos = {}
    for clave, valor in data.items():
        if valor is None:
            continue
        try:
            SearchFilters.model_validate({clave: valor})
        except ValidationError:
            continue
        validos[clave] = valor
    return SearchFilters.model_validate(validos)


# ---------------------------------------------------------------------------
# Implementación real: Amazon Bedrock
# ---------------------------------------------------------------------------

class BedrockAI:
    def __init__(self, settings: Settings):
        import boto3  # import local: el modo mock no necesita credenciales

        self.settings = settings
        self.embedding_id = f"{settings.embedding_model_id}:{settings.embedding_dimensions}"
        # boto3 toma las credenciales de la cadena estándar de AWS:
        # variables de entorno, ~/.aws/credentials o el rol IAM (Lambda/ECS).
        self.client = boto3.client("bedrock-runtime", region_name=settings.aws_region)

    def embed(self, text: str) -> list[float]:
        body = json.dumps({
            "inputText": text,
            "dimensions": self.settings.embedding_dimensions,
            "normalize": True,  # vectores de longitud 1 -> coseno = producto punto
        })
        response = self.client.invoke_model(
            modelId=self.settings.embedding_model_id,
            body=body,
            contentType="application/json",
            accept="application/json",
        )
        return json.loads(response["body"].read())["embedding"]

    def _converse(self, system: str, user: str, temperature: float, max_tokens: int) -> str:
        # Converse API: interfaz unificada de Bedrock para cualquier modelo de chat
        # (Claude, Nova, Llama...). Cambiar de modelo = cambiar LLM_MODEL_ID.
        response = self.client.converse(
            modelId=self.settings.llm_model_id,
            system=[{"text": system}],
            messages=[{"role": "user", "content": [{"text": user}]}],
            inferenceConfig={"temperature": temperature, "maxTokens": max_tokens},
        )
        return response["output"]["message"]["content"][0]["text"]

    def extract_filters(self, query: str, categorias: list[str],
                        precios_visibles: bool) -> SearchFilters:
        # Temperatura 0: queremos una salida determinística y estructurada.
        system = build_filter_system(categorias, precios_visibles)
        raw = self._converse(system, query, temperature=0.0, max_tokens=300)
        return parse_filters_json(raw)

    def generate_answer(self, query: str, vehicles: list[Vehicle],
                        precios_visibles: bool) -> str:
        # Temperatura baja pero no 0: tono natural sin inventar datos.
        prompt = build_answer_prompt(query, vehicles_to_context(vehicles, precios_visibles))
        return self._converse(ANSWER_SYSTEM, prompt, temperature=0.3, max_tokens=400)


# ---------------------------------------------------------------------------
# Implementación simulada (sin AWS)
# ---------------------------------------------------------------------------

def _normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text.lower())
    return "".join(c for c in text if not unicodedata.combining(c))


_MULTIPLICADORES = {"millones": 1_000_000, "millon": 1_000_000, "m": 1_000_000,
                    "mil": 1_000, "k": 1_000}


class MockAI:
    """No es inteligencia real: sirve para correr el flujo completo y los tests.
    - embed: 'bolsa de palabras' con hashing (parecido por palabras en común).
    - extract_filters: reglas con regex en lugar de un LLM."""

    DIMENSIONS = 256
    embedding_id = f"mock:{DIMENSIONS}"

    def embed(self, text: str) -> list[float]:
        vector = [0.0] * self.DIMENSIONS
        for token in re.findall(r"[a-z0-9]+", _normalize(text)):
            if len(token) < 3:
                continue
            index = int(hashlib.md5(token.encode()).hexdigest(), 16) % self.DIMENSIONS
            vector[index] += 1.0
        norm = math.sqrt(sum(v * v for v in vector)) or 1.0
        return [v / norm for v in vector]

    def extract_filters(self, query: str, categorias: list[str],
                        precios_visibles: bool) -> SearchFilters:
        q = _normalize(query)
        filters = SearchFilters()

        # "hasta 45 millones", "menos de 30 mil dolares". El (?!\s*km) evita
        # confundir "menos de 50 mil km" con un precio.
        price = re.search(
            r"(hasta|menos de|maximo|tope)\s*(?:u\$s|usd|\$)?\s*(\d+(?:[.,]\d+)?)\s*"
            r"(millones|millon|mil|m|k)\b(?!\s*km)", q)
        if price:
            amount = float(price.group(2).replace(",", "."))
            filters.precio_max = int(amount * _MULTIPLICADORES[price.group(3)])
            if re.search(r"dolar|usd|u\$s", q):
                filters.moneda = "USD"

        km = re.search(r"(hasta|menos de|maximo)\s*(\d+)\s*(mil)?\s*km", q)
        if km:
            filters.km_max = int(km.group(2)) * (1_000 if km.group(3) else 1)

        year = re.search(r"(desde|del|posterior a)\s*((?:19|20)\d{2})|((?:19|20)\d{2})\s*en adelante", q)
        if year:
            filters.anio_min = int(year.group(2) or year.group(3))

        if "automatic" in q or "cvt" in q:
            filters.transmision = "AUTOMATICA"
        elif "manual" in q:
            filters.transmision = "MANUAL"

        # Categorías dinámicas: alcanza con que el slug (o el slug sin guiones,
        # "pick-up" -> "pick up" / "pickup") aparezca en la búsqueda.
        for slug in categorias:
            variantes = {slug, slug.replace("-", " "), slug.replace("-", "")}
            if any(re.search(rf"\b{re.escape(_normalize(v))}\b", q) for v in variantes):
                filters.categoria = slug
                break

        for keyword, fuel in [("diesel", "DIESEL"), ("gasoil", "DIESEL"), ("hibrid", "HIBRIDO"),
                              ("electric", "ELECTRICO"), ("gnc", "GNC"), ("nafta", "NAFTA")]:
            if keyword in q:
                filters.combustible = fuel
                break

        if "0km" in q or "nuevo" in q:
            filters.estado = "NUEVO"
        elif "usado" in q:
            filters.estado = "USADO"

        return filters

    def generate_answer(self, query: str, vehicles: list[Vehicle],
                        precios_visibles: bool) -> str:
        if not vehicles:
            return "No encontramos unidades que coincidan. Probá ampliar el presupuesto o los criterios."
        top = vehicles[0]
        nombre = " ".join(p for p in (top.marca, top.modelo, top.version, str(top.anio)) if p)
        answer = f"Encontramos {len(vehicles)} opción(es). La que mejor coincide es el {nombre}"
        if precios_visibles and top.precio_ars is not None:
            answer += f" a {format_ars(top.precio_ars)}"
        return answer + "."


def get_ai_provider(settings: Settings) -> AIProvider:
    return MockAI() if settings.use_mock else BedrockAI(settings)
