"""
Punto de entrada de la API.

Correr:   uvicorn app.main:app --reload
Docs:     http://localhost:8000/docs  (Swagger generado automáticamente)

La API no está pensada para el navegador: solo la llama el servidor de Next,
con la clave en `X-Api-Key`. Por eso no hay CORS.
"""
import hmac
import logging
from contextlib import asynccontextmanager
from typing import Callable, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Request

from .ai_provider import AIProvider, get_ai_provider
from .config import Settings
from .embedding_cache import EmbeddingCache, InMemoryEmbeddingCache
from .inventory import InventoryError, load_inventory
from .schemas import Inventario, SearchRequest, SearchResponse
from .search_service import VehicleSearchService

logger = logging.getLogger("ai_search")


def create_app(settings: Optional[Settings] = None,
               ai: Optional[AIProvider] = None,
               cache: Optional[EmbeddingCache] = None,
               loader: Optional[Callable[[], Inventario]] = None) -> FastAPI:
    """Fábrica de la app: en producción todo sale de las variables de entorno,
    y los tests pasan sus propias piezas (un proveedor que falla, otro inventario)."""
    settings = settings or Settings.from_env()

    # Sin clave, cualquiera que encuentre la URL gastaría tokens a nuestro nombre.
    # En modo mock no hay nada que gastar y se permite, para desarrollar cómodo.
    if not settings.api_key and not settings.use_mock:
        raise RuntimeError("Falta API_KEY: con Bedrock real el servicio no arranca sin clave.")

    service = VehicleSearchService(
        ai=ai or get_ai_provider(settings),
        cache=cache or InMemoryEmbeddingCache(),
        loader=loader or (lambda: load_inventory(settings)),
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        """Se ejecuta al iniciar el servidor (como el startup de Program.cs):
        carga el inventario y construye el índice vectorial. Si falla, el
        servicio arranca igual y reintenta en la primera búsqueda."""
        try:
            service.rebuild()
        except Exception:
            logger.exception("No se pudo armar el índice al arrancar")
        yield

    app = FastAPI(
        title="Concesionario AI Search",
        description="Búsqueda de vehículos en lenguaje natural con Amazon Bedrock.",
        version="0.2.0",
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.search_service = service

    def require_api_key(x_api_key: Optional[str] = Header(None)) -> None:
        if not settings.api_key:
            return
        # compare_digest compara en tiempo constante: no deja adivinar la clave
        # midiendo cuánto tarda en fallar.
        if not x_api_key or not hmac.compare_digest(x_api_key, settings.api_key):
            raise HTTPException(status_code=401, detail="No autorizado")

    def get_search_service(request: Request) -> VehicleSearchService:
        """Inyección de dependencias de FastAPI: los endpoints piden el servicio."""
        return request.app.state.search_service

    @app.get("/health")
    def health(service: VehicleSearchService = Depends(get_search_service)):
        return {"status": "ok", "mock": settings.use_mock, "vehiculosIndexados": service.indexed}

    # Endpoints con 'def' (no 'async def') a propósito: boto3 es bloqueante,
    # y FastAPI ejecuta las funciones 'def' en un thread pool sin frenar el servidor.
    #
    # Los errores devuelven un mensaje genérico: el detalle (ARN, región, modelo,
    # permisos) va al log, no a quien llama.
    @app.post("/search", response_model=SearchResponse, dependencies=[Depends(require_api_key)])
    def search(request: SearchRequest, service: VehicleSearchService = Depends(get_search_service)):
        try:
            return service.search(request)
        except InventoryError:
            logger.exception("Inventario no disponible")
            raise HTTPException(status_code=503, detail="Inventario no disponible")
        except Exception:  # p. ej. botocore ClientError: throttling, permisos, modelo no habilitado
            logger.exception("Error del proveedor de IA")
            raise HTTPException(status_code=502, detail="Error del proveedor de IA")

    @app.post("/index/rebuild", dependencies=[Depends(require_api_key)])
    def rebuild_index(service: VehicleSearchService = Depends(get_search_service)):
        """Llamar cuando cambia el inventario (alta, baja o edición de un vehículo,
        o un cambio de cotización o de categorías)."""
        try:
            return {"vehiculosIndexados": service.rebuild()}
        except InventoryError:
            logger.exception("Inventario no disponible")
            raise HTTPException(status_code=503, detail="Inventario no disponible")
        except Exception:
            logger.exception("Error al reindexar")
            raise HTTPException(status_code=502, detail="Error del proveedor de IA")

    return app


app = create_app()
