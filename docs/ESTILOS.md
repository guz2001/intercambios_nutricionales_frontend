# Estilos — Variables CSS y guía de personalización

**Ubicación del archivo:** `src/styles/global.css`

Todo el CSS de la aplicación está en un único archivo. No hay estilos en los componentes `.astro` (Astro permite estilos con `<style>` en cada componente, pero aquí se optó por centralizar todo en `global.css` para facilitar la consistencia y el mantenimiento).

---

## Variables CSS — referencia completa

Las variables se declaran en `:root` y están disponibles en toda la hoja de estilos.

### Colores

| Variable | Valor | Dónde se usa |
|---|---|---|
| `--color-primary` | `#3B82F6` | Botones activos, borde de tarjeta seleccionada, métrica kcal, badge contador, avatar, focus ring |
| `--color-primary-hover` | `#2563EB` | Estado hover del botón guardar |
| `--color-primary-light` | `#EFF6FF` | Fondo de tarjeta seleccionada, fondo de badges de grupo |
| `--color-primary-dark` | `#1D4ED8` | Texto de los badges de grupo |
| `--color-bg` | `#F8FAFC` | Fondo de la app, fondo de tarjetas métricas no activas, hover de tarjetas |
| `--color-panel` | `#FFFFFF` | Definida pero no usada directamente; equivale a `white` |
| `--color-border` | `#E2E8F0` | Bordes de inputs, paneles, header, barra de guardar |
| `--color-border-light` | `#F1F5F9` | Separadores entre filas de nutrientes y tarjetas de alimentos |
| `--color-text-primary` | `#1E293B` | Texto principal: nombres, valores fuertes |
| `--color-text-secondary` | `#475569` | Texto de menor jerarquía: nombre de usuario, nombres de nutrientes |
| `--color-text-muted` | `#94A3B8` | Texto muy secundario: porción, stats de tarjeta, labels de secciones |
| `--color-section-header` | `#94A3B8` | Encabezados de secciones de nutrientes (MACRONUTRIENTES, etc.) |
| `--color-card-active-border` | `#3B82F6` | Definida por semántica; equivale a `--color-primary` |

### Tipografía

| Variable | Valor | Dónde se usa |
|---|---|---|
| `--font-family` | `'Inter', sans-serif` | Body, todos los inputs, buttons y selects |
| `--font-size-xs` | `11px` | Badges de grupo, stats de tarjeta, labels de sección, contador |
| `--font-size-sm` | `12px` | Label de métricas |
| `--font-size-base` | `14px` | Texto principal de la interfaz: nombres, valores de nutrientes, botones |
| `--font-size-lg` | `18px` | Nombre "NutriConsulta" en el header |
| `--font-size-xl` | `24px` | Nombre del alimento en el panel derecho |
| `--font-size-metric` | `28px` | Números grandes de las 4 métricas (kcal, porción, proteína, grasa) |

### Espaciado

| Variable | Valor | Dónde se usa |
|---|---|---|
| `--spacing-xs` | `4px` | Gaps mínimos: badge contador, gap de métricas |
| `--spacing-sm` | `8px` | Gap entre botones de población, margin-bottom del buscador |
| `--spacing-md` | `12px` | Gap entre tarjetas métricas, padding de barra guardar |
| `--spacing-lg` | `16px` | Padding estándar de paneles, gap de tarjetas métricas |
| `--spacing-xl` | `24px` | Padding del header del alimento, padding del scroll de nutrientes |

### Bordes y radios

| Variable | Valor | Dónde se usa |
|---|---|---|
| `--radius-sm` | `6px` | Definida, reservada para usos futuros |
| `--radius-md` | `8px` | Inputs, selects, botones de población, botón guardar |
| `--radius-lg` | `12px` | Tarjetas de métricas |
| `--radius-full` | `9999px` | Badges de grupo, avatar, badge contador (forma de píldora/círculo) |

### Sombras

| Variable | Valor | Dónde se usa |
|---|---|---|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.06)` | Definida, disponible para uso personalizado |
| `--shadow-panel` | `0 0 0 1px var(--color-border)` | Definida, disponible para uso personalizado |

---

## Cómo cambiar los colores del tema

Para cambiar el color primario (azul) a otro color, solo hay que editar las cuatro variables de color primario en `:root`:

```css
/* src/styles/global.css — líneas 6-9 */
:root {
  --color-primary: #10B981;       /* verde esmeralda, por ejemplo */
  --color-primary-hover: #059669;
  --color-primary-light: #ECFDF5;
  --color-primary-dark: #047857;
}
```

Ese cambio afecta automáticamente:
- Todos los botones activos y el botón guardar
- El borde de la tarjeta seleccionada y su fondo
- Los badges de grupo
- El avatar del usuario
- El contador de guardados
- El focus ring de los inputs

No hay valores de color hardcoded en el CSS (excepto el fondo inactivo de `btn-poblacion`: `#F1F5F9` y `#E2E8F0` en hover, que son colores neutros fijos).

---

## Clases de estado — usadas por JavaScript

Estas clases no tienen un equivalente visual por defecto; JavaScript las agrega y quita para cambiar la apariencia:

| Clase | Dónde se usa | Qué hace |
|---|---|---|
| `.activo` | `.btn-poblacion`, `.tab-btn` | Aplica el estilo de elemento seleccionado |
| `.seleccionada` | `.tarjeta-alimento` | Fondo azul claro + borde izquierdo azul |
| `.oculta` | `.fila-nutriente`, `.seccion-nutrientes` | `display: none` |
| `.tab-activo` | `.panel-izquierdo`, `.panel-derecho` | `display: flex` en móvil (override del `display: none`) |

---

## Breakpoints responsive

Solo hay un breakpoint:

```css
@media (max-width: 768px) { ... }
```

### Comportamiento en desktop (> 768px)

- `.tabs-movil` → `display: none` (oculto)
- `.panel-izquierdo` → `width: 380px`, visible siempre
- `.panel-derecho` → `flex: 1`, visible siempre
- `.metricas-grid` → 4 columnas

### Comportamiento en móvil (≤ 768px)

- `.tabs-movil` → `display: flex` (visible)
- `.app-body` → `flex-direction: column` (paneles apilados)
- `.panel-izquierdo` → `width: 100%`, `display: none` por defecto
- `.panel-izquierdo.tab-activo` → `display: flex` (visible cuando el tab "Alimentos" está activo)
- `.panel-derecho` → `width: 100%`, `display: none` por defecto
- `.panel-derecho.tab-activo` → `display: flex` (visible cuando el tab "Detalle" está activo)
- `.metricas-grid` → 2 columnas

### Cómo agregar más breakpoints

Para agregar un breakpoint de tablet (ej: 1024px), agrega al final de `global.css`:

```css
@media (max-width: 1024px) and (min-width: 769px) {
  .panel-izquierdo {
    width: 300px; /* panel más angosto en tablet */
  }

  .metricas-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas en tablet */
  }
}
```

---

## Reset y base

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

Reset minimalista. Todo el espaciado se declara explícitamente con `padding` y `margin` en cada clase.

```css
html, body {
  height: 100%;
  overflow: hidden;
}
```

Crítico para el layout sin scroll de body. Ver "Decisiones de diseño" en `ARQUITECTURA.md`.

```css
button, input, select, textarea {
  font-family: var(--font-family);
}
```

Los elementos de formulario no heredan `font-family` por defecto en todos los navegadores; esta regla lo fuerza.

---

## Estructura del archivo global.css

```
1.   @import Google Fonts (Inter)
2.   :root { variables }
3.   Reset y base (*, html, body, elementos de formulario)
4.   — HEADER —
5.   — LAYOUT PRINCIPAL —
6.   — PANEL IZQUIERDO —
7.   — TARJETA ALIMENTO —
8.   — PANEL DERECHO —
9.   — FILTRO NUTRIENTES —
10.  — SECCIONES NUTRIENTES —
11.  — BARRA GUARDAR —
12.  — ESTADO VACÍO —
13.  — TABS MÓVIL —
14.  @media (max-width: 768px)
```

Las secciones están separadas por comentarios `/* ─── NOMBRE ─ */` para facilitar la navegación.
