"""
Lógica de negocio: búsqueda HÍBRIDA.

  1. El LLM convierte el texto libre en filtros duros (precio, año, caja...).
  2. Se ajustan esos filtros a lo que el sitio permite (categorías existentes,
     precios visibles, moneda) y se descartan los vehículos que no cumplen.
  3. Los que quedan se ordenan por similitud semántica (embeddings).
  4. Opcional: el LLM redacta una respuesta usando SOLO esos resultados (RAG).

¿Por qué híbrida? Los embeddings son buenos para "familiar", "cómodo", "para ruta",
pero malos para restricciones exactas como "hasta 40 millones". Los filtros cubren eso.
"""
import threading
from dataclasses import dataclass, field
from typing import Callable

from .ai_provider import AIProvider
from .embedding_cache import EmbeddingCache, cache_key
from .schemas import (Inventario, SearchFilters, SearchRequest, SearchResponse,
                      SearchResult, Vehicle)
from .vector_store import InMemoryVectorStore

AUTOMATIC_TRANSMISSIONS = {"AUTOMATICA", "CVT"}


def adjust_filters(filters: SearchFilters, inventario: Inventario) -> SearchFilters:
    """Lo que dice el LLM es una propuesta; lo que se aplica lo decide el código.

    - Una categoría que no existe se descarta: el modelo puede inventar "coupe"
      aunque el concesionario no la tenga, y filtrar por ella vaciaría la grilla.
    - Con los precios ocultos no se filtra por precio: "hasta 30 millones"
      dejaría adivinar cuánto sale cada unidad, que es lo que el sitio decidió no
      mostrar. Es la misma regla que en Next impide ordenar por precio.
    - Un precio en dólares se pasa a pesos con la cotización del sitio. Sin
      cotización no hay forma de compararlo, y se descarta.
    """
    f = filters.model_copy()

    if f.categoria is not None:
        por_minuscula = {c.lower(): c for c in inventario.categorias}
        f.categoria = por_minuscula.get(f.categoria.strip().lower())

    if not inventario.precios_visibles:
        f.precio_min = f.precio_max = None
    elif f.moneda == "USD":
        cotizacion = inventario.cotizacion_dolar
        if cotizacion:
            f.precio_min = round(f.precio_min * cotizacion) if f.precio_min is not None else None
            f.precio_max = round(f.precio_max * cotizacion) if f.precio_max is not None else None
        else:
            f.precio_min = f.precio_max = None
    f.moneda = "ARS"

    return f


def matches_filters(vehicle: Vehicle, f: SearchFilters) -> bool:
    # Sin precio conocido no se puede afirmar que entra en el presupuesto:
    # ante un filtro de precio, la unidad queda afuera.
    if f.precio_max is not None and (vehicle.precio_ars is None or vehicle.precio_ars > f.precio_max):
        return False
    if f.precio_min is not None and (vehicle.precio_ars is None or vehicle.precio_ars < f.precio_min):
        return False
    if f.anio_min is not None and vehicle.anio < f.anio_min:
        return False
    if f.km_max is not None and vehicle.kilometraje > f.km_max:
        return False
    if f.categoria and vehicle.categoria.lower() != f.categoria.lower():
        return False
    if f.combustible and vehicle.combustible != f.combustible:
        return False
    if f.estado and vehicle.estado != f.estado:
        return False
    if f.transmision:
        is_auto = vehicle.transmision in AUTOMATIC_TRANSMISSIONS
        if (f.transmision == "AUTOMATICA") != is_auto:
            return False
    return True


@dataclass(frozen=True)
class _Index:
    """Todo lo que usa una búsqueda, junto. Se reemplaza entero al reindexar,
    así una búsqueda que corre en paralelo nunca mezcla el inventario nuevo con
    los vectores viejos."""
    inventario: Inventario
    vehicles: dict[str, Vehicle]
    store: InMemoryVectorStore = field(default_factory=InMemoryVectorStore)


class VehicleSearchService:
    def __init__(self, ai: AIProvider, cache: EmbeddingCache,
                 loader: Callable[[], Inventario]):
        self.ai = ai
        self.cache = cache
        self.loader = loader
        self._index: _Index | None = None
        self._lock = threading.Lock()

    @property
    def indexed(self) -> int:
        return len(self._index.store) if self._index else 0

    def rebuild(self) -> int:
        """Pide el inventario y arma el índice. Solo se embeddean las unidades
        cuyo texto no está en la caché: reindexar después de editar una unidad
        cuesta un embedding, no uno por cada auto del stock."""
        with self._lock:
            inventario = self.loader()
            vehicles = {v.id: v for v in inventario.vehiculos}
            ids = list(vehicles)
            keys = [cache_key(self.ai.embedding_id, vehicles[i].to_search_text()) for i in ids]

            cached = self.cache.get_many(keys)
            missing = {k: vehicles[i].to_search_text() for i, k in zip(ids, keys) if k not in cached}
            computed = {k: self.ai.embed(text) for k, text in missing.items()}
            if computed:
                self.cache.put_many(computed)

            vectors = {**cached, **computed}
            index = _Index(inventario=inventario, vehicles=vehicles)
            index.store.build(ids, [vectors[k] for k in keys])
            self._index = index
            return len(ids)

    def ensure_loaded(self) -> None:
        """El índice se arma al arrancar; si en ese momento Next no respondió,
        se reintenta con la primera búsqueda en vez de quedar vacío para siempre."""
        if self._index is None:
            self.rebuild()

    def search(self, request: SearchRequest) -> SearchResponse:
        self.ensure_loaded()
        index = self._index
        inventario = index.inventario

        raw_filters = self.ai.extract_filters(
            request.consulta, inventario.categorias, inventario.precios_visibles)
        filters = adjust_filters(raw_filters, inventario)

        allowed_ids = {vid for vid, v in index.vehicles.items() if matches_filters(v, filters)}

        results: list[SearchResult] = []
        if allowed_ids:
            query_vector = self.ai.embed(request.consulta)
            ranked = index.store.search(query_vector, allowed_ids=allowed_ids)
            results = [SearchResult(id=vid, score=round(score, 4)) for vid, score in ranked]

        answer = None
        if request.con_respuesta:
            # Si no hay resultados, el LLM recibe contexto vacío y debe decirlo:
            # así evitamos que "invente" un auto que no está en stock.
            answer = self.ai.generate_answer(
                request.consulta,
                [index.vehicles[r.id] for r in results[:5]],
                inventario.precios_visibles,
            )

        return SearchResponse(consulta=request.consulta, filtros=filters,
                              resultados=results, respuesta=answer)
