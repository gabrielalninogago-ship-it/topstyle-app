/* =========================================================
   TopStyle App — Modal de selección de tono (Coloration / Lumiplex)
   Pieza portada y adaptada del proyecto viejo (handoff). Es JS vanilla
   AISLADO: no usa Alpine. Se expone una sola función pegamento:

     window.openColorPicker({ line, label }, onSelect)

   - line:  'coloration' | 'lumiplex'  (de producto.lineaVariante)
   - label: texto para el encabezado (nombre del producto)
   - onSelect(seleccion): callback que recibe un array
       [{ code, name, hex, line, qty }]  con los tonos elegidos.

   La app Alpine es la que agrega esos tonos al carrito. Acá NO hay
   precios ni lógica de carrito (decisión REVISAR-2/3 del inventario).
   Los tonos salen de data/paletas.json: { code, name, family, hex }.
   ========================================================= */

(function () {
  'use strict';

  // --- Carga perezosa de las paletas (una sola vez) ---
  let PALETAS = null;
  let cargando = null;
  function cargarPaletas() {
    if (PALETAS) return Promise.resolve(PALETAS);
    if (!cargando) {
      cargando = fetch('data/paletas.json')
        .then(r => r.json())
        .then(d => { PALETAS = d; return d; })
        .catch(e => { console.error('No se pudieron cargar las paletas:', e); return {}; });
    }
    return cargando;
  }

  // --- Referencias al DOM del modal (inyectado en index.html) ---
  const bg          = document.getElementById('colorModalBg');
  if (!bg) return;  // si el modal no está en la página, no hago nada
  const eyebrowEl   = document.getElementById('colorModalEyebrow');
  const tituloEl    = document.getElementById('colorModalTitle');
  const cerrarBtn   = document.getElementById('colorModalClose');
  const buscarInput = document.getElementById('colorSearch');
  const limpiarBtn  = document.getElementById('colorSearchClear');
  const familiasEl  = document.getElementById('colorFamilies');
  const gridEl      = document.getElementById('colorGrid');
  const selListEl   = document.getElementById('colorSelectedList');
  const selLabelEl  = document.getElementById('colorSelectedLabel');
  const cancelarBtn = document.getElementById('colorCancelBtn');
  const agregarBtn  = document.getElementById('colorAddBtn');

  // --- Estado interno ---
  let ctx = null;            // { line, label, palette, onSelect }
  let seleccion = [];        // [{ code, qty }] (selección múltiple siempre)
  let familiaActiva = 'all';
  let termino = '';

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // --- Apertura / cierre ---
  function abrir(config, onSelect) {
    cargarPaletas().then(() => {
      const palette = (PALETAS[config.line] && PALETAS[config.line].tones) || [];
      ctx = { line: config.line, label: config.label, palette, onSelect };
      seleccion = [];
      familiaActiva = 'all';
      termino = '';
      buscarInput.value = '';
      limpiarBtn.hidden = true;
      selLabelEl.textContent = 'Tonos seleccionados';
      eyebrowEl.textContent = config.label || '';
      tituloEl.textContent = 'Elegí tu tono';
      renderFamilias();
      renderGrid();
      renderSeleccion();
      bg.classList.add('is-open');
      bg.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      // No enfocamos el buscador al abrir: en el celu abría el teclado y
      // comía espacio. El cliente toca el buscador si quiere escribir.
    });
  }
  function cerrar() {
    bg.classList.remove('is-open');
    bg.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  // --- Helpers de datos ---
  const paleta = () => (ctx ? ctx.palette : []);
  const familias = () => ['all', ...Array.from(new Set(paleta().map(c => c.family)))];

  // --- Render: chips de familia ---
  function renderFamilias() {
    familiasEl.innerHTML = familias().map(f => `
      <button class="color-family-chip ${f === familiaActiva ? 'is-active' : ''}"
              data-family="${escapeHtml(f)}" type="button">${f === 'all' ? 'Todos' : escapeHtml(f)}</button>
    `).join('');
  }

  // --- Render: grilla de tonos ---
  function renderGrid() {
    const t = termino.toLowerCase();
    const lista = paleta().filter(c => {
      const familiaOk = familiaActiva === 'all' || c.family === familiaActiva;
      const terminoOk = !t || c.code.toLowerCase().includes(t) ||
        c.name.toLowerCase().includes(t) || c.family.toLowerCase().includes(t);
      return familiaOk && terminoOk;
    });
    if (!lista.length) {
      gridEl.innerHTML = `<div class="color-grid__empty">No hay tonos que coincidan.</div>`;
      return;
    }
    gridEl.innerHTML = lista.map(c => {
      const sel = seleccion.some(s => s.code === c.code);
      return `
        <div class="color-card-pick ${sel ? 'is-selected' : ''}" data-code="${escapeHtml(c.code)}">
          <div class="color-swatch" style="background:${escapeHtml(c.hex)}"></div>
          <div class="info">
            <div class="code">${escapeHtml(c.code)}</div>
            <div class="name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</div>
          </div>
          <div class="check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
        </div>`;
    }).join('');
  }

  // --- Render: panel de tonos seleccionados (con stepper de cantidad) ---
  function renderSeleccion() {
    if (!seleccion.length) {
      selListEl.innerHTML = `<div class="color-selected-empty">Tocá uno o más tonos.</div>`;
      agregarBtn.disabled = true;
      return;
    }
    const pal = paleta();
    selListEl.innerHTML = seleccion.map(s => {
      const c = pal.find(x => x.code === s.code);
      if (!c) return '';
      return `
        <div class="color-selected-item" data-code="${escapeHtml(s.code)}">
          <div class="color-swatch" style="background:${escapeHtml(c.hex)}"></div>
          <div class="color-selected-item__info">
            <div class="color-selected-item__code">${escapeHtml(c.code)}</div>
            <div class="color-selected-item__name">${escapeHtml(c.name)}</div>
          </div>
          <div class="color-qty-stepper">
            <button data-act="dec" aria-label="Restar" type="button">−</button>
            <span>${s.qty}</span>
            <button data-act="inc" aria-label="Sumar" type="button">+</button>
          </div>
          <button class="color-selected-item__remove" data-act="del" type="button">Quitar</button>
        </div>`;
    }).join('');
    agregarBtn.disabled = false;
  }

  // --- Eventos ---
  familiasEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-family-chip');
    if (!btn) return;
    familiaActiva = btn.dataset.family;
    renderFamilias();
    renderGrid();
  });

  buscarInput.addEventListener('input', (e) => {
    termino = e.target.value.trim();
    limpiarBtn.hidden = e.target.value.length === 0;
    renderGrid();
  });

  // Botón "×" para limpiar la búsqueda de un toque.
  limpiarBtn.addEventListener('click', () => {
    buscarInput.value = '';
    termino = '';
    limpiarBtn.hidden = true;
    renderGrid();
    buscarInput.focus();
  });

  gridEl.addEventListener('click', (e) => {
    const card = e.target.closest('.color-card-pick');
    if (!card) return;
    const code = card.dataset.code;
    const idx = seleccion.findIndex(s => s.code === code);
    if (idx >= 0) seleccion.splice(idx, 1);
    else seleccion.push({ code, qty: 1 });
    renderGrid();
    renderSeleccion();
  });

  selListEl.addEventListener('click', (e) => {
    const row = e.target.closest('.color-selected-item');
    if (!row) return;
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const idx = seleccion.findIndex(s => s.code === row.dataset.code);
    if (idx < 0) return;
    const act = btn.dataset.act;
    if (act === 'inc') seleccion[idx].qty++;
    else if (act === 'dec') { if (seleccion[idx].qty > 1) seleccion[idx].qty--; else seleccion.splice(idx, 1); }
    else if (act === 'del') seleccion.splice(idx, 1);
    renderGrid();
    renderSeleccion();
  });

  agregarBtn.addEventListener('click', () => {
    if (!ctx || !seleccion.length) return;
    const pal = paleta();
    const salida = seleccion.map(s => {
      const c = pal.find(x => x.code === s.code);
      return { code: c.code, name: c.name, hex: c.hex, line: ctx.line, qty: s.qty };
    });
    const cb = ctx.onSelect;
    cerrar();
    if (cb) cb(salida);
  });

  cancelarBtn.addEventListener('click', cerrar);
  cerrarBtn.addEventListener('click', cerrar);
  bg.addEventListener('click', (e) => { if (e.target === bg) cerrar(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bg.classList.contains('is-open')) cerrar();
  });

  // --- Exponer la función pegamento ---
  window.openColorPicker = abrir;
})();
