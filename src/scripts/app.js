/**
 * app.js — NutriConsulta v2
 *
 * 1. Config / estado        5. Comparar
 * 2. API (nutricio_backend) 6. Mi lista + impresión
 * 3. Utilidades             7. Ajustes
 * 4. Buscar y Detalle       8. Router + init
 *
 * Contrato con el backend (sin cambios respecto a v1):
 *   GET /api/alimentos/?q=&grupo_id=&poblacion=   → [alimento]
 *   GET /api/alimentos/:id/                       → alimento
 *   GET /api/grupos/                              → [{id, nombre}]
 */

import { grupos as gruposMock } from '../mock/grupos.js';
import { filtrarMocks, obtenerMockPorId } from '../mock/alimentos.js';

// ─── 1. CONFIG Y ESTADO ────────────────────────────────────────────────────────

/* PUBLIC_USE_MOCK=false en .env → usa nutricio_backend real */
const USE_MOCK = import.meta.env.PUBLIC_USE_MOCK !== 'false';
const API_URL = (import.meta.env.PUBLIC_API_URL || '').replace(/\/$/, '');
const NUTRICIONISTA = 'Paula Valentina Rojas';

const POBLACIONES = {
  ninos_y_adultos: 'Niños y adultos',
  adultos: 'Adultos',
  ninos: 'Niños',
  menores_de_dos_anios: 'Menores de 2 años',
};

/* Definición única de nutrientes: alimenta detalle, filtro y comparación */
const SECCIONES = [
  { titulo: 'Macronutrientes', items: [
    ['proteina_g', 'Proteína', 'g'], ['grasa_total_g', 'Grasa total', 'g'],
    ['cho_g', 'Carbohidratos', 'g'], ['fibra_g', 'Fibra dietaria', 'g'] ] },
  { titulo: 'Tipos de grasa', items: [
    ['ags_g', 'Ác. grasos saturados', 'g'], ['agm_g', 'Ác. grasos monoinsaturados', 'g'],
    ['agp_g', 'Ác. grasos poliinsaturados', 'g'], ['colesterol_mg', 'Colesterol', 'mg'] ] },
  { titulo: 'Minerales', items: [
    ['calcio_mg', 'Calcio', 'mg'], ['fosforo_mg', 'Fósforo', 'mg'], ['hierro_mg', 'Hierro', 'mg'],
    ['sodio_mg', 'Sodio', 'mg'], ['potasio_mg', 'Potasio', 'mg'], ['magnesio_mg', 'Magnesio', 'mg'],
    ['zinc_mg', 'Zinc', 'mg'], ['cobre_mg', 'Cobre', 'mg'], ['manganeso_mg', 'Manganeso', 'mg'] ] },
  { titulo: 'Vitaminas', items: [
    ['vita_er', 'Vitamina A (retinol)', 'μg ER'], ['tiamina_mg', 'Tiamina (B1)', 'mg'],
    ['riboflavina_mg', 'Riboflavina (B2)', 'mg'], ['niacina_mg', 'Niacina (B3)', 'mg'],
    ['pantotenico_mg', 'Ác. pantoténico (B5)', 'mg'], ['piridoxina_mg', 'Piridoxina (B6)', 'mg'],
    ['folato_mcg', 'Folato (B9)', 'μg'], ['vitb12_mcg', 'Vitamina B12', 'μg'], ['vitc_mg', 'Vitamina C', 'mg'] ] },
];
const TODOS = [['kcal', 'Energía', 'kcal'], ...SECCIONES.flatMap((s) => s.items)];

const estado = {
  poblacion: 'ninos_y_adultos',
  busqueda: '',
  grupoId: '',
  alimentos: [],
  actual: null, // alimento en detalle
  gramos: 0, // cantidad elegida en la calculadora
  comp: { a: null, b: null },
  eligiendo: null, // 'a' | 'b' cuando buscar sirve para elegir comparación
  lista: [], // [{ id, gramos, alimento }]
};

// ─── 2. API ────────────────────────────────────────────────────────────────────

async function getJSON(path) {
  const res = await fetch(API_URL + path, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return res.json();
}

async function fetchAlimentos({ q, grupo_id, poblacion }) {
  if (USE_MOCK) return filtrarMocks({ q, grupo_id, poblacion });
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (grupo_id) p.set('grupo_id', grupo_id);
  if (poblacion) p.set('poblacion', poblacion);
  const qs = p.toString();
  return getJSON(`/api/alimentos/${qs ? `?${qs}` : ''}`);
}

async function fetchDetalle(id) {
  if (USE_MOCK) return obtenerMockPorId(id);
  return getJSON(`/api/alimentos/${encodeURIComponent(id)}/`);
}

async function fetchGrupos() {
  return USE_MOCK ? gruposMock : getJSON('/api/grupos/');
}

// ─── 3. UTILIDADES ─────────────────────────────────────────────────────────────

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const nf1 = new Intl.NumberFormat('es', { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('es', { maximumFractionDigits: 2 });
const num = (v) => (Math.abs(v) > 0 && Math.abs(v) < 1 ? nf2 : nf1).format(v);
const val = (v, unidad) => (v === null || v === undefined || Number.isNaN(Number(v)) ? '—' : `${num(Number(v))} ${unidad}`);
const factor = (a, gramos) => gramos / (Number(a.porcion_g) || 1);
const escalado = (a, key, gramos) => (a[key] == null ? null : Number(a[key]) * factor(a, gramos));
const poblacionTxt = (p) => POBLACIONES[p] || p || '—';

const ICONO_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2200);
}

// ─── 4. BUSCAR Y DETALLE ───────────────────────────────────────────────────────

function pintarEstadoLista(html) {
  $('#lista-alimentos').innerHTML = html;
}

function pintarCarga() {
  pintarEstadoLista('<div class="skeleton"></div>'.repeat(4));
}

function renderizarLista() {
  const lista = estado.alimentos;
  $('#contador-resultados').textContent =
    lista.length === 1 ? '1 alimento' : `${lista.length} alimentos`;

  if (!lista.length) {
    pintarEstadoLista(`
      <div class="estado">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <p>No encontramos alimentos con esos filtros.</p>
      </div>`);
    return;
  }

  pintarEstadoLista(
    lista.map((a) => `
      <button class="tarjeta" data-id="${esc(a.id)}">
        <div class="tarjeta-fila">
          <div>
            <div class="tarjeta-nombre">${esc(a.nombre)}</div>
            <div class="tarjeta-meta">${esc(a.grupo?.nombre)} · ${esc(num(a.porcion_g))} ${esc(a.unidad_medida || 'g')}</div>
          </div>
          <div class="tarjeta-kcal"><strong>${Math.round(a.kcal)}</strong><span>kcal</span></div>
        </div>
        <div class="macros-mini">
          <span>Prot. <b>${val(a.proteina_g, 'g')}</b></span>
          <span>CHO <b>${val(a.cho_g, 'g')}</b></span>
          <span>Grasa <b>${val(a.grasa_total_g, 'g')}</b></span>
        </div>
      </button>`).join('')
  );
}

async function buscarYRenderizar() {
  pintarCarga();
  try {
    estado.alimentos = await fetchAlimentos({
      q: estado.busqueda.trim(),
      grupo_id: estado.grupoId,
      poblacion: estado.poblacion,
    });
    renderizarLista();
  } catch (err) {
    console.error(err);
    $('#contador-resultados').textContent = '';
    pintarEstadoLista(`
      <div class="estado" role="alert">
        <p>No pudimos conectar con el servidor.</p>
        <button class="btn btn-primario" id="btn-reintentar">Reintentar</button>
      </div>`);
  }
}

let timerBusqueda;
const buscarConDebounce = () => {
  clearTimeout(timerBusqueda);
  timerBusqueda = setTimeout(buscarYRenderizar, 300);
};

async function cargarGrupos() {
  try {
    const grupos = await fetchGrupos();
    $('#chips-grupo').insertAdjacentHTML(
      'beforeend',
      grupos.map((g) => `<button class="chip" data-valor="${esc(g.id)}" aria-pressed="false">${esc(g.nombre)}</button>`).join('')
    );
  } catch (err) {
    console.error(err); // la lista sigue funcionando sin el filtro de grupo
  }
}

async function elegirAlimento(id) {
  let alimento;
  try {
    alimento = await fetchDetalle(id);
  } catch (err) {
    console.error(err);
    return toast('No se pudo cargar el alimento');
  }
  if (!alimento) return toast('Alimento no encontrado');

  if (estado.eligiendo) {
    estado.comp[estado.eligiendo] = alimento;
    estado.eligiendo = null;
    return navegar('comparar');
  }
  estado.actual = alimento;
  estado.gramos = Number(alimento.porcion_g) || 100;
  renderizarDetalle();
  navegar('detalle');
}

function opcionesCalc(a) {
  const p = Number(a.porcion_g) || 100;
  const ops = [
    [p / 2, `½ porción · ${num(p / 2)} g`],
    [p, `1 porción · ${num(p)} g`],
  ];
  if (p !== 100) ops.push([100, '100 g']);
  ops.push([p * 2, `2 porciones · ${num(p * 2)} g`]);
  return ops;
}

function renderizarDetalle() {
  const a = estado.actual;
  const filas = (s) => s.items.map(([k, nombre, u]) => `
    <div class="fila" data-nombre="${esc(nombre.toLowerCase())}">
      <span>${esc(nombre)}</span><b data-nut="${k}" data-u="${esc(u)}">—</b>
    </div>`).join('');

  $('#detalle-contenido').innerHTML = `
    <div>
      <span class="pill">${esc(a.grupo?.nombre)}</span>
      <span class="pill">Para: ${esc(poblacionTxt(a.poblacion))}</span>
    </div>
    <h1 class="detalle-titulo">${esc(a.nombre)}</h1>
    <p class="sub">Porción de referencia: <b>${esc(num(a.porcion_g))} g</b> · unidad de medida: <b>${esc(a.unidad_medida || 'g')}</b></p>

    <section class="calc" aria-labelledby="calc-t">
      <h2 id="calc-t">¿Cuánto va a comer?</h2>
      <p class="sub">Todos los valores de abajo se ajustan a esta cantidad</p>
      <div class="calc-grid" id="calc-ops">
        ${opcionesCalc(a).map(([g, t]) => `<button class="calc-op" data-g="${g}" aria-pressed="false">${t}</button>`).join('')}
      </div>
      <label class="sub" for="calc-gramos">O escribe los gramos</label>
      <div class="calc-input"><input id="calc-gramos" type="text" inputmode="decimal" autocomplete="off" /><span>g</span></div>
      <p class="calc-hint" id="calc-hint"></p>
    </section>

    <div class="metricas">
      <div class="metrica energia"><small>Energía</small><strong><span id="m-kcal">—</span><i>kcal</i></strong></div>
      <div class="metrica"><small>Cantidad</small><strong><span id="m-g">—</span><i>g</i></strong></div>
      <div class="metrica"><small><span class="punto" style="background:var(--primary)"></span>Proteína</small><strong data-nut="proteina_g" data-u="g">—</strong></div>
      <div class="metrica"><small><span class="punto" style="background:var(--accent)"></span>Grasa total</small><strong data-nut="grasa_total_g" data-u="g">—</strong></div>
    </div>

    <div class="info">
      <div><span>Grupo</span><b>${esc(a.grupo?.nombre)}</b></div>
      ${a.subgrupo ? `<div><span>Subgrupo</span><b>${esc(a.subgrupo?.nombre ?? a.subgrupo)}</b></div>` : ''}
      <div><span>Población</span><b>${esc(poblacionTxt(a.poblacion))}</b></div>
    </div>

    <label class="etiqueta" for="input-filtro-nutrientes">¿Buscas un nutriente en particular?</label>
    <div class="campo" style="margin-top:0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" id="input-filtro-nutrientes" placeholder="Ej. hierro, calcio, vitamina C" autocomplete="off" />
    </div>

    <div id="secciones-nutrientes">
      ${SECCIONES.map((s) => `
        <section class="seccion">
          <div class="seccion-cab"><h2>${s.titulo}</h2><span>${s.items.length} nutrientes</span></div>
          ${filas(s)}
        </section>`).join('')}
      <p class="estado" id="sin-nutrientes" hidden>Ningún nutriente coincide.</p>
    </div>`;

  pintarValores();
}

/* Recalcula SOLO los números (no recrea el input: conserva el foco al teclear) */
function pintarValores() {
  const a = estado.actual;
  if (!a) return;
  const g = estado.gramos;
  const porciones = g / (Number(a.porcion_g) || 1);

  $$('[data-nut]', $('#detalle-contenido')).forEach((el) =>
    (el.textContent = val(escalado(a, el.dataset.nut, g), el.dataset.u)));
  $('#m-kcal').textContent = Math.round(a.kcal * porciones);
  $('#m-g').textContent = num(g);

  $$('.calc-op').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.g) === g)));
  const input = $('#calc-gramos');
  if (document.activeElement !== input) input.value = String(g).replace('.', ',');
  $('#calc-hint').textContent =
    porciones === 1 ? '= 1 porción de referencia' : `= ${num(porciones)} porciones de referencia`;
  $('#btn-agregar').textContent = `+ Agregar ${num(g)} g`;
}

function filtrarNutrientes(texto) {
  const t = texto.trim().toLowerCase();
  let totalVisibles = 0;
  $$('#secciones-nutrientes .seccion').forEach((sec) => {
    let visibles = 0;
    $$('.fila', sec).forEach((f) => {
      const ok = f.dataset.nombre.includes(t);
      f.hidden = !ok;
      if (ok) visibles++;
    });
    sec.hidden = visibles === 0;
    totalVisibles += visibles;
  });
  $('#sin-nutrientes').hidden = totalVisibles > 0;
}

// ─── 5. COMPARAR ───────────────────────────────────────────────────────────────

function iniciarComparacion(slot, base) {
  if (base) estado.comp.a = base;
  if (slot === 'b' && base) estado.comp.b = null;
  estado.eligiendo = slot;
  navegar('buscar');
}

function renderizarComparar() {
  const { a, b } = estado.comp;
  const base = Number(a.porcion_g) || 100;
  $('#comp-nota').textContent = `Por porción de ${num(base)} g`;

  const filas = TODOS.map(([k, nombre, u]) => {
    const va = escalado(a, k, base);
    const vb = escalado(b, k, base);
    const max = Math.max(va ?? 0, vb ?? 0);
    const dif = max > 0 && Math.abs((va ?? 0) - (vb ?? 0)) / max >= 0.25;
    const f = (x) => (k === 'kcal' ? (x == null ? '—' : `${Math.round(x)} kcal`) : val(x, u));
    return `<tr class="${dif ? 'dif' : ''}"><td>${esc(nombre)}</td><td>${f(va)}</td><td>${f(vb)}</td></tr>`;
  }).join('');

  const tarjeta = (x, letra, cls) => `
    <div class="ab-card ${cls}">
      <div class="ab-letra">${letra}</div>
      <h2>${esc(x.nombre)}</h2>
      <p class="sub">${esc(x.grupo?.nombre)} · ${esc(num(base))} g</p>
      <button class="link" data-cambiar="${cls}">Cambiar</button>
    </div>`;

  $('#comparar-contenido').innerHTML = `
    <div class="ab">${tarjeta(a, 'A', 'a')}${tarjeta(b, 'B', 'b')}</div>
    <p class="leyenda"><i></i> Filas resaltadas: diferencia de 25 % o más</p>
    <table class="tabla-comp">
      <thead><tr><th scope="col">Nutriente</th><th class="a" scope="col">A</th><th class="b" scope="col">B</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`;
}

// ─── 6. MI LISTA + IMPRESIÓN ───────────────────────────────────────────────────

const LS_LISTA = 'nutri.lista';
function cargarLista() {
  try {
    const l = JSON.parse(localStorage.getItem(LS_LISTA) || '[]');
    if (Array.isArray(l)) estado.lista = l.filter((i) => i?.alimento && i.gramos > 0);
  } catch { /* sin storage: la lista vive solo en memoria */ }
}
function guardarLista() {
  try { localStorage.setItem(LS_LISTA, JSON.stringify(estado.lista)); } catch { /* ignore */ }
  $('#contador-guardados').textContent = estado.lista.length;
}

function agregarALista(alimento, gramos) {
  const existente = estado.lista.find((i) => String(i.id) === String(alimento.id));
  if (existente) existente.gramos += gramos;
  else estado.lista.push({ id: alimento.id, gramos, alimento });
  guardarLista();
  toast(`Agregado: ${alimento.nombre} · ${num(gramos)} g`);
}

function totales() {
  const t = { kcal: 0, prot: 0, cho: 0, grasa: 0, g: 0 };
  estado.lista.forEach(({ alimento: a, gramos }) => {
    t.kcal += escalado(a, 'kcal', gramos) || 0;
    t.prot += escalado(a, 'proteina_g', gramos) || 0;
    t.cho += escalado(a, 'cho_g', gramos) || 0;
    t.grasa += escalado(a, 'grasa_total_g', gramos) || 0;
    t.g += gramos;
  });
  const e = t.prot * 4 + t.cho * 4 + t.grasa * 9 || 1;
  t.pct = { prot: Math.round((t.prot * 400) / e), cho: Math.round((t.cho * 400) / e), grasa: Math.round((t.grasa * 900) / e) };
  return t;
}

function renderizarLista_() {
  const cont = $('#lista-contenido');
  const n = estado.lista.length;
  if (!n) {
    cont.innerHTML = `
      <h1 class="titulo-vista">Mi lista</h1>
      <div class="estado">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>
        <p>Aún no has agregado alimentos.<br />Los totales se suman solos.</p>
        <button class="btn btn-primario" data-ir="buscar">Buscar alimentos</button>
      </div>`;
    return;
  }
  const t = totales();
  const items = estado.lista.map(({ alimento: a, gramos }, i) => {
    const p = gramos / (Number(a.porcion_g) || 1);
    return `
      <div class="item">
        <div>
          <h3>${esc(a.nombre)}</h3>
          <p>${num(p)} ${p === 1 ? 'porción' : 'porciones'} · ${Math.round(escalado(a, 'kcal', gramos))} kcal · ${num(gramos)} g</p>
        </div>
        <div class="stepper" role="group" aria-label="Cantidad de ${esc(a.nombre)}">
          <button data-menos="${i}" aria-label="Quitar una porción" ${gramos - a.porcion_g <= 0 ? 'disabled' : ''}>−</button>
          <output>${num(p)}</output>
          <button data-mas="${i}" aria-label="Agregar una porción">+</button>
        </div>
        <button class="btn-quitar" data-quitar="${i}" aria-label="Quitar ${esc(a.nombre)}">${ICONO_X}</button>
      </div>`;
  }).join('');

  cont.innerHTML = `
    <div class="lista-cab">
      <div>
        <h1 class="titulo-vista">Mi lista</h1>
        <p class="sub">${n} ${n === 1 ? 'alimento' : 'alimentos'} · los totales se suman solos</p>
      </div>
      <button class="btn" id="btn-imprimir">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M6 14h12v7H6z"/></svg>
        Imprimir / PDF
      </button>
    </div>
    <section class="total" aria-label="Totales">
      <div class="total-fila">
        <div><small>Energía total</small><div class="total-num">${Math.round(t.kcal)}<i>kcal</i></div></div>
        <div><small>Porción total</small><div class="total-g">${num(t.g)} g</div></div>
      </div>
      <div class="barra-macros" aria-hidden="true">
        <span style="flex:${t.pct.prot || 0.01};background:var(--seg-prot)"></span>
        <span style="flex:${t.pct.cho || 0.01};background:var(--seg-cho)"></span>
        <span style="flex:${t.pct.grasa || 0.01};background:var(--seg-fat)"></span>
      </div>
      <div class="macros3">
        <div>● Proteína<b>${num(t.prot)} g</b>${t.pct.prot} % kcal</div>
        <div>● Carbohid.<b>${num(t.cho)} g</b>${t.pct.cho} % kcal</div>
        <div>● Grasa<b>${num(t.grasa)} g</b>${t.pct.grasa} % kcal</div>
      </div>
    </section>
    ${items}
    <button class="agregar-otro" data-ir="buscar">+ Buscar otro alimento</button>
    <div class="centro"><button class="btn-texto" id="btn-vaciar">Vaciar lista</button></div>`;
}

function imprimirLista() {
  const t = totales();
  const filas = estado.lista.map(({ alimento: a, gramos }) => `
    <tr><td>${esc(a.nombre)}</td><td>${esc(a.grupo?.nombre)}</td><td>${num(gramos)} g</td>
    <td>${Math.round(escalado(a, 'kcal', gramos))}</td><td>${val(escalado(a, 'proteina_g', gramos), 'g')}</td>
    <td>${val(escalado(a, 'cho_g', gramos), 'g')}</td><td>${val(escalado(a, 'grasa_total_g', gramos), 'g')}</td></tr>`).join('');
  const fecha = new Date().toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });

  $('#hoja-impresion').innerHTML = `
    <div class="hoja-cab">
      <div><h1>NutriConsulta</h1><div>Lista de trabajo</div></div>
      <div class="hoja-datos">
        Fecha: <b>${fecha}</b><br />Nutricionista: <b>${esc(NUTRICIONISTA)}</b><br />Población: <b>${esc(poblacionTxt(estado.poblacion))}</b>
      </div>
    </div>
    <div class="hoja-pac">Paciente: <span></span></div>
    <h2>Resumen de la lista</h2>
    <div class="hoja-res">
      <div>Energía<b>${Math.round(t.kcal)} kcal</b></div><div>Proteína<b>${num(t.prot)} g</b></div>
      <div>Carbohidratos<b>${num(t.cho)} g</b></div><div>Grasa<b>${num(t.grasa)} g</b></div>
      <div>Porción total<b>${num(t.g)} g</b></div>
    </div>
    <p>Valores calculados según la cantidad de cada alimento</p>
    <table>
      <thead><tr><th>Alimento</th><th>Grupo</th><th>Cantidad</th><th>kcal</th><th>Proteína</th><th>Carbohid.</th><th>Grasa</th></tr></thead>
      <tbody>${filas}</tbody>
      <tfoot><tr><td>Total</td><td></td><td>${num(t.g)} g</td><td>${Math.round(t.kcal)}</td><td>${num(t.prot)} g</td><td>${num(t.cho)} g</td><td>${num(t.grasa)} g</td></tr></tfoot>
    </table>
    <p style="margin-top:14pt;color:#555">Distribución de la energía: proteína ${t.pct.prot} % · carbohidratos ${t.pct.cho} % · grasa ${t.pct.grasa} %</p>
    <div class="hoja-obs"><h3 style="font-family:var(--font-sans);font-size:13pt;margin-bottom:8pt">Observaciones</h3><i></i><i></i><i></i><i></i></div>
    <div class="hoja-pie"><span>Generado con NutriConsulta</span><span>Valores por porción de la tabla de composición</span></div>`;
  window.print();
}

// ─── 7. AJUSTES ────────────────────────────────────────────────────────────────

const ajustes = { fs: 'normal', tema: 'claro' };
const mqOscuro = matchMedia('(prefers-color-scheme: dark)');

function aplicarAjustes() {
  const oscuro = ajustes.tema === 'oscuro' || (ajustes.tema === 'sistema' && mqOscuro.matches);
  document.documentElement.dataset.theme = oscuro ? 'dark' : 'light';
  document.documentElement.dataset.fs = ajustes.fs;
  $$('#ajuste-fs [data-fs]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.fs === ajustes.fs)));
  $$('#ajuste-tema [data-tema]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.tema === ajustes.tema)));
}
function cargarAjustes() {
  try { Object.assign(ajustes, JSON.parse(localStorage.getItem('nutri.ajustes') || '{}')); } catch { /* defaults */ }
  aplicarAjustes();
}
function guardarAjustes() {
  try { localStorage.setItem('nutri.ajustes', JSON.stringify(ajustes)); } catch { /* ignore */ }
  aplicarAjustes();
}

// ─── 8. ROUTER + INIT ──────────────────────────────────────────────────────────

const CON_NAV = new Set(['buscar', 'lista']);

function navegar(vista) {
  if (location.hash === `#${vista}`) mostrar(vista);
  else location.hash = vista;
}

function mostrar(vista) {
  /* Guardas: no mostrar vistas sin datos (p. ej. recarga en #detalle) */
  if (vista === 'detalle' && !estado.actual) vista = 'buscar';
  if (vista === 'comparar' && !(estado.comp.a && estado.comp.b)) vista = 'buscar';
  if (!$(`[data-vista="${vista}"]`)) vista = 'buscar';

  $$('[data-vista]').forEach((v) => (v.hidden = v.dataset.vista !== vista));
  $('#nav').hidden = !CON_NAV.has(vista);
  $$('.nav-btn').forEach((b) => b.toggleAttribute('aria-current', false));
  $(`#nav-${vista}`)?.setAttribute('aria-current', 'page');

  if (vista === 'buscar') {
    const el = estado.eligiendo;
    $('#titulo-buscar').textContent = el ? `Elige el alimento ${el.toUpperCase()}` : 'Buscar alimento';
    $('#sub-buscar').textContent = el ? 'Toca uno para compararlo' : 'Tabla de composición de alimentos';
  }
  if (vista === 'comparar') renderizarComparar();
  if (vista === 'lista') renderizarLista_();
  window.scrollTo(0, 0);
}

function registrarEventos() {
  window.addEventListener('hashchange', () => mostrar(location.hash.slice(1) || 'buscar'));
  mqOscuro.addEventListener('change', () => ajustes.tema === 'sistema' && aplicarAjustes());

  /* Delegación global: navegación y volver */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.ir) {
      if (t.dataset.ir === 'buscar') estado.eligiendo = null;
      navegar(t.dataset.ir);
    } else if (t.hasAttribute('data-volver')) {
      estado.eligiendo = null;
      history.length > 1 && location.hash ? history.back() : navegar('buscar');
    }
  });

  /* Buscar */
  $('#chips-poblacion').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    $$('#chips-poblacion .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    estado.poblacion = b.dataset.valor;
    buscarYRenderizar();
  });
  $('#chips-grupo').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    $$('#chips-grupo .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    estado.grupoId = b.dataset.valor;
    buscarYRenderizar();
  });
  $('#input-busqueda').addEventListener('input', (e) => {
    estado.busqueda = e.target.value;
    buscarConDebounce();
  });
  $('#lista-alimentos').addEventListener('click', (e) => {
    if (e.target.closest('#btn-reintentar')) return buscarYRenderizar();
    const t = e.target.closest('.tarjeta');
    if (t) elegirAlimento(t.dataset.id);
  });

  /* Detalle */
  $('#detalle-contenido').addEventListener('click', (e) => {
    const op = e.target.closest('.calc-op');
    if (op) {
      estado.gramos = Number(op.dataset.g);
      pintarValores();
    }
  });
  $('#detalle-contenido').addEventListener('input', (e) => {
    if (e.target.id === 'calc-gramos') {
      const v = parseFloat(e.target.value.replace(',', '.'));
      if (Number.isFinite(v) && v > 0 && v <= 10000) {
        estado.gramos = v;
        pintarValores();
      }
    } else if (e.target.id === 'input-filtro-nutrientes') {
      filtrarNutrientes(e.target.value);
    }
  });
  $('#detalle-contenido').addEventListener('focusout', (e) => {
    if (e.target.id === 'calc-gramos') pintarValores(); // normaliza el texto al salir
  });
  $('#btn-agregar').addEventListener('click', () => estado.actual && agregarALista(estado.actual, estado.gramos));
  $('#btn-comparar').addEventListener('click', () => estado.actual && iniciarComparacion('b', estado.actual));

  /* Comparar */
  $('#comparar-contenido').addEventListener('click', (e) => {
    const c = e.target.closest('[data-cambiar]');
    if (c) iniciarComparacion(c.dataset.cambiar);
  });
  const base = () => Number(estado.comp.a?.porcion_g) || 100;
  $('#btn-add-a').addEventListener('click', () => estado.comp.a && agregarALista(estado.comp.a, base()));
  $('#btn-add-b').addEventListener('click', () => estado.comp.b && agregarALista(estado.comp.b, base()));

  /* Mi lista */
  $('#lista-contenido').addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    const idx = (k) => Number(t.dataset[k]);
    const paso = (i) => Number(estado.lista[i].alimento.porcion_g) || 100;
    if (t.dataset.mas !== undefined) estado.lista[idx('mas')].gramos += paso(idx('mas'));
    else if (t.dataset.menos !== undefined) estado.lista[idx('menos')].gramos -= paso(idx('menos'));
    else if (t.dataset.quitar !== undefined) estado.lista.splice(idx('quitar'), 1);
    else if (t.id === 'btn-vaciar') {
      if (!confirm('¿Vaciar toda la lista?')) return;
      estado.lista = [];
    } else if (t.id === 'btn-imprimir') return imprimirLista();
    else return;
    guardarLista();
    renderizarLista_();
  });

  /* Ajustes */
  $('#ajuste-fs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-fs]');
    if (b) { ajustes.fs = b.dataset.fs; guardarAjustes(); }
  });
  $('#ajuste-tema').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tema]');
    if (b) { ajustes.tema = b.dataset.tema; guardarAjustes(); }
  });
}

async function init() {
  cargarAjustes();
  cargarLista();
  guardarLista(); // sincroniza el contador
  registrarEventos();
  mostrar(location.hash.slice(1) || 'buscar');
  await cargarGrupos();
  await buscarYRenderizar();
}

init();
