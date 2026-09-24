"""
Configuración centralizada.
Equivalente a appsettings.json + IOptions en ASP.NET: todo lo que cambia
entre entornos (región, modelos, modo mock) sale de variables de entorno.

Los valores se leen en `from_env()` y no como defaults de la dataclass: un
default se evalúa una sola vez al importar el módulo, y los tests necesitan
armar configuraciones distintas sin tocar el entorno.
"""
import os
from dataclasses import dataclass

from dotenv import load_dotenv


def _as_bool(value: str) -> bool:
    return str(value).strip().lower() in ("1", "true", "yes")


@dataclass(frozen=True)
class Settings:
    use_mock: bool = True
    aws_region: str = "us-east-1"
    embedding_model_id: str = "amazon.titan-embed-text-v2:0"
    # Titan V2 acepta 256, 512 o 1024 dimensiones. Menos dimensiones = más barato
    # y rápido de comparar, con algo de pérdida de precisión.
    embedding_dimensions: int = 512
    llm_model_id: str = "us.anthropic.claude-haiku-4-5-20251001-v1:0"
    # Clave que Next manda en `X-Api-Key`. Vacía solo se admite en modo mock.
    api_key: str = ""
    # De dónde sale el inventario. Con URL, se pide al endpoint interno de Next
    # autenticando con el secreto; sin URL, se lee el archivo local.
    inventory_url: str = ""
    inventory_secret: str = ""
    data_path: str = "data/inventario.json"
    # Tabla de DynamoDB para la caché de embeddings. Vacía = caché en memoria.
    embedding_cache_table: str = ""

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv()
        return cls(
            use_mock=_as_bool(os.getenv("USE_MOCK", "true")),
            aws_region=os.getenv("AWS_REGION", cls.aws_region),
            embedding_model_id=os.getenv("EMBEDDING_MODEL_ID", cls.embedding_model_id),
            embedding_dimensions=int(os.getenv("EMBEDDING_DIMENSIONS", cls.embedding_dimensions)),
            llm_model_id=os.getenv("LLM_MODEL_ID", cls.llm_model_id),
            api_key=os.getenv("API_KEY", ""),
            inventory_url=os.getenv("INVENTORY_URL", ""),
            inventory_secret=os.getenv("INVENTORY_SECRET", ""),
            data_path=os.getenv("DATA_PATH", cls.data_path),
            embedding_cache_table=os.getenv("EMBEDDING_CACHE_TABLE", ""),
        )
