"""
Modelos de datos con Pydantic.
Cumplen el rol de los DTOs en C#: validan la entrada de la API y
documentan la salida (FastAPI los usa para generar /docs automáticamente).

Los campos del dominio copian los del schema de Prisma del concesionario
(`marca`, `anio`, `kilometraje`...) y los valores de los enums van igual que
allá (`NAFTA`, `AUTOMATICA`, `USADO`). Así Next manda y recibe sus propios
datos sin traducir nada. En Python se escriben en snake_case y en el JSON viajan
en camelCase (`precio_ars` <-> `precioArs`), como el resto del proyecto en TS.
"""
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

Combustible = Literal["NAFTA", "DIESEL", "ELECTRICO", "HIBRIDO", "GNC"]
Transmision = Literal["MANUAL", "AUTOMATICA", "CVT"]
EstadoVehiculo = Literal["NUEVO", "USADO"]
Moneda = Literal["ARS", "USD"]


class ApiModel(BaseModel):
    # populate_by_name: acepta tanto `precioArs` (lo que manda Next) como
    # `precio_ars` (lo que escribe el LLM siguiendo el prompt).
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Vehicle(ApiModel):
    id: str
    marca: str
    modelo: str
    version: Optional[str] = None
    anio: int
    categoria: str  # slug de la tabla `categorias`; la lista la define el admin
    combustible: Optional[Combustible] = None
    transmision: Optional[Transmision] = None
    estado: EstadoVehiculo
    kilometraje: int
    # Next lo manda ya convertido a pesos con la cotización del sitio. Es None
    # cuando no se puede saber: unidad en dólares sin cotización cargada, o el
    # sitio con los precios ocultos (en ese caso no viaja ninguno).
    precio_ars: Optional[int] = None
    descripcion: Optional[str] = None

    def to_search_text(self) -> str:
        """Texto que se convierte en embedding. Lo que incluyas acá define
        qué 'entiende' la búsqueda semántica sobre cada vehículo.

        El precio queda afuera a propósito: se filtra con reglas, no por
        parecido, y como cambia con la cotización obligaría a recalcular el
        embedding de cada unidad en dólares cada vez que se actualiza el dólar."""
        partes = [
            f"{self.marca} {self.modelo} {self.version or ''} {self.anio}.",
            f"Categoría: {self.categoria}.",
        ]
        if self.combustible:
            partes.append(f"Combustible: {self.combustible.lower()}.")
        if self.transmision:
            partes.append(f"Transmisión: {self.transmision.lower()}.")
        partes.append(f"Estado: {self.estado.lower()}, {self.kilometraje} km.")
        if self.descripcion:
            partes.append(self.descripcion)
        return " ".join(partes)


class Inventario(ApiModel):
    """Lo que Next expone en su endpoint interno: el stock publicado y el
    contexto que hace falta para interpretarlo."""
    categorias: list[str]
    precios_visibles: bool = True
    cotizacion_dolar: Optional[float] = None
    vehiculos: list[Vehicle]


class SearchFilters(ApiModel):
    """Filtros duros que el LLM extrae del lenguaje natural.
    None = el usuario no lo mencionó, así que no se filtra por eso."""
    precio_max: Optional[int] = Field(None, ge=0)
    precio_min: Optional[int] = Field(None, ge=0)
    # En qué moneda expresó el cliente el precio. El servicio lo pasa a pesos
    # antes de filtrar, así que en la respuesta siempre vuelve "ARS".
    moneda: Moneda = "ARS"
    anio_min: Optional[int] = Field(None, ge=1900, le=2100)
    km_max: Optional[int] = Field(None, ge=0)
    categoria: Optional[str] = Field(None, max_length=60)
    combustible: Optional[Combustible] = None
    # CVT no es una opción de búsqueda: para quien busca, es automática.
    transmision: Optional[Literal["MANUAL", "AUTOMATICA"]] = None
    estado: Optional[EstadoVehiculo] = None

    @field_validator("moneda", "combustible", "transmision", "estado", mode="before")
    @classmethod
    def _mayusculas(cls, value):
        # El LLM a veces contesta "automatica" en vez de "AUTOMATICA".
        return value.strip().upper() if isinstance(value, str) else value


class SearchRequest(ApiModel):
    consulta: str = Field(..., min_length=3, max_length=300,
                          examples=["SUV automática familiar hasta 45 millones"])
    con_respuesta: bool = Field(
        False,
        description="Si es true, el LLM redacta una respuesta basada solo en los resultados (RAG).",
    )


class SearchResult(ApiModel):
    # Solo el id: Next vuelve a leer la unidad de su base, que es la fuente de
    # verdad (imágenes, estado de publicación, precio vigente).
    id: str
    score: float = Field(..., description="Similitud coseno entre la búsqueda y el vehículo.")


class SearchResponse(ApiModel):
    consulta: str
    filtros: SearchFilters
    # Todas las unidades que pasan los filtros, de la más a la menos parecida.
    # Next pagina sobre esta lista.
    resultados: list[SearchResult]
    respuesta: Optional[str] = None
