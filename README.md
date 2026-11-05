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

### Variables de entorno (copia `.env.example` a `.env`)

| Variable | Uso |
|---|---|
| `PUBLIC_USE_MOCK` | `true` = datos mock · `false` = `nutricio_backend` real |
| `BACKEND_URL` | Solo dev: destino del proxy `/api` (por defecto `http://localhost:8000`) |
| `PUBLIC_API_URL` | Producción: URL absoluta del backend (vacío = mismo origen) |

Endpoints consumidos (sin cambios): `GET /api/alimentos/?q=&grupo_id=&poblacion=`, `GET /api/alimentos/:id/`, `GET /api/grupos/`.

> "Mi lista" y los ajustes de lectura se guardan por ahora en `localStorage`; el prototipo prevé una API de guardados (pendiente de definir en el backend).

## Documentación adicional

- [Arquitectura y flujo de datos](docs/ARQUITECTURA.md)
- [Referencia de componentes](docs/COMPONENTES.md)
- [Referencia de app.js](docs/APP_JS.md)
- [Variables CSS y estilos](docs/ESTILOS.md)
- [Datos mock y estructura](docs/MOCK_DATA.md)
