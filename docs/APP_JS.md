# Referencia de app.js

**Ubicación:** `src/scripts/app.js`

`app.js` es el único archivo JavaScript que se ejecuta en el navegador. Contiene toda la lógica de la aplicación: cargar datos, renderizar elementos, manejar eventos y filtrar. Está escrito en JavaScript vanilla sin dependencias externas (los imports son de los archivos mock del mismo proyecto).

---

## Flujo de ejecución desde que carga la página

```
1. El navegador carga index.html (generado por Astro)
   └── El HTML ya tiene todos los elementos estáticos: Header, botones,
       inputs, secciones de nutrientes con "—", lista vacía.

2. El navegador ejecuta app.js (module, bundleado por Vite)
   └── Se definen todas las funciones (aún no se ejecutan)
   └── Se registra el listener de DOMContentLoaded

3. DOMContentLoaded dispara
   │
   ├── await cargarGrupos()
   │     └── Rellena <select id="select-grupo"> con las opciones
   │
   ├── await buscarYRenderizar()
   │     └── fetchAlimentos({ poblacion: 'ninos_y_adultos' })
   │     └── renderizarLista(alimentos)
   │           └── Rellena <div id="lista-alimentos"> con tarjetas
   │           └── Agrega click listeners a cada tarjeta
   │
   └── registrarEventos()
         └── Agrega listeners a: botones de población, input de búsqueda,
             select de grupo, input de filtro de nutrientes,
             botón guardar, tabs de móvil

4. La app queda en espera de interacciones del usuario
```

---

## Variables globales

### `USE_MOCK` — `boolean` — línea 21

```js
const USE_MOCK = true;
```

Interruptor que determina si la app usa datos locales o el backend real. Ver sección "Cómo funciona USE_MOCK" al final.

### `estado` — objeto — líneas 23-31

```js
const estado = {
  poblacion: 'ninos_y_adultos',  // filtro de población activo
  busqueda: '',                   // texto del input de búsqueda
  grupoId: '',                    // ID del grupo seleccionado ('' = todos)
  filtroNutriente: '',            // texto del filtro de nutrientes
  alimentos: [],                  // resultado de la última búsqueda
  alimentoSeleccionado: null,     // objeto alimento actualmente visible en detalle
  guardados: [],                  // array de IDs de alimentos guardados
};
```

Es la única fuente de verdad de la aplicación. Ningún dato importante vive en el DOM; el DOM es solo la representación visual de este objeto.

### `timerBusqueda` — línea 213

Handle del `setTimeout` del debounce. Se guarda en módulo para poder cancelarlo con `clearTimeout` si el usuario escribe otra letra antes de que pasen 300 ms.

---

## Funciones — Módulo 2: Fetch / Mock

### `fetchAlimentos(params)` — línea 35

```js
async function fetchAlimentos({ q, grupo_id, poblacion })
```

Obtiene la lista de alimentos filtrada. Con `USE_MOCK = true` llama a `filtrarMocks()` del archivo `alimentos.js`. Con `USE_MOCK = false` construye una URL con `URLSearchParams` y hace `fetch` a `/api/alimentos/`.

**Parámetros:**
- `q` — texto de búsqueda
- `grupo_id` — ID del grupo (número como string, o vacío)
- `poblacion` — clave de población

**Retorna:** `Promise<Array>` — lista de alimentos.

---

### `fetchDetalle(id)` — línea 47

```js
async function fetchDetalle(id)
```

Obtiene el detalle completo de un alimento por ID. Con `USE_MOCK = true` llama a `obtenerMockPorId(id)`. Con `USE_MOCK = false` hace `fetch` a `/api/alimentos/${id}/`.

**Retorna:** `Promise<Object|null>` — objeto alimento completo, o `null` si no existe.

---

## Funciones — Módulo 3: Renderizado de lista

### `renderizarLista(alimentos)` — línea 57

```js
function renderizarLista(alimentos)
```

Reemplaza el contenido de `<div id="lista-alimentos">` con las tarjetas del array recibido.

**Comportamiento:**
- Si el array está vacío, inserta un estado vacío con ícono de lupa y texto.
- Si hay alimentos, mapea cada uno a HTML con `renderizarTarjeta()` y los une.
- Si hay un `estado.alimentoSeleccionado`, busca su tarjeta y le agrega `.seleccionada`.
- Agrega un listener `click` a cada tarjeta que llama a `seleccionarAlimento(tarjetaEl)`.

---

### `renderizarTarjeta(alimento)` — línea 92

```js
function renderizarTarjeta(alimento)  // retorna string HTML
```

Recibe un objeto alimento y retorna el HTML de una tarjeta como string. Este string se concatena en `renderizarLista()` vía `Array.map().join('')`.

Genera las tres filas de la tarjeta:
- Fila 1: nombre + badge de grupo
- Fila 2: ícono + porción
- Fila 3: kcal, proteína, CHO, grasa (valores redondeados)

El ícono de porción es un SVG inline (balanza estilizada) generado como string.

---

## Funciones — Módulo 4: Renderizado de detalle

### `renderizarDetalle(alimento)` — línea 127

```js
function renderizarDetalle(alimento)
```

Actualiza todos los elementos del panel derecho con los datos del alimento recibido. Es la función más extensa porque actualiza más de 30 campos individuales.

**Qué actualiza:**
1. `#alimento-nombre` y `#alimento-badge` (lo muestra si estaba oculto)
2. Las 4 métricas superiores: `val-kcal`, `val-porcion`, `val-proteina`, `val-grasa`
3. Los macronutrientes detallados: `val-proteina-det`, `val-grasa-det`, `val-cho`, `val-fibra`
4. Los tipos de grasa: `val-ags`, `val-agm`, `val-agp`, `val-colesterol`
5. Los 9 minerales: `val-calcio` … `val-manganeso`
6. Las 9 vitaminas: `val-vita` … `val-vitc`
7. Limpia el input de filtro de nutrientes y llama a `filtrarNutrientes('')`

---

### `setText(id, valor)` — línea 186

```js
function setText(id, valor)
```

Auxiliar que hace `document.getElementById(id).textContent = valor`. Verifica que el elemento existe antes de asignar. Simplifica `renderizarDetalle()`.

---

### `formatearValor(valor, unidad)` — línea 192

```js
function formatearValor(valor, unidad)  // retorna string
```

Formatea un número nutricional para mostrarlo en pantalla.

**Reglas:**
- Si `valor` es `null`, `undefined`, o `parseFloat(valor) === 0` → retorna `'—'`
- En cualquier otro caso → retorna `"X.X unidad"` (1 decimal fijo)

**Ejemplos:**
```js
formatearValor(8.0, 'g')     // → "8.0 g"
formatearValor(0, 'mg')      // → "—"
formatearValor(null, 'mg')   // → "—"
formatearValor(0.09, 'mg')   // → "0.1 mg"
```

---

## Funciones — Módulo 5: Filtros y búsqueda

### `buscarYRenderizar()` — línea 202

```js
async function buscarYRenderizar()
```

Lee los tres filtros del objeto `estado` (búsqueda, grupo, población), llama a `fetchAlimentos()` con esos parámetros, guarda el resultado en `estado.alimentos` y llama a `renderizarLista()`. Es el punto de coordinación central para cualquier cambio en los filtros de la lista.

---

### `buscarConDebounce()` — línea 214

```js
function buscarConDebounce()
```

Envuelve `buscarYRenderizar()` en un debounce de 300 ms. Se usa para el evento `input` del campo de búsqueda por texto: espera a que el usuario deje de escribir antes de lanzar la búsqueda, evitando búsquedas innecesarias por cada tecla.

**Mecanismo:**
```js
clearTimeout(timerBusqueda);           // cancela el timer anterior
timerBusqueda = setTimeout(fn, 300);   // programa uno nuevo
```

---

### `filtrarNutrientes(texto)` — línea 220

```js
function filtrarNutrientes(texto)
```

Filtra las filas visibles en el panel de nutrientes según el texto ingresado. Opera **solo sobre el DOM**, sin hacer ninguna petición.

**Algoritmo:**
1. Itera sobre cada `.seccion-nutrientes`
2. Para cada sección, itera sobre sus `.fila-nutriente`
3. Compara `fila.dataset.nombre.toLowerCase()` con `texto.toLowerCase()`
4. Si no coincide → agrega `.oculta` a la fila
5. Cuenta cuántas filas son visibles en la sección
6. Si ninguna fila es visible → agrega `.oculta` a la sección completa

**Resultado:** el usuario puede escribir "calcio" y solo verá la fila de Calcio dentro de la sección Minerales; todas las demás secciones desaparecen.

---

## Funciones — Módulo 6: Guardar

### `guardarAlimento(id)` — línea 240

```js
function guardarAlimento(id)
```

Agrega el ID del alimento al array `estado.guardados`, evitando duplicados con `includes()`. Llama a `actualizarContador()` al terminar.

---

### `actualizarContador()` — línea 247

```js
function actualizarContador()
```

Actualiza el texto del badge `<div id="contador-guardados">` con `estado.guardados.length`.

---

## Funciones — Módulo 7: Selección y tabs

### `seleccionarAlimento(tarjetaEl)` — línea 254

```js
async function seleccionarAlimento(tarjetaEl)
```

Maneja el click en una tarjeta de la lista.

**Pasos:**
1. Lee `tarjetaEl.dataset.id`
2. Llama a `fetchDetalle(id)` (mock o API)
3. Si el resultado es null, sale
4. Guarda el alimento en `estado.alimentoSeleccionado`
5. Quita `.seleccionada` de todas las tarjetas y la agrega solo a la que se clickeó
6. Llama a `renderizarDetalle(alimento)` para actualizar el panel derecho
7. Si el ancho de pantalla es ≤ 768px → llama a `cambiarTab('detalle')` para mostrar el panel derecho en móvil

---

### `cambiarTab(tab)` — línea 277

```js
function cambiarTab(tab)  // tab: 'alimentos' | 'detalle'
```

Controla qué panel es visible en móvil. Agrega/quita `.tab-activo` en los paneles y `.activo` en los botones de tab.

**Solo tiene efecto visual en pantallas ≤ 768px** (en desktop ambos paneles son visibles simultáneamente gracias al layout flex).

---

## Funciones — Módulo 9: Carga de grupos

### `cargarGrupos()` — línea 292

```js
async function cargarGrupos()
```

Rellena el `<select id="select-grupo">` con las opciones de grupos alimentarios.

Con `USE_MOCK = true` usa el array `gruposMock` importado de `grupos.js`.  
Con `USE_MOCK = false` hace `fetch('/api/grupos/')`.

Crea un `<option>` por cada grupo con `value = grupo.id` y `textContent = grupo.nombre`.

---

## Funciones — Módulo 10: Registro de eventos

### `registrarEventos()` — línea 308

```js
function registrarEventos()
```

Registra todos los listeners de eventos del DOM. Se llama una sola vez en `DOMContentLoaded`.

**Eventos que registra:**

| Elemento | Evento | Acción |
|---|---|---|
| `.btn-poblacion` × 4 | `click` | Actualiza `estado.poblacion`, llama `buscarYRenderizar()` |
| `#input-busqueda` | `input` | Actualiza `estado.busqueda`, llama `buscarConDebounce()` |
| `#select-grupo` | `change` | Actualiza `estado.grupoId`, llama `buscarYRenderizar()` |
| `#input-filtro-nutrientes` | `input` | Actualiza `estado.filtroNutriente`, llama `filtrarNutrientes()` |
| `#btn-guardar` | `click` | Llama `guardarAlimento(estado.alimentoSeleccionado.id)` |
| `.tab-btn` × 2 | `click` | Llama `cambiarTab(btn.dataset.tab)` |

---

## Cómo funciona USE_MOCK y cómo cambiarlo

### Con `USE_MOCK = true` (valor actual)

```
fetchAlimentos(params)
  └─► filtrarMocks(params)          ← src/mock/alimentos.js
        └── filtra el array local
        └── retorna resultado inmediatamente (síncrono envuelto en Promise)

fetchDetalle(id)
  └─► obtenerMockPorId(id)          ← src/mock/alimentos.js
        └── busca en el array local

cargarGrupos()
  └─► gruposMock                    ← src/mock/grupos.js (importado al inicio)
```

No hay peticiones HTTP. Todo ocurre en memoria.

### Con `USE_MOCK = false`

```
fetchAlimentos(params)
  └─► fetch('/api/alimentos/?q=...&grupo_id=...&poblacion=...')
        └── espera respuesta HTTP
        └── parsea JSON
        └── retorna array de alimentos

fetchDetalle(id)
  └─► fetch('/api/alimentos/{id}/')
        └── espera respuesta HTTP
        └── parsea JSON
        └── retorna objeto alimento

cargarGrupos()
  └─► fetch('/api/grupos/')
        └── espera respuesta HTTP
        └── parsea JSON
        └── retorna array de grupos
```

### Cómo cambiarlo

Abre `src/scripts/app.js` y edita la línea 21:

```js
// Línea 21 — cambiar true por false para usar el backend real
const USE_MOCK = false;
```

Guarda el archivo. El servidor de desarrollo de Astro recarga automáticamente.

### Nota sobre el origen de las URLs

Con `USE_MOCK = false`, `fetchAlimentos` usa `new URL('/api/alimentos/', window.location.origin)`. Esto genera una URL absoluta al mismo origen del frontend, por ejemplo `http://localhost:4321/api/alimentos/`. Si el backend Django corre en un puerto diferente durante desarrollo (ej: `:8000`), debes configurar un proxy en `astro.config.mjs`:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    server: {
      proxy: {
        '/api': 'http://localhost:8000',
      },
    },
  },
});
```
