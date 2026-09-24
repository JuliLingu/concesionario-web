"""
Caché de embeddings.

Calcular un embedding cuesta una llamada a Bedrock. El texto de una unidad
casi nunca cambia entre un reindexado y el siguiente, así que se guarda el
vector por el hash de su texto: al reindexar solo se embeddean las unidades
nuevas o editadas.

La clave incluye el modelo y las dimensiones (`embedding_id`): si se cambia
de modelo, los vectores viejos dejan de coincidir y se recalculan solos.

Hoy vive en memoria. En Lambda se reemplaza por DynamoDB con la misma interfaz,
para que un arranque en frío no vuelva a pagar todo el stock.
"""
import hashlib
from typing import Protocol


def cache_key(embedding_id: str, text: str) -> str:
    return hashlib.sha256(f"{embedding_id}\n{text}".encode("utf-8")).hexdigest()


class EmbeddingCache(Protocol):
    def get_many(self, keys: list[str]) -> dict[str, list[float]]: ...
    def put_many(self, items: dict[str, list[float]]) -> None: ...


class InMemoryEmbeddingCache:
    def __init__(self) -> None:
        self._items: dict[str, list[float]] = {}

    def get_many(self, keys: list[str]) -> dict[str, list[float]]:
        return {k: self._items[k] for k in keys if k in self._items}

    def put_many(self, items: dict[str, list[float]]) -> None:
        self._items.update(items)

    def __len__(self) -> int:
        return len(self._items)
