/* =========================================================
   TopStyle App — lógica Alpine
   Paso 3: carga del catálogo y render del grid (sin interactividad).
   El filtrado por tabs/búsqueda se conecta en el Paso 4, y agregar
   al carrito en el Paso 5.
   ========================================================= */

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    // --- Estado general ---
    pantalla: 'inicio',        // 'inicio' | 'catalogo' | 'carrito'
    nombre: '',                // ¿Cómo te llamamos? (no persiste aún, Paso 9)

    // --- Catálogo ---
    productos: [],             // se llena desde data/catalogo.json
    tabActivo: 'todos',        // inerte en el Paso 3 (filtrado = Paso 4)

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

    // --- Helpers de agrupación para el render ---

    // Las 5 líneas de producto (sin 'todos'), en el orden de los tabs.
    get lineas() {
      return this.tabs.filter(t => t.key !== 'todos');
    },

    // Productos de una línea dada.
    productosDeLinea(key) {
      return this.productos.filter(p => p.linea === key);
    },

    // Sub-líneas de Beauty Color, en orden de aparición.
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
  }));
});
