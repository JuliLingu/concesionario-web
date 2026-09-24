"""
Vector store en memoria con NumPy.

Para aprender es ideal: se ve exactamente qué hace una base vectorial.
En producción se reemplaza por OpenSearch Serverless, una Bedrock Knowledge Base
o pgvector, que hacen lo mismo pero indexado y escalable (búsqueda aproximada, ANN).
Con el stock de una concesionaria (decenas o cientos de unidades) comparar
contra todos es instantáneo y no hace falta nada de eso.
"""
import numpy as np


class InMemoryVectorStore:
    def __init__(self) -> None:
        self._ids: list[str] = []
        self._matrix: np.ndarray | None = None  # una fila por vehículo

    def build(self, ids: list[str], vectors: list[list[float]]) -> None:
        if not ids:
            self._ids, self._matrix = [], None
            return
        matrix = np.array(vectors, dtype=np.float32)
        # Normalizamos cada fila: así la similitud coseno es solo un producto punto.
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        self._matrix = matrix / norms
        self._ids = ids

    def search(self, query_vector: list[float], top_k: int | None = None,
               allowed_ids: set[str] | None = None) -> list[tuple[str, float]]:
        """Ids ordenados de mayor a menor similitud. Sin `top_k`, todos."""
        if self._matrix is None or not self._ids:
            return []

        query = np.array(query_vector, dtype=np.float32)
        query /= (np.linalg.norm(query) or 1.0)

        # Similitud coseno contra todos los vehículos de una sola vez.
        scores = self._matrix @ query

        ranked = [
            (self._ids[i], float(scores[i]))
            for i in np.argsort(-scores, kind="stable")  # de mayor a menor similitud
            if allowed_ids is None or self._ids[i] in allowed_ids
        ]
        return ranked if top_k is None else ranked[:top_k]

    def __len__(self) -> int:
        return len(self._ids)
