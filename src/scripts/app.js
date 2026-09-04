/**
 * app.js — Lógica principal de NutriConsulta
 *
 * Módulos:
 * 1. Config y estado
 * 2. Fetch / Mock
 * 3. Renderizado de lista
 * 4. Renderizado de detalle
 * 5. Filtros y búsqueda
 * 6. Guardar alimentos
 * 7. Responsive / tabs
 * 8. Init
 */

import { grupos as gruposMock } from '../mock/grupos.js';
import { filtrarMocks, obtenerMockPorId } from '../mock/alimentos.js';

// ─── 1. CONFIG Y ESTADO ────────────────────────────────────────────────────────

/* Cambiar a false cuando el backend Django esté listo */
const USE_MOCK = false; // cambiamos a false para conectar este frontend con el backend
const API_BASE_URL = 'http://127.0.0.1:8000/api/'
const estado = {
  poblacion: 'niños_y_adultos',
  busqueda: '',
  grupoId: '',
  filtroNutriente: '',
  alimentos: [],
  alimentoSeleccionado: null,
  guardados: [],
};

// ─── 2. FETCH / MOCK ───────────────────────────────────────────────────────────

async function fetchAlimentos(params) {
  if (USE_MOCK) {
    return filtrarMocks(params);
  }
  const url = new URL('alimentos/', API_BASE_URL);
  if (params.q) url.searchParams.set('q', params.q);
  if (params.grupo_id) url.searchParams.set('grupo_id', params.grupo_id);
  if (params.poblacion) url.searchParams.set('poblacion', params.poblacion);
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

async function fetchDetalle(id) {
  if (USE_MOCK) {
    return obtenerMockPorId(id);
  }
  const res = await fetch(`${API_BASE_URL}alimentos/${id}/`);
  return res.json();
}

// ─── 3. RENDERIZADO DE LISTA ───────────────────────────────────────────────────

function renderizarLista(alimentos) {
  const contenedor = document.getElementById('lista-alimentos');
  if (!contenedor) return;

  if (alimentos.length === 0) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
             stroke="currentColor" stroke-width="1.5"
             xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="11"/>
          <line x1="27" y1="27" x2="36" y2="36"/>
        </svg>
        <span>Sin resultados para<br>la búsqueda actual</span>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = alimentos.map(renderizarTarjeta).join('');

  /* Marcar la tarjeta activa si ya hay un alimento seleccionado */
  if (estado.alimentoSeleccionado) {
    const tarjeta = contenedor.querySelector(
      `.tarjeta-alimento[data-id="${estado.alimentoSeleccionado.id}"]`
    );
    if (tarjeta) tarjeta.classList.add('seleccionada');
  }

  /* Bind de click para cada tarjeta */
  contenedor.querySelectorAll('.tarjeta-alimento').forEach((tarjeta) => {
    tarjeta.addEventListener('click', () => seleccionarAlimento(tarjeta));
  });
}

function renderizarTarjeta(alimento) {
  /* SVG de balanza para indicar la porción */
  const iconoPorcion = `
    <svg class="icono-porcion" viewBox="0 0 12 12" fill="none"
         stroke="currentColor" stroke-width="1.5"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="6" y1="1" x2="6" y2="11"/>
      <line x1="2" y1="5" x2="10" y2="5"/>
      <path d="M2 5 Q2 8 4 8" />
      <path d="M10 5 Q10 8 8 8" />
    </svg>
  `;

  return `
    <div class="tarjeta-alimento" data-id="${alimento.id}">
      <div class="tarjeta-fila-1">
        <span class="tarjeta-nombre">${alimento.nombre}</span>
        <span class="badge-grupo">${alimento.grupo.nombre}</span>
      </div>
      <div class="tarjeta-fila-2">
        ${iconoPorcion}
        <span class="tarjeta-porcion">${alimento.porcion_g} ${alimento.unidad_medida}</span>
      </div>
      <div class="tarjeta-fila-3">
        <span class="tarjeta-stat"><strong>${Math.round(alimento.kcal)}</strong> kcal</span>
        <span class="tarjeta-stat"><strong>${alimento.proteina_g}g</strong> prot</span>
        <span class="tarjeta-stat"><strong>${alimento.cho_g}g</strong> CHO</span>
        <span class="tarjeta-stat"><strong>${alimento.grasa_total_g}g</strong> grasa</span>
      </div>
    </div>
  `;
}

// ─── 4. RENDERIZADO DE DETALLE ─────────────────────────────────────────────────

function renderizarDetalle(alimento) {
  /* Nombre y badge */
  const elNombre = document.getElementById('alimento-nombre');
  const elBadge = document.getElementById('alimento-badge');
  if (elNombre) elNombre.textContent = alimento.nombre;
  if (elBadge) {
    elBadge.textContent = alimento.grupo.nombre;
    elBadge.style.display = '';
  }

  /* Métricas superiores */ 
  setText('val-kcal', Math.round(alimento.kcal));/*Math round redondea el numero al entero mas cercano */
  setText('val-porcion', `${Math.round(alimento.porcion_g)}g`);//Se hizo esto para redondear el gramaje
  setText('val-unidad',`${alimento.unidad_medida}`);
  setText('val-proteina', `${Math.round((alimento.proteina_g)*10)/10}g`);
  setText('val-grasa', `${Math.round((alimento.grasa_total_g)*10)/10}g`);
  setText('val-poblacion', `${alimento.poblacion}`);

  /* Macronutrientes */
  setText('val-proteina-det', formatearValor(alimento.proteina_g, 'g'));
  setText('val-grasa-det', formatearValor(alimento.grasa_total_g, 'g'));
  setText('val-cho', formatearValor(alimento.cho_g, 'g'));
  setText('val-fibra', formatearValor(alimento.fibra_g, 'g'));

  /* Tipos de grasa */
  setText('val-ags', formatearValor(alimento.ags_g, 'g'));
  setText('val-agm', formatearValor(alimento.agm_g, 'g'));
  setText('val-agp', formatearValor(alimento.agp_g, 'g'));
  setText('val-colesterol', formatearValor(alimento.colesterol_mg, 'mg'));

  /* Minerales */
  setText('val-calcio', formatearValor(alimento.calcio_mg, 'mg'));
  setText('val-fosforo', formatearValor(alimento.fosforo_mg, 'mg'));
  setText('val-hierro', formatearValor(alimento.hierro_mg, 'mg'));
  setText('val-sodio', formatearValor(alimento.sodio_mg, 'mg'));
  setText('val-potasio', formatearValor(alimento.potasio_mg, 'mg'));
  setText('val-magnesio', formatearValor(alimento.magnesio_mg, 'mg'));
  setText('val-zinc', formatearValor(alimento.zinc_mg, 'mg'));
  setText('val-cobre', formatearValor(alimento.cobre_mg, 'mg'));
  setText('val-manganeso', formatearValor(alimento.manganeso_mg, 'mg'));

  /* Vitaminas */
  setText('val-vita', formatearValor(alimento.vita_er, 'μg ER'));
  setText('val-tiamina', formatearValor(alimento.tiamina_mg, 'mg'));
  setText('val-riboflavina', formatearValor(alimento.riboflavina_mg, 'mg'));
  setText('val-niacina', formatearValor(alimento.niacina_mg, 'mg'));
  setText('val-pantotenico', formatearValor(alimento.pantotenico_mg, 'mg'));
  setText('val-piridoxina', formatearValor(alimento.piridoxina_mg, 'mg'));
  setText('val-folato', formatearValor(alimento.folato_mcg, 'μg'));
  setText('val-vitb12', formatearValor(alimento.vitb12_mcg, 'μg'));
  setText('val-vitc', formatearValor(alimento.vitc_mg, 'mg'));

  /* Restablecer filtro de nutrientes */
  const inputFiltro = document.getElementById('input-filtro-nutrientes');
  if (inputFiltro) {
    inputFiltro.value = '';
    filtrarNutrientes('');
  }
}

/* Auxiliar: actualiza el texto de un elemento por ID */
function setText(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

/* Formatea un valor numérico con unidad; retorna "—" si es nulo o cero */
function formatearValor(valor, unidad) {
  if (valor === null || valor === undefined || parseFloat(valor) === 0) {
    return '————';
  }
  return `${parseFloat(valor).toFixed(1)} ${unidad}`;
}

// ─── 5. FILTROS Y BÚSQUEDA ─────────────────────────────────────────────────────

/* Lanza la búsqueda con los parámetros actuales del estado */
async function buscarYRenderizar() {
  const alimentos = await fetchAlimentos({
    q: estado.busqueda,
    grupo_id: estado.grupoId,
    poblacion: estado.poblacion,
  });
  estado.alimentos = alimentos;
  renderizarLista(alimentos);
}

/* Debounce para la búsqueda por texto (300 ms) */
let timerBusqueda = null;
function buscarConDebounce() {
  clearTimeout(timerBusqueda);
  timerBusqueda = setTimeout(buscarYRenderizar, 300);
}

/* Filtra las filas de nutrientes según el texto ingresado */
function filtrarNutrientes(texto) {
  const secciones = document.querySelectorAll('.seccion-nutrientes');
  secciones.forEach((seccion) => {
    const filas = seccion.querySelectorAll('.fila-nutriente');
    let filasVisibles = 0;

    filas.forEach((fila) => {
      const nombre = (fila.dataset.nombre || '').toLowerCase();
      const coincide = nombre.includes(texto.toLowerCase());
      fila.classList.toggle('oculta', !coincide);
      if (coincide) filasVisibles++;
    });

    /* Ocultar la sección completa si ninguna fila coincide */
    seccion.classList.toggle('oculta', filasVisibles === 0);
  });
}

// ─── 6. GUARDAR ALIMENTOS ──────────────────────────────────────────────────────

function guardarAlimento(id) {
  /* Evitar duplicados */
  if (estado.guardados.includes(id)) return;
  estado.guardados.push(id);
  actualizarContador();
}

function actualizarContador() {
  const contador = document.getElementById('contador-guardados');
  if (contador) contador.textContent = estado.guardados.length;
}

// ─── 7. SELECCIÓN DE ALIMENTO ──────────────────────────────────────────────────

async function seleccionarAlimento(tarjetaEl) {
  const id = tarjetaEl.dataset.id;
  const alimento = await fetchDetalle(id);
  if (!alimento) return;

  estado.alimentoSeleccionado = alimento;

  /* Quitar selección previa y marcar la nueva */
  document
    .querySelectorAll('.tarjeta-alimento')
    .forEach((t) => t.classList.remove('seleccionada'));
  tarjetaEl.classList.add('seleccionada');

  renderizarDetalle(alimento);

  /* En móvil, cambiar al tab de detalle automáticamente */
  if (window.innerWidth <= 768) {
    cambiarTab('detalle');
  }
}

// ─── 8. RESPONSIVE / TABS ─────────────────────────────────────────────────────

function cambiarTab(tab) {
  const panelIzq = document.querySelector('.panel-izquierdo');
  const panelDer = document.querySelector('.panel-derecho');
  const tabBtns = document.querySelectorAll('.tab-btn');

  panelIzq?.classList.toggle('tab-activo', tab === 'alimentos');
  panelDer?.classList.toggle('tab-activo', tab === 'detalle');

  tabBtns.forEach((btn) => {
    btn.classList.toggle('activo', btn.dataset.tab === tab);
  });
}

// ─── 9. CARGA DE GRUPOS ────────────────────────────────────────────────────────

async function cargarGrupos() {
  const select = document.getElementById('select-grupo');
  if (!select) return;

  const data = USE_MOCK ? gruposMock : await fetch(`${API_BASE_URL}grupos/`).then((r) => r.json());
  const grupos = USE_MOCK ? data : data.results;  

  grupos.forEach((grupo) => {
    const option = document.createElement('option');
    option.value = grupo.id;
    option.textContent = grupo.nombre;
    select.appendChild(option);
  });
}

// ─── 10. REGISTRO DE EVENTOS ───────────────────────────────────────────────────

function registrarEventos() {
  /* Filtros de población */
  document.querySelectorAll('.btn-poblacion').forEach((btn) => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.btn-poblacion')
        .forEach((b) => b.classList.remove('activo'));
      btn.classList.add('activo');
      estado.poblacion = btn.dataset.valor;
      buscarYRenderizar();
    });
  });

  /* Búsqueda por texto */
  const inputBusqueda = document.getElementById('input-busqueda');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', (e) => {
      estado.busqueda = e.target.value;
      buscarConDebounce();
    });
  }

  /* Filtro por grupo */
  const selectGrupo = document.getElementById('select-grupo');
  if (selectGrupo) {
    selectGrupo.addEventListener('change', (e) => {
      estado.grupoId = e.target.value;
      buscarYRenderizar();
    });
  }

  /* Filtro de nutrientes en el panel derecho */
  const inputFiltroNut = document.getElementById('input-filtro-nutrientes');
  if (inputFiltroNut) {
    inputFiltroNut.addEventListener('input', (e) => {
      estado.filtroNutriente = e.target.value;
      filtrarNutrientes(e.target.value);
    });
  }

  /* Botón guardar */
  const btnGuardar = document.getElementById('btn-guardar');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', () => {
      if (estado.alimentoSeleccionado) {
        guardarAlimento(estado.alimentoSeleccionado.id);
      }
    });
  }

  /* Tabs móvil */
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
  });
}

// ─── INIT ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await cargarGrupos();
  await buscarYRenderizar();
  registrarEventos();

  /* Tab activo inicial en móvil */
  if (window.innerWidth <= 768) {
    cambiarTab('alimentos');
  }
});
