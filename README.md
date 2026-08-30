# NutriConsulta — Frontend

Interfaz web para consulta de composición nutricional de alimentos, diseñada para nutricionistas. Permite buscar alimentos, filtrar por grupo y población, y visualizar todos los nutrientes en detalle.

---

## Stack

- **[Astro](https://astro.build)** — framework de componentes con cero JS por defecto
- **JavaScript vanilla** — lógica de interacción sin frameworks
- **CSS custom con variables** — sin Tailwind, sin UI libraries
- **Fuente Inter** — cargada desde Google Fonts

---

## Estructura de carpetas

```
src/
├── mock/
│   ├── alimentos.js       # 8 alimentos con todos los campos nutricionales
│   └── grupos.js          # Lista de grupos para el dropdown de filtro
├── pages/
│   └── index.astro        # Layout principal — ensambla todos los componentes
├── components/
│   ├── Header.astro           # Barra superior con logo y usuario
│   ├── PanelIzquierdo.astro   # Panel de búsqueda y lista de alimentos
│   ├── PanelDerecho.astro     # Panel de detalle nutricional
│   ├── TarjetaAlimento.astro  # Componente de referencia de tarjeta (renderizado por JS)
│   └── SeccionNutrientes.astro # Wrapper reutilizable de sección de nutrientes
├── scripts/
│   └── app.js             # Toda la lógica: búsqueda, filtros, detalle, guardar
└── styles/
    └── global.css         # Variables CSS + reset + todos los estilos
```

---

## Cómo correr el proyecto

### Requisitos
- Node.js 18+
- npm

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

El servidor arranca en `http://localhost:4321`.

> **Nota:** también puedes usar los comandos de Astro:
> ```bash
> astro dev --background   # modo background
> astro dev stop           # detener
> astro dev status         # verificar estado
> astro dev logs           # ver logs
> ```

### Build para producción

```bash
npm run build
npm run preview
```

---

## Cómo conectar el backend Django

1. Abre `src/scripts/app.js`
2. Cambia la línea:
   ```js
   const USE_MOCK = true;
   ```
   a:
   ```js
   const USE_MOCK = false;
   ```

### Endpoints esperados

| Método | URL | Descripción |
|--------|-----|-------------|
| `GET` | `/api/alimentos/` | Lista de alimentos con filtros |
| `GET` | `/api/alimentos/:id/` | Detalle de un alimento |

### Parámetros de query para `/api/alimentos/`

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `q` | string | Texto de búsqueda por nombre |
| `grupo_id` | number | Filtrar por ID de grupo |
| `poblacion` | string | `ninos_y_adultos` \| `adultos` \| `ninos` \| `menores_de_dos_anios` |

---

## Estructura de datos esperada

### Alimento (lista y detalle)

```js
{
  id: 1,
  nombre: "Leche entera",
  grupo: { id: 2, nombre: "Lácteos" },
  porcion_g: 240,
  unidad_medida: "ml",
  poblacion: "adultos",          // para filtrado
  kcal: 150,
  proteina_g: 8.0,
  cho_g: 11.7,                   // carbohidratos
  grasa_total_g: 8.0,
  fibra_g: 0,
  ags_g: 4.6,                    // ácidos grasos saturados
  agm_g: 2.3,                    // ácidos grasos monoinsaturados
  agp_g: 0.3,                    // ácidos grasos poliinsaturados
  colesterol_mg: 30,
  calcio_mg: 290,
  fosforo_mg: 222,
  hierro_mg: 0.1,
  sodio_mg: 105,
  potasio_mg: 370,
  magnesio_mg: 27,
  zinc_mg: 1.0,
  cobre_mg: 0.01,
  manganeso_mg: 0.01,
  vita_er: 68,                   // vitamina A en equivalentes de retinol
  tiamina_mg: 0.09,
  riboflavina_mg: 0.35,
  niacina_mg: 0.2,
  pantotenico_mg: 0.72,
  piridoxina_mg: 0.08,
  folato_mcg: 12,
  vitb12_mcg: 0.9,
  vitc_mg: 0,
}
```

Los campos nulos o con valor `0` se muestran como `—` en la UI.

### Grupo

```js
{ id: 1, nombre: "Cereales y derivados" }
```

---

## Variables CSS y cómo personalizar

Todas las variables están en `src/styles/global.css` bajo `:root`. Para cambiar la paleta de colores basta editar esas variables:

```css
:root {
  --color-primary: #dee4ee;       /* azul principal */
  --color-primary-hover: #2563EB;
  --color-primary-light: #EFF6FF; /* fondo de cards activas */
  --color-primary-dark: #1D4ED8;  /* texto de badges */
  --color-bg: #F8FAFC;            /* fondo general */
  --color-border: #E2E8F0;
  /* ver global.css para la lista completa */
}
```

---

## Decisiones de diseño

- **Sin framework UI:** CSS custom con variables garantiza cero dependencias de UI y control total sobre los estilos.
- **Datos mock en JS:** el flag `USE_MOCK` permite trabajar completamente offline durante el desarrollo del frontend, antes de que el backend esté disponible.
- **Tarjetas renderizadas por JS:** la lista de alimentos se genera dinámicamente para soportar búsqueda y filtrado sin recargar la página.
- **Debounce 300 ms:** la búsqueda por texto no dispara una petición por cada tecla, sino 300 ms después de la última pulsación.
- **Responsive con tabs:** en móvil (< 768 px) los dos paneles se convierten en tabs para aprovechar el espacio de pantalla.
