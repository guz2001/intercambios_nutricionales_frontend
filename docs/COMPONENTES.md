# Referencia de componentes

Todos los componentes están en `src/components/`. Son archivos `.astro` que se renderizan en el servidor (o en build time) y producen HTML estático. No tienen estado propio ni se re-renderizan en el cliente.

---

## `Header.astro`

**Ubicación:** `src/components/Header.astro`  
**Usado en:** `src/pages/index.astro`

### Qué renderiza

La barra superior fija de la aplicación, con dos zonas:

- **Izquierda:** ícono SVG de hoja verde + texto "NutriConsulta"
- **Derecha:** avatar circular con iniciales + nombre completo de la profesional

El nombre y las iniciales están actualmente definidos directamente en el HTML del componente (no vienen de props), ya que se trata de un dato fijo de la sesión.

### Props

Ninguna. El componente es completamente estático.

### Clases CSS principales

| Clase | Descripción |
|---|---|
| `.app-header` | Contenedor principal: `height: 56px`, fondo blanco, `position: sticky top: 0` |
| `.header-brand` | Flexbox con ícono + texto del logo |
| `.brand-name` | Texto "NutriConsulta" en `font-size-lg` y `font-weight: 700` |
| `.header-user` | Flexbox con avatar + nombre; tiene `border-left` como separador visual |
| `.user-avatar` | Círculo de 32×32px con fondo `--color-primary`, texto blanco, iniciales centradas |
| `.user-name` | Nombre en `font-size-base`, color `--color-text-secondary` |

### Estructura HTML resultante

```html
<header class="app-header">
  <div class="header-brand">
    <svg><!-- hoja verde --></svg>
    <span class="brand-name">NutriConsulta</span>
  </div>
  <div class="header-user">
    <div class="user-avatar">PV</div>
    <span class="user-name">Paula Valentina Rojas</span>
  </div>
</header>
```

---

## `PanelIzquierdo.astro`

**Ubicación:** `src/components/PanelIzquierdo.astro`  
**Usado en:** `src/pages/index.astro`

### Qué renderiza

El panel lateral de búsqueda y filtrado. Contiene los controles estáticos; la lista de alimentos es un contenedor vacío que `app.js` rellena dinámicamente.

Secciones en orden vertical:

1. **Botones de población** — 4 botones en grid 2×2. El primero ("Niños y adultos") tiene `class="activo"` por defecto.
2. **Campo de búsqueda** — `<input type="text" id="input-busqueda">` con ícono SVG de lupa posicionado absolutamente.
3. **Dropdown de grupos** — `<select id="select-grupo">` con solo la opción "Todos los grupos" en el HTML; las demás las agrega `app.js` en `cargarGrupos()`.
4. **Lista de alimentos** — `<div id="lista-alimentos">` vacía; `app.js` inserta las tarjetas aquí.

### Props

Ninguna. Todo el contenido es estático o lo inyecta JavaScript.

### IDs de DOM que usa `app.js`

| ID | Uso |
|---|---|
| `input-busqueda` | Registra evento `input` para búsqueda con debounce |
| `select-grupo` | Registra evento `change` + rellena opciones en `cargarGrupos()` |
| `lista-alimentos` | Destino de `innerHTML` en `renderizarLista()` |

### Clases CSS principales

| Clase | Descripción |
|---|---|
| `.panel-izquierdo` | `width: 380px`, fondo blanco, `border-right`, `flex-direction: column`, `overflow: hidden` |
| `.panel-content` | Padding interno, `flex: 1`, organiza hijos en columna |
| `.btn-poblacion` | Botón de filtro; `background: #F1F5F9` por defecto |
| `.btn-poblacion.activo` | `background: var(--color-primary)`, texto blanco |
| `.campo-busqueda` | `position: relative` para posicionar el ícono SVG |
| `.icono-busqueda` | SVG absoluto a la izquierda del input |
| `.select-grupo` | Select de ancho completo con borde y `border-radius-md` |
| `.lista-alimentos` | `flex: 1`, `overflow-y: auto`; margen negativo para que las tarjetas lleguen al borde |

---

## `PanelDerecho.astro`

**Ubicación:** `src/components/PanelDerecho.astro`  
**Usado en:** `src/pages/index.astro`  
**Importa:** `SeccionNutrientes.astro`

### Qué renderiza

El panel principal de detalle nutricional. Tiene cinco zonas diferenciadas:

1. **Header del alimento** — `<h1 id="alimento-nombre">` con el nombre y un `<span id="alimento-badge">` oculto inicialmente.
2. **Grid de métricas** — 4 tarjetas en grid 4×1: kcal (destacada en azul), porción, proteína, grasa.
3. **Filtro de nutrientes** — input de texto con ícono de lupa; filtra las filas del panel en tiempo real.
4. **Área scrollable de nutrientes** — 4 secciones `SeccionNutrientes`: Macronutrientes, Tipos de grasa, Minerales, Vitaminas.
5. **Barra de guardar** — botón "Guardar alimento" + badge contador de guardados.

Todos los valores comienzan en `—` y `app.js` los sobreescribe al seleccionar un alimento.

### Props

Ninguna.

### IDs de DOM que usa `app.js`

| ID | Qué muestra |
|---|---|
| `alimento-nombre` | Nombre del alimento seleccionado |
| `alimento-badge` | Badge con el grupo (ej: "Lácteos") |
| `val-kcal` | Calorías totales (redondeado) |
| `val-porcion` | Tamaño de porción + unidad (ej: "240 ml") |
| `val-proteina` | Proteína en gramos (para la métrica) |
| `val-grasa` | Grasa total en gramos (para la métrica) |
| `val-proteina-det` | Proteína con 1 decimal + unidad (para la tabla) |
| `val-grasa-det` | Grasa total detallada |
| `val-cho` | Carbohidratos |
| `val-fibra` | Fibra dietética |
| `val-ags` | Ácidos grasos saturados |
| `val-agm` | Ácidos grasos monoinsaturados |
| `val-agp` | Ácidos grasos poliinsaturados |
| `val-colesterol` | Colesterol en mg |
| `val-calcio` … `val-manganeso` | 9 minerales |
| `val-vita` … `val-vitc` | 9 vitaminas |
| `input-filtro-nutrientes` | Filtra filas de nutrientes en tiempo real |
| `btn-guardar` | Botón que llama a `guardarAlimento()` |
| `contador-guardados` | Badge con el número de alimentos guardados |

### Clases CSS principales

| Clase | Descripción |
|---|---|
| `.panel-derecho` | `flex: 1`, `flex-direction: column`, `background: var(--color-bg)` |
| `.alimento-header` | Padding `var(--spacing-xl)`, fondo blanco, border inferior |
| `.metricas-grid` | `display: grid`, `grid-template-columns: repeat(4, 1fr)` |
| `.metrica-card` | Tarjeta con fondo `--color-bg`, centrada verticalmente |
| `.metrica-card.destacada` | Fondo `--color-primary`, texto blanco (para kcal) |
| `.metrica-valor` | Número grande: `font-size: 28px`, `font-weight: 700` |
| `.nutrientes-scroll` | `flex: 1`, `overflow-y: auto`; el único scroll del panel |
| `.barra-guardar` | Fondo blanco, `border-top`, siempre visible al fondo |
| `.btn-guardar` | Botón azul de ancho completo menos el badge del contador |
| `.contador-guardados` | Círculo azul con número de alimentos guardados |

---

## `SeccionNutrientes.astro`

**Ubicación:** `src/components/SeccionNutrientes.astro`  
**Usado en:** `src/components/PanelDerecho.astro` (4 veces)

### Qué renderiza

Un bloque `<section>` que agrupa filas de nutrientes bajo un título en mayúsculas. Las filas concretas las pasa el componente padre a través de `<slot />`.

### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `titulo` | `string` | Texto del encabezado de la sección (ej: `"Macronutrientes"`) |
| `dataSeccion` | `string` | Valor del atributo `data-seccion` del `<section>` (ej: `"macronutrientes"`) |

### Estructura HTML resultante

```html
<section class="seccion-nutrientes" data-seccion="macronutrientes">
  <h3 class="seccion-header">MACRONUTRIENTES</h3>
  <div class="filas-nutrientes">
    <!-- filas pasadas por el padre vía <slot /> -->
    <div class="fila-nutriente" data-nombre="proteína">
      <span class="nutriente-nombre">Proteína</span>
      <span class="nutriente-valor" id="val-proteina-det">—</span>
    </div>
    ...
  </div>
</section>
```

### Clases CSS principales

| Clase | Descripción |
|---|---|
| `.seccion-nutrientes` | Contenedor de la sección; `.oculta` la oculta cuando el filtro no coincide |
| `.seccion-header` | Texto en mayúsculas, `font-size: 11px`, `letter-spacing: 0.08em` |
| `.fila-nutriente` | Flexbox horizontal: nombre a la izquierda, valor a la derecha |
| `.fila-nutriente.oculta` | `display: none`; la agrega `filtrarNutrientes()` |
| `.nutriente-nombre` | Texto en `--color-text-secondary` |
| `.nutriente-valor` | Texto en `--color-text-primary`, `font-weight: 600` |

### Atributo `data-nombre` en las filas

Cada `<div class="fila-nutriente">` tiene un atributo `data-nombre` con el nombre del nutriente en minúsculas. `filtrarNutrientes()` lo lee para determinar si la fila coincide con el texto del filtro.

Ejemplos: `data-nombre="proteína"`, `data-nombre="ácidos grasos saturados"`, `data-nombre="vitamina b12"`.

---

## `TarjetaAlimento.astro`

**Ubicación:** `src/components/TarjetaAlimento.astro`  
**Usado en:** No se usa directamente en ninguna página.

### Qué es

Es un componente de **referencia y documentación**. Define la estructura y los tipos de una tarjeta de alimento en Astro puro, pero en la aplicación las tarjetas se generan dinámicamente por `renderizarTarjeta()` en `app.js` usando template strings de JavaScript.

La razón: la lista de alimentos se re-renderiza en el cliente cada vez que cambia el filtro. Astro no puede hacer eso en el cliente sin hydration de un framework. La solución es generar el HTML como string en JavaScript.

### Props

```typescript
interface Props {
  alimento: {
    id: number;
    nombre: string;
    grupo: { nombre: string };
    porcion_g: number;
    unidad_medida: string;
    kcal: number;
    proteina_g: number;
    cho_g: number;
    grasa_total_g: number;
  };
}
```

### Estructura HTML que produce (o que produce `renderizarTarjeta()`)

```html
<div class="tarjeta-alimento" data-id="1">
  <!-- Fila 1: nombre + badge de grupo -->
  <div class="tarjeta-fila-1">
    <span class="tarjeta-nombre">Leche entera</span>
    <span class="badge-grupo">Lácteos</span>
  </div>

  <!-- Fila 2: porción -->
  <div class="tarjeta-fila-2">
    <svg class="icono-porcion">...</svg>
    <span class="tarjeta-porcion">240 ml</span>
  </div>

  <!-- Fila 3: 4 macronutrientes en miniatura -->
  <div class="tarjeta-fila-3">
    <span class="tarjeta-stat"><strong>150</strong> kcal</span>
    <span class="tarjeta-stat"><strong>8g</strong> prot</span>
    <span class="tarjeta-stat"><strong>11.7g</strong> CHO</span>
    <span class="tarjeta-stat"><strong>8g</strong> grasa</span>
  </div>
</div>
```

### Clases CSS principales

| Clase | Descripción |
|---|---|
| `.tarjeta-alimento` | Padding `12px`, `border-left: 3px solid transparent`, cursor pointer |
| `.tarjeta-alimento:hover` | Fondo `--color-bg` |
| `.tarjeta-alimento.seleccionada` | Fondo `--color-primary-light`, borde izquierdo azul |
| `.tarjeta-nombre` | Negrita, `flex: 1` para empujar el badge a la derecha |
| `.badge-grupo` | Píldora azul claro con texto azul oscuro |
| `.tarjeta-stat` | Texto pequeño; el `<strong>` tiene color primario |

---

## `index.astro` (página)

**Ubicación:** `src/pages/index.astro`  
**No es un componente reutilizable — es la única página de la app.**

### Qué hace

1. Importa `global.css` para aplicar el reset y las variables CSS a toda la página.
2. Renderiza `<Header />`, los tabs de navegación móvil, y el `<div class="app-body">` con `<PanelIzquierdo />` y `<PanelDerecho />` dentro.
3. Incluye el tag `<script>` que importa `app.js`. Astro lo procesa con Vite: resuelve los imports de `alimentos.js` y `grupos.js`, y lo inyecta como módulo en el HTML final.

### Estructura de layout

```
<div class="app-root">         ← display: flex; flex-direction: column; height: 100vh
  <Header />                   ← height: 56px; flex-shrink: 0
  <div class="tabs-movil">     ← display: none en desktop; flex en móvil
  <div class="app-body">       ← flex: 1; display: flex; flex-direction: row
    <PanelIzquierdo />         ← width: 380px; flex-shrink: 0
    <PanelDerecho />           ← flex: 1
  </div>
</div>
```
