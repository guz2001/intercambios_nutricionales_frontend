# NutriConsulta — Frontend

Interfaz web para consultar la composición nutricional de alimentos, diseñada para nutricionistas. Permite buscar alimentos por nombre, filtrar por grupo alimentario y por tipo de población, seleccionar un alimento y ver el desglose completo de más de 30 nutrientes.

---

## Capturas de pantalla

> Agrega capturas aquí. Sugerencia de carpeta: `docs/screenshots/`.
>
> - `docs/screenshots/vista-desktop.png` — layout completo en pantalla ancha
> - `docs/screenshots/lista-filtrada.png` — búsqueda con resultados filtrados
> - `docs/screenshots/detalle-alimento.png` — panel derecho con nutrientes desplegados
> - `docs/screenshots/vista-movil.png` — tabs en pantalla de 375px

---

## Stack tecnológico

| Herramienta | Versión | Rol |
|---|---|---|
| [Astro](https://astro.build) | 7.x | Framework de componentes y build |
| JavaScript vanilla | ES2020+ | Lógica de interacción en el cliente |
| CSS custom con variables | — | Estilos sin frameworks externos |
| Fuente Inter | — | Tipografía (cargada desde Google Fonts) |
| Node.js | 18+ | Entorno de desarrollo |

No se usa Tailwind, React, Vue ni ninguna UI library. Cero dependencias de componentes en producción.

---

## Estructura de carpetas

```
nutricion_frontend/
├── public/                    # Archivos estáticos servidos tal cual
│   └── favicon.svg
├── src/
│   ├── mock/
│   │   ├── alimentos.js       # 8 alimentos con todos los campos nutricionales + funciones de filtrado
│   │   └── grupos.js          # Lista de 6 grupos para el dropdown de filtro
│   ├── pages/
│   │   └── index.astro        # Única página: layout principal, importa y ensambla todos los componentes
│   ├── components/
│   │   ├── Header.astro           # Barra superior: logo NutriConsulta + nombre de la profesional
│   │   ├── PanelIzquierdo.astro   # Panel lateral: botones de población, buscador, dropdown, lista de alimentos
│   │   ├── PanelDerecho.astro     # Panel principal: nombre, métricas, filtro de nutrientes, 4 secciones
│   │   ├── TarjetaAlimento.astro  # Componente de referencia (la versión dinámica la genera app.js)
│   │   └── SeccionNutrientes.astro # Wrapper reutilizable para cada bloque de nutrientes (slot-based)
│   ├── scripts/
│   │   └── app.js             # Toda la lógica cliente: búsqueda, filtros, selección, guardar
│   └── styles/
│       └── global.css         # Variables CSS + reset + estilos de todos los componentes
├── docs/
│   ├── ARQUITECTURA.md        # Flujo de datos, comunicación entre componentes, decisiones técnicas
│   ├── COMPONENTES.md         # Referencia de cada componente Astro
│   ├── APP_JS.md              # Referencia de cada función en app.js
│   ├── ESTILOS.md             # Variables CSS y guía de personalización
│   └── MOCK_DATA.md           # Estructura de datos y guía para agregar alimentos
├── astro.config.mjs           # Configuración de Astro (sin integraciones adicionales)
├── package.json
└── README.md                  # Este archivo
```

---

## Cómo correr el proyecto localmente

### 1. Requisitos previos

- Node.js 18 o superior
- npm (incluido con Node.js)

### 2. Instalar dependencias

```bash
cd nutricion_frontend
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor arranca en **http://localhost:4321**.

También puedes usar los comandos de Astro CLI directamente:

```bash
# Modo background (no bloquea la terminal)
astro dev --background

# Ver estado del servidor en background
astro dev status

# Ver logs del servidor en background
astro dev logs

# Detener el servidor en background
astro dev stop
```

### 4. Build para producción

```bash
npm run build       # Genera la carpeta dist/
npm run preview     # Previsualiza el build en localhost
```

---

## Cómo conectar el backend Django

### Paso único

Abre el archivo `src/scripts/app.js` y cambia la línea 21:

```js
// ANTES (modo mock, sin backend)
const USE_MOCK = true;

// DESPUÉS (conectado al backend)
const USE_MOCK = false;
```

Con `USE_MOCK = false`, la app deja de leer los archivos locales y pasa a hacer peticiones HTTP reales al backend.

### Endpoints que el backend debe implementar

#### `GET /api/alimentos/`

Retorna la lista de alimentos filtrada según los parámetros de query.

**Parámetros de query (todos opcionales):**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `q` | `string` | Texto de búsqueda por nombre (case-insensitive) |
| `grupo_id` | `number` | ID del grupo alimentario |
| `poblacion` | `string` | `ninos_y_adultos` / `adultos` / `ninos` / `menores_de_dos_anios` |

**Respuesta esperada:** array de objetos alimento (ver estructura abajo).

**Ejemplo de URL:** `/api/alimentos/?q=leche&grupo_id=2&poblacion=adultos`

---

#### `GET /api/alimentos/:id/`

Retorna el detalle completo de un alimento por su ID.

**Respuesta esperada:** objeto alimento único (misma estructura que la lista).

**Ejemplo de URL:** `/api/alimentos/1/`

---

#### `GET /api/grupos/` *(opcional — solo si USE_MOCK = false)*

Retorna la lista de grupos para el dropdown. El frontend la consume en `cargarGrupos()`.

**Respuesta esperada:**
```json
[
  { "id": 1, "nombre": "Cereales y derivados" },
  { "id": 2, "nombre": "Lácteos" }
]
```

---

### Estructura exacta de datos — objeto alimento

```json
{
  "id": 1,
  "nombre": "Leche entera",
  "grupo": {
    "id": 2,
    "nombre": "Lácteos"
  },
  "porcion_g": 240,
  "unidad_medida": "ml",
  "poblacion": "adultos",
  "kcal": 150,
  "proteina_g": 8.0,
  "cho_g": 11.7,
  "grasa_total_g": 8.0,
  "fibra_g": 0,
  "ags_g": 4.6,
  "agm_g": 2.3,
  "agp_g": 0.3,
  "colesterol_mg": 30,
  "calcio_mg": 290,
  "fosforo_mg": 222,
  "hierro_mg": 0.1,
  "sodio_mg": 105,
  "potasio_mg": 370,
  "magnesio_mg": 27,
  "zinc_mg": 1.0,
  "cobre_mg": 0.01,
  "manganeso_mg": 0.01,
  "vita_er": 68,
  "tiamina_mg": 0.09,
  "riboflavina_mg": 0.35,
  "niacina_mg": 0.2,
  "pantotenico_mg": 0.72,
  "piridoxina_mg": 0.08,
  "folato_mcg": 12,
  "vitb12_mcg": 0.9,
  "vitc_mg": 0
}
```

Los campos con valor `null`, `undefined` o `0` se muestran como `—` en la interfaz (ver `formatearValor()` en app.js).

---

## Documentación adicional

- [Arquitectura y flujo de datos](docs/ARQUITECTURA.md)
- [Referencia de componentes](docs/COMPONENTES.md)
- [Referencia de app.js](docs/APP_JS.md)
- [Variables CSS y estilos](docs/ESTILOS.md)
- [Datos mock y estructura](docs/MOCK_DATA.md)
