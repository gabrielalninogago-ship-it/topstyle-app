/* =========================================================
   TopStyle App — lógica Alpine
   Paso 4: búsqueda + filtrado por tabs (y sub-tabs de Beauty Color).
   Agregar al carrito sigue inerte (Paso 5/6).
   ========================================================= */

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    // --- Estado general ---
    pantalla: 'inicio',        // 'inicio' | 'catalogo' | 'carrito'
    nombre: '',                // ¿Cómo te llamamos? (no persiste aún, Paso 9)

    // --- Catálogo ---
    productos: [],             // se llena desde data/catalogo.json
    tabActivo: 'todos',        // tab principal seleccionado
    subActivo: 'todos',        // sub-tab dentro de Beauty Color
    busqueda: '',              // término del buscador

    // --- Carrito (en memoria; la persistencia es el Paso 9) ---
    carrito: [],               // items: { id, qty, variant? }
    toast: '',                 // mensaje efímero de feedback
    toastTimer: null,

    // Tabs principales (en orden). 'todos' es el primero.
    tabs: [
      { key: 'todos',       label: 'Todos' },
      { key: 'coloracion',  label: 'Question Coloración' },
      { key: 'intelligent', label: 'Intelligent Series' },
      { key: 'styling',     label: 'Styling' },
      { key: 'salon',       label: 'Línea Salón' },
      { key: 'beautycolor', label: 'Beauty Color' },
    ],

    // Carga inicial del catálogo
    async init() {
      try {
        const resp = await fetch('data/catalogo.json');
        const data = await resp.json();
        this.productos = data.productos || [];
      } catch (e) {
        console.error('No se pudo cargar el catálogo:', e);
      }
    },

    // --- Selección de tabs ---
    seleccionarTab(key) {
      this.tabActivo = key;
      this.subActivo = 'todos';   // al cambiar de línea, reseteo el sub-tab
      this.busqueda = '';         // y limpio la búsqueda
    },

    // --- Carrito ---
    // Un item se identifica por id + (código de variante si tiene). Mismo producto
    // con distinto tono = items separados.
    _buscarItem(id, code) {
      return this.carrito.find(i => i.id === id && (i.variant ? i.variant.code : null) === code);
    },
    agregar(producto, variant = null, qty = 1, silencioso = false) {
      const code = variant ? variant.code : null;
      const existente = this._buscarItem(producto.id, code);
      if (existente) existente.qty += qty;
      else this.carrito.push(variant ? { id: producto.id, qty, variant } : { id: producto.id, qty });
      if (!silencioso) this.mostrarToast(`${producto.nombre} agregado`);
    },
    // Abre el modal de tono (módulo vanilla js/color-modal.js) y agrega al
    // carrito los tonos que el cliente elija. Pieza pegamento de REVISAR-2.
    abrirTono(producto) {
      if (!window.openColorPicker) return;
      window.openColorPicker(
        { line: producto.lineaVariante, label: producto.nombre },
        (seleccion) => {
          if (!seleccion || !seleccion.length) return;
          let total = 0;
          seleccion.forEach(s => {
            this.agregar(producto, { code: s.code, name: s.name, hex: s.hex, line: s.line }, s.qty, true);
            total += s.qty;
          });
          const txt = seleccion.length === 1 ? `tono ${seleccion[0].code}` : `${seleccion.length} tonos`;
          this.mostrarToast(`${producto.nombre}: ${txt} (${total} u.)`);
        }
      );
    },
    quitar(id, code = null) {
      this.carrito = this.carrito.filter(i => !(i.id === id && (i.variant ? i.variant.code : null) === code));
    },
    cambiarCantidad(id, qty, code = null) {
      const item = this._buscarItem(id, code);
      if (!item) return;
      if (qty <= 0) this.quitar(id, code);
      else item.qty = qty;
    },
    get cantidadTotal() {
      return this.carrito.reduce((acc, i) => acc + i.qty, 0);
    },
    productoPorId(id) {
      return this.productos.find(p => p.id === id);
    },
    // Items del carrito enriquecidos con los datos del producto, para el render
    // de la Pantalla 3 (foto, nombre).
    get itemsCarrito() {
      return this.carrito.map(i => ({ ...i, prod: this.productoPorId(i.id) }));
    },

    // --- Toast (feedback efímero al agregar) ---
    mostrarToast(msg) {
      this.toast = msg;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toast = ''; }, 2800);
    },

    // --- Helpers de datos ---
    get lineas() {
      return this.tabs.filter(t => t.key !== 'todos');
    },
    productosDeLinea(key) {
      return this.productos.filter(p => p.linea === key);
    },
    get subBeauty() {
      const orden = [];
      this.productosDeLinea('beautycolor').forEach(p => {
        if (p.sublinea && !orden.includes(p.sublinea)) orden.push(p.sublinea);
      });
      return orden;
    },
    productosDeSublinea(sub) {
      return this.productos.filter(p => p.sublinea === sub);
    },

    // --- Búsqueda ---
    // Normaliza: minúsculas y sin acentos, para que "argan" matchee "Argán".
    normaliza(s) {
      return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    },
    get hayBusqueda() {
      return this.busqueda.trim().length > 0;
    },
    get resultadosBusqueda() {
      const t = this.normaliza(this.busqueda.trim());
      return this.productos.filter(p =>
        this.normaliza(p.nombre).includes(t) ||
        (p.codigo && this.normaliza(p.codigo).includes(t)) ||
        this.normaliza(p.marca).includes(t)
      );
    },

    // --- Vista unificada: SIEMPRE una lista de grupos { titulo, productos } ---
    // Así el HTML usa un solo molde de card para todos los casos.
    get gruposVisibles() {
      // 1) Búsqueda activa: un único grupo con los resultados.
      if (this.hayBusqueda) {
        const r = this.resultadosBusqueda;
        return [{ titulo: `${r.length} resultado${r.length === 1 ? '' : 's'}`, productos: r }];
      }
      const k = this.tabActivo;

      // 2) "Todos": cada línea es un grupo; Beauty Color se abre en sus sub-líneas.
      if (k === 'todos') {
        const grupos = [];
        this.lineas.forEach(linea => {
          if (linea.key === 'beautycolor') {
            this.subBeauty.forEach(sub => {
              grupos.push({ titulo: `Beauty Color · ${sub}`, productos: this.productosDeSublinea(sub) });
            });
          } else {
            grupos.push({ titulo: linea.label, productos: this.productosDeLinea(linea.key) });
          }
        });
        return grupos;
      }

      // 3) Beauty Color: filtra por sub-tab (o todas las sub-líneas).
      if (k === 'beautycolor') {
        const subs = this.subActivo === 'todos' ? this.subBeauty : [this.subActivo];
        return subs.map(sub => ({ titulo: sub, productos: this.productosDeSublinea(sub) }));
      }

      // 4) Una línea puntual.
      const linea = this.tabs.find(t => t.key === k);
      return [{ titulo: linea.label, productos: this.productosDeLinea(k) }];
    },

    get sinResultados() {
      return this.gruposVisibles.every(g => g.productos.length === 0);
    },
  }));
});
