"""
De dónde sale el stock.

La base del concesionario es la fuente de verdad y este servicio no se conecta
a ella: le pide el inventario a Next por un endpoint interno. Así la regla de
qué se publica, la conversión de dólares a pesos y la decisión de mostrar o no
los precios viven en un solo lugar (Next), y acá no hace falta ninguna
credencial de la base.

Sin `INVENTORY_URL` se lee el archivo local: es lo que usan los tests y el
desarrollo en modo mock.
"""
import urllib.request
from pathlib import Path

from .config import Settings
from .schemas import Inventario


class InventoryError(Exception):
    """No se pudo obtener el inventario (Next caído, secreto incorrecto, JSON inválido)."""


def load_inventory(settings: Settings) -> Inventario:
    try:
        if settings.inventory_url:
            request = urllib.request.Request(
                settings.inventory_url,
                headers={
                    "Accept": "application/json",
                    "Authorization": f"Bearer {settings.inventory_secret}",
                },
            )
            with urllib.request.urlopen(request, timeout=10) as response:
                return Inventario.model_validate_json(response.read())
        return Inventario.model_validate_json(Path(settings.data_path).read_text(encoding="utf-8"))
    except Exception as exc:
        raise InventoryError(str(exc)) from exc
