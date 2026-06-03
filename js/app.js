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
