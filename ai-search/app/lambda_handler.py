"""
Punto de entrada en AWS Lambda.

Mangum traduce el evento de la Function URL a una request ASGI para FastAPI, así
que la misma app corre igual en uvicorn (desarrollo) y en Lambda (producción).

El lifespan de FastAPI queda apagado (`lifespan="off"`): Mangum lo ejecuta en
cada invocación, y el lifespan arma el índice, así que cada búsqueda volvería a
pedir el inventario. En su lugar, el índice se arma acá, al importar el módulo.
Eso pasa una sola vez por contenedor, en la fase de inicialización de Lambda,
y los contenedores tibios lo reutilizan.
"""
import logging

from mangum import Mangum

from .main import create_app

logging.getLogger().setLevel(logging.INFO)
logger = logging.getLogger("ai_search")

app = create_app()

try:
    app.state.search_service.rebuild()
except Exception:
    # Si Next no respondió en el arranque, la primera búsqueda reintenta
    # (`ensure_loaded`). El contenedor no debe morir por eso.
    logger.exception("No se pudo armar el índice al iniciar la Lambda")

_asgi = Mangum(app, lifespan="off")


def handler(event, context):
    # El ping programado de EventBridge (ver template.yaml) no es una request
    # HTTP y Mangum no sabría qué hacer con él. Solo sirve para que el
    # contenedor siga tibio —con el índice ya armado— y la búsqueda del próximo
    # visitante no pague el arranque en frío.
    if event.get("source") == "aws.events":
        return {"indexados": app.state.search_service.indexed}
    return _asgi(event, context)
