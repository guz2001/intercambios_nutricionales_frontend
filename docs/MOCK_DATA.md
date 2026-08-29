# Datos mock — Estructura y guía de uso

Los archivos mock están en `src/mock/` y simulan las respuestas del backend Django durante el desarrollo del frontend. Solo se usan cuando `USE_MOCK = true` en `app.js`.

---

## Archivos

| Archivo | Qué exporta | Quién lo importa |
|---|---|---|
| `src/mock/grupos.js` | Array `grupos` | `app.js` → `cargarGrupos()` |
| `src/mock/alimentos.js` | Array `alimentos`, función `obtenerMockPorId()`, función `filtrarMocks()` | `app.js` → `fetchAlimentos()` y `fetchDetalle()` |

---

## `grupos.js` — estructura

```js
export const grupos = [
  { id: 1, nombre: "Cereales y derivados" },
  { id: 2, nombre: "Lácteos" },
  { id: 3, nombre: "Carnes" },
  { id: 4, nombre: "Huevos" },
  { id: 5, nombre: "Frutas" },
  { id: 6, nombre: "Leguminosas" },
];
```

Cada grupo tiene exactamente dos campos: `id` (número) y `nombre` (string). Este es el mismo formato que debe retornar `GET /api/grupos/` cuando se conecte el backend.

---

## `alimentos.js` — estructura completa de un alimento

Cada objeto del array `alimentos` tiene 32 campos:

```js
{
  // ── Identificación ──────────────────────────────────────
  id:            number,   // identificador único
  nombre:        string,   // nombre del alimento
  grupo: {
    id:          number,   // ID del grupo (coincide con grupos.js)
    nombre:      string,   // nombre del grupo
  },
  porcion_g:     number,   // tamaño de la porción de referencia
  unidad_medida: string,   // "g" o "ml"
  poblacion:     string,   // ver valores válidos abajo

  // ── Energía y macronutrientes ────────────────────────────
  kcal:          number,   // calorías totales
  proteina_g:    number,   // proteína total en gramos
  cho_g:         number,   // carbohidratos totales en gramos
  grasa_total_g: number,   // grasa total en gramos
  fibra_g:       number,   // fibra dietética en gramos

  // ── Tipos de grasa ───────────────────────────────────────
  ags_g:         number,   // ácidos grasos saturados
  agm_g:         number,   // ácidos grasos monoinsaturados
  agp_g:         number,   // ácidos grasos poliinsaturados
  colesterol_mg: number,   // colesterol en miligramos

  // ── Minerales ────────────────────────────────────────────
  calcio_mg:     number,
  fosforo_mg:    number,
  hierro_mg:     number,
  sodio_mg:      number,
  potasio_mg:    number,
  magnesio_mg:   number,
  zinc_mg:       number,
  cobre_mg:      number,
  manganeso_mg:  number,

  // ── Vitaminas ────────────────────────────────────────────
  vita_er:       number,   // Vitamina A en equivalentes de retinol (μg ER)
  tiamina_mg:    number,   // Vitamina B1
  riboflavina_mg: number,  // Vitamina B2
  niacina_mg:    number,   // Vitamina B3
  pantotenico_mg: number,  // Vitamina B5 (ácido pantoténico)
  piridoxina_mg: number,   // Vitamina B6
  folato_mcg:    number,   // Vitamina B9 (folato) en microgramos
  vitb12_mcg:    number,   // Vitamina B12 en microgramos
  vitc_mg:       number,   // Vitamina C
}
```

### Valores válidos para `poblacion`

| Valor | Cuándo usar |
|---|---|
| `"ninos_y_adultos"` | El alimento es adecuado para toda la familia. **Aparece en todos los filtros de población** (lógica en `filtrarMocks()`). |
| `"adultos"` | Solo apto para adultos (ej: lácteos sin restricción de grasa) |
| `"ninos"` | Pensado específicamente para niños (ej: banano, que se menciona como alimento infantil) |
| `"menores_de_dos_anios"` | Para lactantes y primera infancia |

> **Regla de negocio:** `filtrarMocks()` trata `"ninos_y_adultos"` como un comodín. Si el usuario filtra por `"adultos"`, los alimentos con `poblacion: "ninos_y_adultos"` también aparecen.

---

## Los 8 alimentos mock

| # | Nombre | Grupo | Población | Porción |
|---|---|---|---|---|
| 1 | Leche entera | Lácteos | adultos | 240 ml |
| 2 | Leche descremada | Lácteos | adultos | 240 ml |
| 3 | Arroz blanco cocido | Cereales y derivados | adultos | 180 g |
| 4 | Pan integral | Cereales y derivados | ninos_y_adultos | 30 g |
| 5 | Pechuga de pollo cocida | Carnes | adultos | 100 g |
| 6 | Huevo entero cocido | Huevos | adultos | 60 g |
| 7 | Banano maduro | Frutas | ninos | 100 g |
| 8 | Lenteja cocida | Leguminosas | ninos_y_adultos | 100 g |

Los valores nutricionales son aproximaciones reales basadas en tablas INCAP y USDA.

---

## Funciones exportadas de `alimentos.js`

### `obtenerMockPorId(id)`

```js
export function obtenerMockPorId(id)
```

Busca y retorna el alimento cuyo `id` coincide con el parámetro. Convierte el parámetro a `Number` antes de comparar (porque los IDs del DOM son strings).

```js
obtenerMockPorId(1)   // → { id: 1, nombre: "Leche entera", ... }
obtenerMockPorId(99)  // → null
```

Equivale a `GET /api/alimentos/1/` en la API real.

---

### `filtrarMocks({ q, grupo_id, poblacion })`

```js
export function filtrarMocks({ q = '', grupo_id = '', poblacion = '' })
```

Filtra el array `alimentos` localmente, simulando los query params del backend.

**Lógica de cada filtro:**

```js
// Filtro de texto: case-insensitive, busca en el nombre
const coincideTexto = !q || a.nombre.toLowerCase().includes(q.toLowerCase());

// Filtro de grupo: compara IDs como número
const coincideGrupo = !grupo_id || a.grupo.id === Number(grupo_id);

// Filtro de población: acepta match exacto O "ninos_y_adultos"
const coincidePoblacion =
  !poblacion ||
  a.poblacion === poblacion ||
  a.poblacion === 'ninos_y_adultos';
```

Los tres filtros se aplican con AND: el alimento debe cumplir los tres para aparecer.

---

## Cómo agregar más alimentos mock

1. Abre `src/mock/alimentos.js`
2. Agrega un nuevo objeto al array `alimentos` siguiendo la estructura completa
3. Asegúrate de que el `id` sea único y el `grupo.id` coincida con un grupo en `grupos.js`

```js
// Ejemplo: agregar aguacate
{
  id: 9,
  nombre: "Aguacate",
  grupo: { id: 5, nombre: "Frutas" },
  porcion_g: 100,
  unidad_medida: "g",
  poblacion: "ninos_y_adultos",
  kcal: 160,
  proteina_g: 2.0,
  cho_g: 8.5,
  grasa_total_g: 14.7,
  fibra_g: 6.7,
  ags_g: 2.1,
  agm_g: 9.8,
  agp_g: 1.8,
  colesterol_mg: 0,
  calcio_mg: 12,
  fosforo_mg: 52,
  hierro_mg: 0.6,
  sodio_mg: 7,
  potasio_mg: 485,
  magnesio_mg: 29,
  zinc_mg: 0.6,
  cobre_mg: 0.19,
  manganeso_mg: 0.14,
  vita_er: 7,
  tiamina_mg: 0.07,
  riboflavina_mg: 0.13,
  niacina_mg: 1.7,
  pantotenico_mg: 1.39,
  piridoxina_mg: 0.26,
  folato_mcg: 81,
  vitb12_mcg: 0,
  vitc_mg: 10,
},
```

No hay que tocar ningún otro archivo; `filtrarMocks()` trabajará con el alimento nuevo automáticamente.

---

## Cómo agregar un nuevo grupo

1. Abre `src/mock/grupos.js` y agrega el grupo con un ID nuevo
2. Abre `src/mock/alimentos.js` y usa ese `grupo.id` en los alimentos correspondientes

```js
// En grupos.js
{ id: 7, nombre: "Tubérculos" }

// En alimentos.js
{
  id: 10,
  nombre: "Papa cocida",
  grupo: { id: 7, nombre: "Tubérculos" },
  ...
}
```

---

## Estructura cuando se conecte el backend real

Cuando `USE_MOCK = false`, `app.js` espera que la API retorne exactamente el mismo formato de objeto que usan los mocks. El backend Django debe serializar sus modelos de manera que el JSON resultante coincida campo por campo.

### Checklist para el desarrollador del backend

- [ ] `GET /api/alimentos/` retorna un array JSON con objetos que tienen todos los campos listados en "estructura completa"
- [ ] `GET /api/alimentos/:id/` retorna un objeto único (no un array)
- [ ] El campo `grupo` es un objeto anidado `{ id, nombre }`, no solo un ID
- [ ] Los campos con valor cero o nulo en la base de datos se retornan como `0` o `null` (el frontend maneja ambos con `formatearValor()`)
- [ ] Los parámetros de query `q`, `grupo_id` y `poblacion` funcionan de forma combinada (AND lógico)
- [ ] `GET /api/grupos/` retorna array de `{ id, nombre }` en el mismo orden que se quiere mostrar en el dropdown
- [ ] CORS está configurado para el origen del frontend (en desarrollo: `http://localhost:4321`)
