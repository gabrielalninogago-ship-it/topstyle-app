/* =========================================================
   TopStyle App — lógica Alpine
   Paso 4: búsqueda + filtrado por tabs (y sub-tabs de Beauty Color).
   Agregar al carrito sigue inerte (Paso 5/6).
   ========================================================= */

// Claves de localStorage (PRD §5). Centralizadas para no repetir strings.
// 'cliente_data' del PRD se descartó: con el form simplificado (Paso 8) el único
// dato del cliente es el nombre, que ya vive en 'topstyle_nombre'.
// 'pedido_frecuente' se implementa en el Paso 10 (necesita su checkbox y pantalla).
const LS = {
  nombre:    'topstyle_nombre',
  carrito:   'topstyle_carrito_actual',
  ultimos:   'topstyle_ultimos_pedidos',
  frecuente: 'topstyle_pedido_frecuente',
};

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

    // --- Carrito (persistido en localStorage, Paso 9) ---
    carrito: [],               // items: { id, qty, variant? }
    adicionales: '',           // textarea: productos fuera del catálogo (opcional)
    notas: '',                 // textarea: observaciones (opcional)
    guardarFrecuente: false,   // checkbox del carrito: guardar como pedido frecuente
    toast: '',                 // mensaje efímero de feedback
    toastTimer: null,

    // --- Inicio "ya estuvo antes" (Paso 10) ---
    // Snapshot al cargar: define si mostramos la versión personalizada. No es
    // reactivo al nombre en vivo, así tipearlo la primera vez no da vuelta la pantalla.
    recurrente: false,
    ultimoPedido: null,        // primer elemento de topstyle_ultimos_pedidos
    pedidoFrecuente: null,     // topstyle_pedido_frecuente

    // Tabs principales (en orden). 'todos' es el primero.
    tabs: [
      { key: 'todos',       label: 'Todos' },
      { key: 'coloracion',  label: 'Question Coloración' },
      { key: 'intelligent', label: 'Intelligent Series' },
      { key: 'styling',     label: 'Styling' },
      { key: 'salon',       label: 'Línea Salón' },
      { key: 'beautycolor', label: 'Beauty Color' },
    ],

    // Carga inicial: catálogo + estado persistido en localStorage.
    async init() {
      // Restauro lo guardado ANTES de prender los watchers, así cargar no
      // dispara una re-escritura innecesaria.
      this.nombre = this._leerLS(LS.nombre, '');
      this.carrito = this._leerLS(LS.carrito, []);

      // Inicio "ya estuvo": leo último pedido y frecuente, y fijo el snapshot.
      this.ultimoPedido = this._leerLS(LS.ultimos, [])[0] || null;
      this.pedidoFrecuente = this._leerLS(LS.frecuente, null);
      this.recurrente = !!this.nombre || !!this.ultimoPedido || !!this.pedidoFrecuente;

      // El nombre es un valor simple: lo persisto con un watcher.
      this.$watch('nombre', (v) => this._guardarLS(LS.nombre, v));
      // El carrito se persiste a mano en cada mutación (ver _persistirCarrito),
      // para no depender de que el watcher detecte cambios profundos de cantidad.

      try {
        const resp = await fetch('data/catalogo.json');
        const data = await resp.json();
        this.productos = data.productos || [];
      } catch (e) {
        console.error('No se pudo cargar el catálogo:', e);
      }
    },

    // --- Persistencia (localStorage, PRD §5) ---
    // Envuelven el acceso en try/catch: en incógnito o con storage bloqueado,
    // la app no debe romperse, solo no recordar.
    _leerLS(clave, fallback) {
      try {
        const v = localStorage.getItem(clave);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    _guardarLS(clave, valor) {
      try {
        localStorage.setItem(clave, JSON.stringify(valor));
      } catch (e) { /* storage no disponible: seguimos sin persistir */ }
    },

    // --- Inicio "ya estuvo antes" (Paso 10) ---
    get saludo() {
      return this.nombre ? `Hola, ${this.nombre} 👋` : '¡Qué bueno verte de nuevo!';
    },
    // Resumen corto de un pedido para las tarjetas: primeros 3 items + "y N más".
    resumenPedido(p) {
      if (!p) return '';
      const items = p.items || [];
      if (items.length) {
        const partes = items.slice(0, 3).map(i => {
          const prod = this.productoPorId(i.id);
          const nombre = prod ? prod.nombre : i.id;
          const tono = i.variant ? ` (${i.variant.code})` : '';
          return `${i.qty}× ${nombre}${tono}`;
        });
        const resto = items.length - 3;
        let txt = partes.join(', ');
        if (resto > 0) txt += `, y ${resto} más`;
        return txt;
      }
      // Pedido sin productos del catálogo pero con texto libre.
      return p.adicionales ? 'Productos adicionales' : 'Pedido vacío';
    },
    get resumenUltimo() { return this.resumenPedido(this.ultimoPedido); },
    get resumenFrecuente() { return this.resumenPedido(this.pedidoFrecuente); },

    // Carga un pedido guardado en el carrito y lleva a la Pantalla 3.
    // conNotas: el último pedido trae sus notas; el frecuente no (es plantilla).
    _cargarEnCarrito(p, conNotas) {
      if (!p) return;
      this.carrito = (p.items || []).map(i => (
        i.variant ? { id: i.id, qty: i.qty, variant: i.variant } : { id: i.id, qty: i.qty }
      ));
      this.adicionales = p.adicionales || '';
      this.notas = conNotas ? (p.notas || '') : '';
      this._persistirCarrito();
      this.pantalla = 'carrito';
    },
    cargarUltimo() { this._cargarEnCarrito(this.ultimoPedido, true); },
    cargarFrecuente() { this._cargarEnCarrito(this.pedidoFrecuente, false); },

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
      this._persistirCarrito();
      if (!silencioso) this.mostrarToast(`${producto.nombre} agregado`);
    },
    // Guarda el carrito en localStorage. Se llama tras cada cambio.
    _persistirCarrito() {
      this._guardarLS(LS.carrito, this.carrito);
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
      this._persistirCarrito();
    },
    cambiarCantidad(id, qty, code = null) {
      const item = this._buscarItem(id, code);
      if (!item) return;
      if (qty <= 0) { this.quitar(id, code); return; }  // quitar ya persiste
      item.qty = qty;
      this._persistirCarrito();
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

    // --- Envío por WhatsApp (Paso 8) ---
    // El botón se habilita si hay productos en el carrito O si el cliente
    // escribió algo en "adicionales". Notas sola no alcanza para enviar.
    get hayAdicionales() {
      return this.adicionales.trim().length > 0;
    },
    get puedeEnviar() {
      return this.carrito.length > 0 || this.hayAdicionales;
    },

    // Agrupa el carrito por producto para armar las líneas del mensaje.
    // Los productos con tono se juntan en una sola línea con la lista de tonos
    // ("(tonos: 7.1, 7.3 x2)"); los simples van con su cantidad ("2 x ...").
    _lineasProductos() {
      const grupos = [];
      const indice = {};
      this.carrito.forEach(item => {
        let g = indice[item.id];
        if (!g) {
          g = { prod: this.productoPorId(item.id), simple: 0, tonos: [] };
          indice[item.id] = g;
          grupos.push(g);
        }
        if (item.variant) g.tonos.push({ code: item.variant.code, qty: item.qty });
        else g.simple += item.qty;
      });

      const lineas = [];
      grupos.forEach(g => {
        const nombre = g.prod ? g.prod.nombre : '(producto)';
        if (g.tonos.length) {
          // Cada tono: solo el código; si la cantidad es >1 se sufija "xN".
          const tonos = g.tonos.map(t => (t.qty > 1 ? `${t.code} x${t.qty}` : t.code)).join(', ');
          lineas.push(`- ${nombre} (tonos: ${tonos})`);
        }
        if (g.simple > 0) lineas.push(`- ${g.simple} x ${nombre}`);
      });
      return lineas;
    },

    // Convierte un textarea libre en líneas con viñeta, descartando renglones vacíos.
    _lineasTexto(texto) {
      return texto.split('\n').map(l => l.trim()).filter(l => l).map(l => `- ${l}`);
    },

    // Arma el mensaje completo según el formato del PRD §7 (sin precios).
    // Cada sección se omite si no tiene contenido.
    construirMensaje() {
      const partes = [];
      partes.push('🛒 Pedido TopStyle');
      partes.push('');
      const nombre = this.nombre.trim();
      partes.push(nombre ? `Hola! Soy ${nombre}` : 'Hola!');

      const prods = this._lineasProductos();
      if (prods.length) {
        partes.push('');
        partes.push('Productos:');
        prods.forEach(l => partes.push(l));
      }
      if (this.hayAdicionales) {
        partes.push('');
        partes.push('Adicionales:');
        this._lineasTexto(this.adicionales).forEach(l => partes.push(l));
      }
      if (this.notas.trim()) {
        partes.push('');
        partes.push('Notas:');
        this._lineasTexto(this.notas).forEach(l => partes.push(l));
      }
      partes.push('');
      partes.push('Enviado desde TopStyle App');
      return partes.join('\n');
    },

    // Abre wa.me en una pestaña nueva con el mensaje ya codificado, guarda el
    // pedido en el historial y deja el carrito vacío para el próximo.
    enviarWhatsApp() {
      if (!this.puedeEnviar) return;
      const numero = window.WHATSAPP_NUMBER;
      const texto = encodeURIComponent(this.construirMensaje());
      window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
      this._guardarHistorial();
      if (this.guardarFrecuente) this._guardarFrecuente();  // antes de vaciar: lee el carrito
      this._vaciarPedido();
      // Refresco el Inicio: ahora hay historial, así que pasa a modo "ya estuvo".
      this.ultimoPedido = this._leerLS(LS.ultimos, [])[0] || null;
      this.recurrente = true;
      this.pantalla = 'inicio';
    },

    // Guarda el carrito actual como pedido frecuente (plantilla: items +
    // adicionales, sin notas ni fecha). Sobrescribe el anterior (PRD §5.3).
    _guardarFrecuente() {
      const frec = {
        items: this.carrito.map(i => (
          i.variant ? { id: i.id, qty: i.qty, variant: i.variant } : { id: i.id, qty: i.qty }
        )),
        adicionales: this.adicionales.trim(),
      };
      this._guardarLS(LS.frecuente, frec);
      this.pedidoFrecuente = frec;  // refresca la tarjeta de Inicio
    },

    // Guarda el pedido recién enviado en 'últimos pedidos' (tope 5, el más nuevo
    // primero). Alimenta la tarjeta "Repetir último pedido" del Paso 10.
    _guardarHistorial() {
      const pedido = {
        fecha: new Date().toISOString(),
        items: this.carrito.map(i => (
          i.variant ? { id: i.id, qty: i.qty, variant: i.variant } : { id: i.id, qty: i.qty }
        )),
        adicionales: this.adicionales.trim(),
        notas: this.notas.trim(),
      };
      const ultimos = this._leerLS(LS.ultimos, []);
      ultimos.unshift(pedido);
      if (ultimos.length > 5) ultimos.length = 5;
      this._guardarLS(LS.ultimos, ultimos);
    },

    // Vacía el carrito y los campos del form. El $watch del carrito persiste el
    // array vacío, así al reabrir la app no reaparece el pedido ya enviado.
    _vaciarPedido() {
      this.carrito = [];
      this.adicionales = '';
      this.notas = '';
      this.guardarFrecuente = false;
      this._persistirCarrito();
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
