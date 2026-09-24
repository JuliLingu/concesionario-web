# Concesionario AI Search

Microservicio en **Python + FastAPI** que permite buscar vehículos en lenguaje natural
("SUV automática familiar hasta 45 millones") usando **Amazon Bedrock**.

Está pensado para correr al lado de la plataforma Next.js del concesionario: el frontend
le manda la búsqueda y recibe los vehículos ordenados por relevancia.

---

## 1. Cómo correrlo

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # por defecto USE_MOCK=true

uvicorn app.main:app --reload
```

Abrí **http://localhost:8000/docs** y probá `POST /search` desde Swagger.

Tests: `pytest -v`

### Modo mock vs. Bedrock real

| | `USE_MOCK=true` | `USE_MOCK=false` |
|---|---|---|
| Embeddings | Bolsa de palabras simulada | Amazon Titan Text Embeddings V2 |
| Filtros | Reglas con regex | LLM en Bedrock (Converse API) |
| Necesita AWS | No | Sí |
| Costo | $0 | Por token |

Para usar Bedrock real:

1. En la consola de AWS, entrá a **Bedrock → Model access** y habilitá Titan Text Embeddings V2 y el LLM que vayas a usar.
2. Verificá el ID exacto del modelo en el catálogo o en **Inference profiles**, y ponelo en `LLM_MODEL_ID`.
3. Configurá credenciales (`aws configure`) con un usuario o rol que tenga permiso `bedrock:InvokeModel`.
4. Generá una `API_KEY` (con Bedrock real el servicio no arranca sin ella).
5. Cambiá `USE_MOCK=false` y reiniciá.

En Swagger, las llamadas a `/search` y `/index/rebuild` necesitan el header
`X-Api-Key` si configuraste una clave. Ejemplo de cuerpo:

```json
{ "consulta": "SUV automática familiar hasta 45 millones", "conRespuesta": false }
```

---

## 2. Cómo funciona (flujo de una búsqueda)

```
"SUV automática familiar hasta 45 millones"
        │
        ▼
[1] LLM (temperatura 0) ─► filtros JSON: {categoria: suv, transmision: AUTOMATICA, precio_max: 45000000}
        │
        ▼
[2] adjust_filters ─► el código decide qué se aplica: categorías que existen,
        │             dólares a pesos, sin precio si el sitio oculta los precios
        ▼
[3] Filtros duros ─► descarta lo que no cumple (RAV4 a 45,6M queda afuera)
        │
        ▼
[4] Embedding de la búsqueda ─► similitud coseno contra los vehículos que quedaron
        │                      ─► devuelve TODOS los ids, ordenados (Next pagina)
        ▼
[5] (opcional) LLM redacta respuesta usando SOLO esos resultados  ◄── RAG
```

### Mapa de archivos

| Archivo | Qué hace | Equivalente en tu stack |
|---|---|---|
| `app/main.py` | Endpoints, API key, startup | Controllers + Program.cs / route handlers de Next |
| `app/inventory.py` | Pide el stock a Next (o lo lee del archivo) | Un cliente HTTP tipado |
| `app/embedding_cache.py` | No recalcula embeddings de texto que no cambió | Un caché con `IMemoryCache` |
| `app/schemas.py` | Validación de entrada y salida | DTOs en C# / tipos + Zod en TS |
| `app/config.py` | Variables de entorno | appsettings.json + IOptions |
| `app/ai_provider.py` | Llamadas a Bedrock (y mock) | Un servicio detrás de una interfaz |
| `app/vector_store.py` | Guarda vectores y busca por similitud | Lo que haría una base vectorial |
| `app/search_service.py` | Lógica de negocio (búsqueda híbrida) | Capa de servicios |
| `app/prompts.py` | Prompts versionados | — |

---

## 3. Conceptos para estudiar (y para la certificación)

**Embeddings.** Un modelo convierte texto en un vector de números. Textos con significado
parecido quedan cerca en ese espacio, aunque no compartan palabras ("familiar" ≈ "espaciosa, cinco plazas").

**Similitud coseno.** Mide el ángulo entre dos vectores: 1 = mismo significado, 0 = nada que ver.
Si los vectores están normalizados, es un simple producto punto (`matrix @ query` en `vector_store.py`).

**Búsqueda híbrida.** Los embeddings son buenos para conceptos difusos y malos para números exactos.
Por eso combinamos filtros duros (precio, año, caja) con ranking semántico.

**RAG (Retrieval-Augmented Generation).** El LLM no responde "de memoria": primero recuperamos datos
reales del inventario y se los pasamos como contexto. Reduce alucinaciones y no requiere reentrenar nada.

**¿Por qué no fine-tuning?** El inventario cambia todos los días. Con RAG, un auto nuevo aparece en
la búsqueda al reindexar. Con fine-tuning habría que reentrenar el modelo. RAG es más barato, rápido
y actualizable; el fine-tuning conviene para cambiar el estilo o comportamiento del modelo, no para darle datos.

**Temperatura.** 0 para extraer JSON (queremos siempre la misma salida). Algo más alta (0.3) para
redactar la respuesta. Para copy creativo de campañas se usaría más alta todavía (0.7–0.9).

**Structured output + validación.** El LLM devuelve JSON y Pydantic lo valida. Si el modelo devuelve
algo inválido, `parse_filters_json` degrada a "sin filtros" en lugar de romper la API.

**Grounding y anti-alucinación.** El prompt de respuesta prohíbe inventar unidades, y si no hay
resultados el contexto va vacío. El test `test_no_results_does_not_hallucinate` lo verifica.

**Costos.** Los embeddings del inventario se calculan una vez (al iniciar o al reindexar), no en cada
búsqueda. Cada búsqueda cuesta: 1 embedding + 1 llamada corta al LLM (+1 si pide respuesta).

---

## 4. Integración con Next.js

El servicio no se conecta a la base. Next es la fuente de verdad y el contrato
tiene dos direcciones:

**Next → servicio (inventario).** `GET INVENTORY_URL` con `Authorization: Bearer <INVENTORY_SECRET>`
devuelve la forma de `data/inventario.json`:

```json
{
  "categorias": ["hatchback", "sedan", "suv", "pickup"],
  "preciosVisibles": true,
  "cotizacionDolar": 1200,
  "vehiculos": [
    { "id": "…", "marca": "Toyota", "modelo": "Corolla", "version": "XEI", "anio": 2025,
      "categoria": "sedan", "combustible": "NAFTA", "transmision": "CVT", "estado": "USADO",
      "kilometraje": 8000, "precioArs": 38000000, "descripcion": "…" }
  ]
}
```

- Solo unidades `PUBLICADO`.
- `precioArs` ya convertido con `precioEnPesos`; `null` si está en dólares sin cotización.
- Con `mostrarPrecios` apagado: `preciosVisibles: false` y ningún `precioArs`.

**Servicio → Next (búsqueda).** `POST /search` con `X-Api-Key` devuelve ids, no vehículos:

```json
{
  "consulta": "SUV automática hasta 45 millones",
  "filtros": { "precioMax": 45000000, "moneda": "ARS", "categoria": "suv", "transmision": "AUTOMATICA", "…": null },
  "resultados": [{ "id": "v005", "score": 0.61 }, { "id": "v007", "score": 0.48 }],
  "respuesta": null
}
```

Next busca esas unidades con Prisma y las reordena por la lista, igual que
`idsOrdenadosPorPrecio` en el catálogo. Al dar de alta, editar o dar de baja una
unidad (o cambiar la cotización), Next llama a `POST /index/rebuild`; gracias a
la caché de embeddings solo se recalculan las unidades cuyo texto cambió.

---

## 5. Camino a producción

- **Vector store:** reemplazar `InMemoryVectorStore` por OpenSearch Serverless, una Bedrock Knowledge Base o pgvector.
- **Deploy:** contenedor en ECS/App Runner, o Lambda con un adaptador como Mangum.
- **Seguridad:** rol IAM con permisos mínimos (solo los modelos usados), API key o auth entre Next.js y el servicio.
- **Guardrails:** Amazon Bedrock Guardrails para filtrar temas fuera de alcance y datos sensibles.
- **Observabilidad:** CloudWatch para latencia, errores y consumo de tokens.
- **Caché:** guardar embeddings de búsquedas frecuentes para bajar costo y latencia.

---

## 6. Próximas features con la misma base

- **Copy de avisos:** al dar de alta un vehículo, el LLM genera la descripción a partir de specs y fotos.
- **Campañas:** generar variantes de anuncios para unidades con muchos días publicadas (temperatura alta + Guardrails).
- **Leads:** extraer datos estructurados de consultas y tasaciones para priorizarlas.
- **Rendimiento predictivo:** estimar días hasta la venta con SageMaker.
