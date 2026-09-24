"""
Caché de embeddings.

Calcular un embedding cuesta una llamada a Bedrock. El texto de una unidad
casi nunca cambia entre un reindexado y el siguiente, así que se guarda el
vector por el hash de su texto: al reindexar solo se embeddean las unidades
nuevas o editadas.

La clave incluye el modelo y las dimensiones (`embedding_id`): si se cambia
de modelo, los vectores viejos dejan de coincidir y se recalculan solos.

En desarrollo vive en memoria. En Lambda va a DynamoDB con la misma interfaz:
la memoria de una Lambda se pierde en cada arranque en frío, y sin una caché
persistente cada arranque volvería a pagar el embedding de todo el stock.
"""
import hashlib
import time
from array import array
from typing import Any, Protocol


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


class DynamoDBEmbeddingCache:
    """Una fila por texto: `k` (hash, clave de partición) y `v` (el vector).

    El vector se guarda como binario float32 y no como lista de números: un
    número de DynamoDB viaja como texto decimal, y 512 de ellos ocupan más del
    doble. El tamaño importa porque la tabla usa capacidad aprovisionada —la que
    entra en la capa gratuita— y cada KB escrito consume capacidad.

    Con poca capacidad aprovisionada DynamoDB puede devolver parte del lote sin
    procesar en lugar de fallar. Se reintenta eso con espera creciente; lo que no
    entre igual se descarta en silencio, porque es solo una caché: la próxima vez
    se recalcula.
    """

    # Límites de la API por llamada.
    MAX_GET = 100
    MAX_WRITE = 25
    REINTENTOS = 5

    def __init__(self, table_name: str, client: Any = None, region: str = "us-east-1"):
        if client is None:
            import boto3  # import local: los tests y el modo mock no lo necesitan
            client = boto3.client("dynamodb", region_name=region)
        self.client = client
        self.table = table_name

    @staticmethod
    def _encode(vector: list[float]) -> bytes:
        return array("f", vector).tobytes()

    @staticmethod
    def _decode(blob: bytes) -> list[float]:
        valores = array("f")
        valores.frombytes(blob)
        return valores.tolist()

    def get_many(self, keys: list[str]) -> dict[str, list[float]]:
        found: dict[str, list[float]] = {}
        unique = list(dict.fromkeys(keys))
        for i in range(0, len(unique), self.MAX_GET):
            request = {self.table: {"Keys": [{"k": {"S": k}} for k in unique[i:i + self.MAX_GET]]}}
            for intento in range(self.REINTENTOS):
                response = self.client.batch_get_item(RequestItems=request)
                for item in response.get("Responses", {}).get(self.table, []):
                    found[item["k"]["S"]] = self._decode(item["v"]["B"])
                request = response.get("UnprocessedKeys") or {}
                if not request:
                    break
                time.sleep(0.05 * 2 ** intento)
        return found

    def put_many(self, items: dict[str, list[float]]) -> None:
        entries = list(items.items())
        for i in range(0, len(entries), self.MAX_WRITE):
            request = {self.table: [
                {"PutRequest": {"Item": {"k": {"S": k}, "v": {"B": self._encode(v)}}}}
                for k, v in entries[i:i + self.MAX_WRITE]
            ]}
            for intento in range(self.REINTENTOS):
                response = self.client.batch_write_item(RequestItems=request)
                request = response.get("UnprocessedItems") or {}
                if not request:
                    break
                time.sleep(0.05 * 2 ** intento)


def get_embedding_cache(table_name: str, region: str) -> EmbeddingCache:
    """DynamoDB si hay tabla configurada; si no, memoria (desarrollo y tests)."""
    if table_name:
        return DynamoDBEmbeddingCache(table_name, region=region)
    return InMemoryEmbeddingCache()
