# Arquitectura de NutriConsulta

## Diagrama de flujo de datos

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      index.astro                         │  │
│  │  (servidor Astro genera el HTML en build time / SSR)     │  │
│  │                                                          │  │
│  │   ┌──────────┐   ┌───────────────────┐  ┌────────────┐  │  │
│  │   │  Header  │   │  PanelIzquierdo   │  │PanelDerecho│  │  │
│  │   │  .astro  │   │      .astro       │  │   .astro   │  │  │
│  │   └──────────┘   └───────────────────┘  └────────────┘  │  │
│  │                         │                      │         │  │
│  │                         │ usa slot             │         │  │
│  │                         ▼                      ▼         │  │
│  │              ┌──────────────────┐   ┌──────────────────┐ │  │
│  │              │ (lista vacía,    │   │  SeccionNutrientes│ │  │
│  │              │  llenada por JS) │   │     .astro × 4   │ │  │
│  │              └──────────────────┘   └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                │                                │
│                   DOMContentLoaded                              │
│                                │                                │
│  ┌─────────────────────────────▼──────────────────────────────┐ │
│  │                         app.js                             │ │
│  │                                                            │ │
│  │  estado = { poblacion, busqueda, grupoId,                  │ │
│  │             alimentoSeleccionado, guardados }              │ │
│  │                                                            │ │
│  │  Eventos del usuario          Acciones resultantes         │ │
│  │  ─────────────────────        ──────────────────────────   │ │
│  │  Click btn-poblacion    ───►  buscarYRenderizar()          │ │
│  │  Escribe en buscador    ───►  buscarConDebounce() 300ms    │ │
│  │  Cambia select-grupo    ───►  buscarYRenderizar()          │ │
│  │  Click tarjeta          ───►  seleccionarAlimento()        │ │
│  │                               └─► renderizarDetalle()     │ │
│  │  Escribe filtro-nutri   ───►  filtrarNutrientes()          │ │
│  │  Click btn-guardar      ───►  guardarAlimento()            │ │
│  │  Click tab (móvil)      ───►  cambiarTab()                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                │                                │
│          USE_MOCK ─────────────┤                                │
│                                │                                │
│         true ◄─────────────────┤─────────────────► false       │
│           │                                           │         │
│           ▼                                           ▼         │
│  ┌────────────────┐                      ┌────────────────────┐ │
│  │  alimentos.js  │                      │  Backend Django    │ │
│  │  grupos.js     │                      │  GET /api/alimentos│ │
│  │  (filtrarMocks)│                      │  GET /api/alimentos│ │
│  │                │                      │       /:id/        │ │
│  └────────────────┘                      └────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cómo se comunican los componentes

En Astro, los componentes `.astro` **no se comunican entre sí en el cliente**. El HTML se genera en servidor (o en build time) y se envía al navegador ya ensamblado. Toda la comunicación dinámica posterior es responsabilidad de `app.js`, que manipula el DOM directamente por IDs.

### Flujo en tiempo de servidor (build / SSR)

```
index.astro
  └── importa y renderiza Header.astro
  └── importa y renderiza PanelIzquierdo.astro
  └── importa y renderiza PanelDerecho.astro
        └── importa y renderiza SeccionNutrientes.astro × 4
              └── recibe filas de nutrientes vía <slot />
```

El resultado es un único HTML estático con todos los elementos en su lugar. Los valores de nutrientes aparecen como `—` porque aún no hay alimento seleccionado.

### Flujo en tiempo de cliente (app.js)

```
DOMContentLoaded
  │
  ├─► cargarGrupos()       → rellena <select id="select-grupo">
  ├─► buscarYRenderizar()  → rellena <div id="lista-alimentos">
  └─► registrarEventos()   → agrega listeners a todos los controles

Usuario hace click en tarjeta
  │
  └─► seleccionarAlimento(tarjetaEl)
        ├─► fetchDetalle(id)          → mock o API
        ├─► renderizarDetalle(alimento)
        │     ├─► setText('val-kcal', ...)
        │     ├─► setText('val-proteina-det', ...)
        │     └─► ... (30+ campos actualizados por ID)
        └─► cambiarTab('detalle')     → solo en móvil
```

La comunicación es siempre **unidireccional**: el usuario actúa → app.js actualiza el estado → app.js escribe en el DOM.

### Mapa de IDs de DOM que app.js controla

| ID | Componente que lo declara | Quién lo actualiza |
|---|---|---|
| `lista-alimentos` | PanelIzquierdo | `renderizarLista()` |
| `select-grupo` | PanelIzquierdo | `cargarGrupos()` |
| `input-busqueda` | PanelIzquierdo | evento `input` |
| `alimento-nombre` | PanelDerecho | `renderizarDetalle()` |
| `alimento-badge` | PanelDerecho | `renderizarDetalle()` |
| `val-kcal` | PanelDerecho | `renderizarDetalle()` |
| `val-porcion` | PanelDerecho | `renderizarDetalle()` |
| `val-proteina` | PanelDerecho | `renderizarDetalle()` |
| `val-grasa` | PanelDerecho | `renderizarDetalle()` |
| `val-proteina-det` … `val-vitc` | PanelDerecho | `renderizarDetalle()` |
| `contador-guardados` | PanelDerecho | `actualizarContador()` |
| `input-filtro-nutrientes` | PanelDerecho | evento `input` |

---

## Por qué se eligió cada tecnología

### Astro

- **Sin JavaScript innecesario en el cliente.** Astro no envía JS al navegador para los componentes `.astro`. El único JS que llega es `app.js`, que el desarrollador escribió explícitamente.
- **Componentes con slots.** Permite crear `SeccionNutrientes.astro` como wrapper reutilizable que acepta hijos vía `<slot />`, igual que en React pero sin hydration.
- **Estructura de archivos intuitiva.** `src/pages/index.astro` es la página, `src/components/` son los bloques. No hay router complejo.
- **Build optimizado.** Astro/Vite procesa y empaqueta `app.js` automáticamente al hacer `npm run build`.

### JavaScript vanilla

- **Sin overhead de framework.** La lógica es sencilla: filtrar listas, actualizar texto, manejar eventos. No justifica React o Vue.
- **`estado` como objeto plano.** Un objeto de estado global es suficiente para una SPA de esta escala. No se necesita Redux, Zustand ni Pinia.
- **ES modules nativos.** Los imports de `alimentos.js` y `grupos.js` funcionan directamente gracias a Vite.

### CSS custom con variables

- **Control total.** Ninguna clase de utilidad de Tailwind puede obstaculizar o sobreescribir los estilos.
- **Variables semánticas.** `--color-primary` es más legible que `#3B82F6` en todos los archivos. Cambiar el color primario implica cambiar una sola línea en `:root`.
- **Sin dependencia de build para CSS.** El CSS no necesita compilarse; funciona directamente en el navegador.
- **Responsive explícito.** El `@media (max-width: 768px)` está al final de `global.css`, bien localizado y sin clases mágicas.

---

## Decisiones de diseño importantes

### 1. `USE_MOCK` como interruptor único

En lugar de tener dos archivos de configuración o variables de entorno, toda la alternancia mock/real se controla con una constante booleana en la línea 21 de `app.js`. Es la decisión más práctica para un proyecto en etapa de desarrollo: el desarrollador sabe exactamente dónde cambiar y qué implica.

### 2. El estado vive en `app.js`, no en el HTML

Los botones de población tienen `class="btn-poblacion activo"` en el HTML inicial, pero el estado real de la aplicación (qué población está seleccionada, qué alimento, etc.) vive en el objeto `estado` de `app.js`. El HTML es solo la representación visual, no la fuente de verdad.

### 3. Tarjetas generadas dinámicamente

`TarjetaAlimento.astro` existe como componente de referencia, pero en tiempo de ejecución las tarjetas se generan como strings HTML en `renderizarTarjeta()` y se insertan vía `innerHTML`. Esto permite filtrar y re-renderizar la lista entera en milisegundos sin ninguna reconciliación de DOM virtual.

### 4. Filtro de nutrientes en el cliente

El filtro de la sección de detalle (`input-filtro-nutrientes`) opera exclusivamente sobre clases CSS (`.oculta`) en el DOM ya renderizado. No hace ninguna petición al servidor. Es el enfoque más rápido posible para este caso de uso.

### 5. Lógica de población inclusiva

Los alimentos con `poblacion: "ninos_y_adultos"` aparecen **en todos los filtros de población**, incluyendo `"adultos"` y `"ninos"`. Esto refleja la realidad clínica: un alimento apto para toda la familia no desaparece cuando filtras por adultos.

### 6. Layout sin scroll en `body`

`html` y `body` tienen `overflow: hidden` y `height: 100%`. El scroll está habilitado únicamente en `.lista-alimentos` y `.nutrientes-scroll`. Esto evita que la página entera se desplace y mantiene el header y la barra de guardar siempre visibles.
