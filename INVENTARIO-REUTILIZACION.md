# Inventario de Reutilización — App Pública TopStyle

> **Paso 1.5 del PRD.** Este documento mapea qué piezas del proyecto viejo
> (handoff "Pedido Rápido") se reutilizan en la app nueva, cómo y con qué
> limpieza. **NO se copia código todavía.** Es solo el plano de dónde sale
> cada cosa cuando construyamos las pantallas (Pasos 2 en adelante).
>
> **Fecha:** 2026-06-02 · **Autor:** Clau, validado con Gabb.

---

## Cómo leer esto

Cuatro categorías:

- **A. Reutilización directa** — se copia tal cual o casi.
- **B. Reutilización con adaptación** — se copia pero hay que cambiarle cosas.
- **C. Se rehace desde cero** — no existe en el handoff, es nuevo.
- **D. No se trae** — se descarta.

**Base del handoff** (todo lo que diga "handoff:" cuelga de acá):
`topstyle-app-publica/handoff/pedido-rapido-handoff/`

Dentro hay:
- `code/index.html` — el sitio viejo completo, **7353 líneas**. Es la fuente
  real de casi toda la lógica. Acá viven embebidos el modal, el carrito, etc.
- `code/snippets/` — fragmentos ya extraídos del index (más cómodos de leer).
- `data/` — JSON ya exportados: `catalogo.json`, `paletas.json`,
  `product_lines.json`, `cupones.json`.

> ⚠️ Los nombres de los snippets pueden confundir: `qr-panel.js` es JS real
> del panel, `cart.js` es el modelo de carrito (130 líneas, NO el index). El
> index grande es `code/index.html`.

---

## A. Reutilización directa (copiar tal cual o casi)

| # | Pieza | Dónde vive en el handoff | A dónde va en la app nueva | Qué limpiar antes |
|---|---|---|---|---|
| A1 | **Paletas de tonos** (Coloration 109 + Lumiplex 35, con hex reales del color book) | `data/paletas.json` | `data/paletas.json` (o `js/paletas.js`) | Nada de limpieza de contenido. Cada tono ya viene `{code, name, family, hex}`. Solo decidir formato (JSON aparte vs constante JS). |
| A2 | **Mapeo de líneas → prefijos de id** | `data/product_lines.json` | `data/` o constante en JS | Nada. Sirve para clasificar productos por línea en el catálogo. Revisar que la taxonomía de tabs case con el PRD (ver REVISAR-1). |
| A3 | **HTML del modal de tono** (estructura: head, toggle modo, buscador, familias, grid, panel de seleccionados, footer) | `code/snippets/color-modal-html.html` (líneas 1-51) ≡ `code/index.html:4388-4437` | HTML de la Pantalla 2 / componente modal | Quitar el `$ 0` de precio (`#colorTotalPrice`, línea 39 del snippet) y el panel de precio total. Sacar lo que sigue al modal en el snippet: el **welcome-modal de cupón** (líneas 53+) NO se trae. |
| A4 | **CSS del modal de tono** | `code/index.html:2591-2810` aprox (`.color-modal-bg`, `.color-modal`, `.color-families`, `.color-grid`, `.color-selected-panel`) | hoja de estilos de la app | Sacar reglas `html[data-theme="dark"]` (no hay tema oscuro, ver D). Revisar variables CSS usadas (`--text-muted`, etc.) y portarlas. |

---

## B. Reutilización con adaptación

| # | Pieza | Dónde vive en el handoff | A dónde va | Qué adaptar y por qué |
|---|---|---|---|---|
| B1 | **Lógica JS del modal de tono** (LA PIEZA CARA — búsqueda por número/nombre, filtros por familia, multi-select, panel de seleccionados, cantidad por tono). NO rehacer. | `code/index.html` — refs `6651-6660`, estado `6662-6664`, abrir `~6671-6691`, render familias `~6706`, render grid `6711-6740`, panel seleccionados `6742-6772`, botón agregar `6840-6858`, cancelar `6860`. Total ≈ **6651-6862**. | JS de la app (módulo del modal) | (a) **Sacar pricing**: el panel calcula `#colorTotalPrice`; eliminar. (b) **Migrar a Alpine**: hoy usa `addEventListener` + manipulación directa del DOM (`innerHTML`). En la app nueva conviene `x-data`/`x-for`/`x-show`. Decisión: ¿portar a Alpine o dejar este módulo en JS vanilla aislado? (ver REVISAR-2). (c) **Claves de datos**: el modal lee los tonos como `c.c/c.n/c.h` (code/name/hex). El `paletas.json` los expone como `code/name/hex/family`. Hay que adaptar el acceso o normalizar. (d) **Multi-select vs PRD** (ver REVISAR-3). |
| B2 | **Objeto CART** (add, update, remove, clear, count; match por `id+variant.code`; persiste en localStorage) | `code/snippets/cart.js:21-70` ≡ `code/index.html:~6209-6307` | modelo de carrito de la app (estado Alpine + persistencia) | **Sacar `subtotal()` y `hasPrices()`** (líneas 57-68 del snippet): dependen de precios, que no van. **Cambiar la clave** de `topstyle_cart_v1` a `topstyle_carrito_actual` (clave del PRD §5). El shape de item `{id, qty, variant?}` se mantiene. |
| B3 | **Armado del mensaje de WhatsApp** (`buildCartLines` + `sendViaWhatsApp`, junta cliente + items + notas y abre `wa.me`) | `code/snippets/whatsapp-message.js:15-67` ≡ `code/index.html:7035-7088` | función de envío de la app (Pantalla 3) | **Sacar todo pricing**: en `buildCartLines` quitar `lineTotal`, subtotal, cupón, descuento, total (líneas 21-23 y 29-38 del snippet). **Reformatear** al formato del PRD §7 (encabezado `🛒 Pedido TopStyle`, "Productos:", "Notas:", footer "Enviado desde TopStyle App"). El viejo usa `*Nuevo pedido — TopStyle*` y `Observaciones:`. **WHATSAPP_NUMBER**: dejar como constante única (handoff la tiene en `index.html:4593`); el de testing lo pasás vos en el Paso 8. |
| B4 | **HTML + CSS + JS del Panel Pedido Rápido** (tabs por línea + lista de productos con foto/nombre/botón + footer con contador "Ver pedido") | HTML `code/snippets/qr-panel.html` (≡ `index.html:4549-4579`), CSS `code/snippets/qr-panel.css` (208 líneas), JS `code/snippets/qr-panel.js` (≡ `index.html:7256-7348`) | **Base estructural de la Pantalla 2 (Catálogo)** | (a) **Quitar precios**: la lista muestra `formatMoney(p.price)` / "Consultar" (qr-panel.js:43). (b) **De sidebar a pantalla completa**: hoy es un panel lateral deslizante; el PRD lo quiere como pantalla principal con header sticky y footer fijo. Adaptar layout. (c) **Tabs**: revisar taxonomía vs PRD (REVISAR-1). (d) **Migrar listeners a Alpine** (mismo criterio que B1). (e) Reutiliza `addToCart` / `openCart` / `getProductLine` / `isColorProduct` (vienen con B1/B2). |
| B5 | **Catálogo de productos** (72 productos: id, brand, name, description, image, badge, active) | `data/catalogo.json` (también hardcoded en `index.html:4805-5754`) | `data/catalogo.json` de la app | **Sacar el campo `price`** de los 72 productos (decisión de negocio del PRD: sin precios). Revisar campo `category` y `badge`: ver si se usan o se simplifican. Mantener `active` para no listar desactivados. |
| B6 | **Helpers de utilidad** (`escapeHtml`, `formatMoney`, `showToast`, `$`, `$$`) | `code/index.html:5639-5680` aprox | utilidades de la app | `formatMoney` probablemente **se descarta** (no hay precios). `escapeHtml` y `showToast` sirven. `$`/`$$` se vuelven innecesarios si vamos a Alpine. Adaptar según cuánto Alpine usemos. |

---

## C. Se rehace desde cero (no existe en el handoff)

- **Flujo de 3 pantallas** (Inicio → Catálogo → Carrito). El handoff es una sola
  página larga (home + catálogo + carrito drawer). La navegación entre pantallas
  es nueva.
- **Pantalla 1 (Inicio)** completa: saludo, "primera visita" vs "ya estuvo antes",
  campo de nombre, accesos rápidos.
- **Persistencia con las 5 claves del PRD §5**: `topstyle_nombre`,
  `topstyle_cliente_data`, `topstyle_ultimos_pedidos`, `topstyle_pedido_frecuente`,
  `topstyle_carrito_actual`. El handoff solo persiste el carrito (`topstyle_cart_v1`)
  y cosas de cupones. Las otras 4 claves son nuevas.
- **Tarjetas "Repetir último pedido" y "Pedido frecuente"** en Inicio (lógica de
  los últimos 5 pedidos + el frecuente curado).
- **Form de datos del cliente con auto-relleno** desde localStorage en el Carrito.
  (El handoff tiene un form de pedido en `index.html:4050-4163`, pero sin
  auto-relleno ni las reglas del PRD; se rehace siguiendo el PRD §4.4.)
- **Sistema de promos** (banners en Inicio desde `promos.json`, PRD §6). No existe
  en el handoff.
- **PWA**: `manifest.json` + service worker + íconos (PRD §8). No existe.

---

## D. No se trae (se descarta)

- **Tema claro/oscuro** (`data-theme`, `#themeToggle`). La app es de un solo tema.
- **Hero / portada del website**, **carrusel de bestsellers**, **strips por línea**
  (los 4 carruseles mini), **secciones institucionales** (públicos, acceso
  profesional, cómo comprar, contacto, footer del website).
- **Navegación del website** (header con nav, buscador global colapsable del nav).
- **Sistema de cupones completo**: `COUPONS`, validación de expiración, cupón
  activo, descuentos, totales (`cart.js:72-131`, `whatsapp-message.js` parte de
  totales). Fuera del MVP (PRD §3.2).
- **Welcome modal de bienvenida** + pill flotante de cupón (`color-modal-html.html:53+`).
- **Panel admin de cupones** (`code/admin.html`, 1139 líneas).
- **`review.html`** (auditoría visual de catálogo) — ni siquiera está en el paquete.
- **Fuentes Playfair Display + Inter** (Google Fonts). La app puede ser
  visualmente más simple; se decide tipografía aparte en el pulido.
- **`data/cupones.json`** — no se usa.

---

## Decisiones revisadas con Gabb

> Estado al 2026-06-02 tras la revisión del inventario.

- **REVISAR-1 — Taxonomía de tabs del catálogo → CERRADO PARCIAL.**
  Beauty Color **sí entra** al MVP, pero solo una parte de productos
  **no-coloración** (la lista exacta la define Gabb antes del Paso 3, ver
  REVISAR-7). Taxonomía base de tabs:
  *Todos · Question Coloración · Intelligent Series · Styling · Q-Style · Beauty Color*.
  Nombres finales a confirmar al armar el catálogo (Paso 3). Impacta
  `product_lines.json` (A2) y los tabs (B4).

- **REVISAR-2 — Alpine vs vanilla para el modal → CERRADO.**
  El modal (B1) queda en **JS vanilla aislado**, NO se porta a Alpine. La
  interfaz con la app Alpine es una función pegamento tipo
  `openColorPicker(productId, onSelect)`, donde el callback `onSelect` recibe
  los tonos seleccionados. Así el modal vive autocontenido y la app Alpine solo
  lo invoca y recibe el resultado.

- **REVISAR-3 — Modal rico vs simple → CERRADO.**
  Se mantiene el **modal rico**: multi-select + cantidad por tono + toggle
  "1 tono / varios". Es la mejor UX para la peluquera que pide varios tonos.
  Pendiente de cierre del proyecto (no urge): actualizar el PRD §4.3 para que
  describa este comportamiento real.

- **REVISAR-4 — Estructura de carpetas → PROPUESTA (ver sección siguiente).**
  Propuesta formal abajo. **Gabb la aprueba antes de crear archivos en el Paso 2.**

- **REVISAR-5 — Imágenes de productos → CERRADO.**
  Las fotos se **duplican en `/assets/productos/` del repo**. En el Paso 3
  (catálogo) traigo las imágenes de los 72 productos Question. Las de Beauty
  Color las agrega Gabb más adelante, junto con su lista de productos (REVISAR-7).

- **REVISAR-6 — PDFs → CERRADO.**
  Se hospedan en `/assets/pdfs/` del repo. Cuatro archivos que Gabb pasa más
  adelante: (1) Catálogo Question (lista de precios), (2) Catálogo Beauty Color,
  (3) Carta de color Question Coloration, (4) Carta Lumiplex. **Mientras no
  estén**, los links del footer en Inicio van como **placeholders deshabilitados
  con texto "(próximamente)"**. Cuando lleguen, se completan las URLs y se
  habilitan.

- **REVISAR-7 — Lista final de Beauty Color para MVP → CERRADO.**
  27 productos no-coloración, agrupados en sub-tabs dentro del tab "Beauty Color".
  Fotos: las pasa Gabb más adelante; hasta entonces, placeholders.

  **Máscaras 250 GRS (6):** MC01 Keratina · MC02 Argán · MC03 Ácida ·
  MC04 Coco y Almendras · MC05 Macadamia · MC06 Semi di Lino.

  **Crema de Peinar 160 ML (3):** CP01 Keratina · CP02 Argán · CP03 Semi di Lino.

  **Lluvias 200 ML (6):** LL01 Keratina · LL02 Argan · LL03 Oro Líquido ·
  LL04 Oro Verde · LL05 Coco y Almendras · LL06 Semi di Lino.

  **Shampoo 370 ML (5):** SH01 Keratina · SH02 Neutro · SH03 Ácido ·
  SH04 Oro Líquido · SH05 Argan.

  **Acondicionador 370 ML (4):** AC-01 Keratina · AC-02 Ácido ·
  AC-03 Oro Líquido · AC-04 Argán.
  _(En la planilla original había dos AC-04 — Oro Líquido y Argán —; corregido
  a AC-03 / AC-04.)_

  **Shampoo 900 ML (1):** SHG-01 Neutro.

  **Oxidantes (2):** OX1-20 20 vol. 900cc · OXG-30 30 vol. 900cc.

  **Sub-tabs (7 líneas).** Si en pantalla queda engorroso (sub-tabs con 1-2
  productos), proponer consolidación (ej: juntar Shampoo 370 + 900 en un
  sub-tab "Shampoo") y validar con Gabb antes de cerrar el Paso 3.

- **REVISAR-1 — Tabs principales → CERRADO.**
  *Todos · Question Coloración · Intelligent Series · Styling · Q-Style ·
  Beauty Color* (este último con los 7 sub-tabs de arriba). Nombres exactos se
  ajustan a la nomenclatura del `catalogo.json` viejo si difiere, manteniendo
  coherencia con `product_lines.json`.

---

## Estructura de carpetas propuesta (REVISAR-4)

> Pendiente de OK de Gabb antes de crear archivos en el Paso 2.

```
topstyle-app/
├── index.html                    ← app (las 3 pantallas viven acá, ver nota SPA)
├── css/
│   └── styles.css                ← estilos propios de la app
├── js/
│   ├── app.js                    ← lógica Alpine de la app (carrito, navegación, form)
│   └── color-modal.js            ← modal de tono, JS vanilla aislado (Paso 6)
├── data/
│   ├── catalogo.json             ← 72 productos, sin precios (Paso 3)
│   ├── paletas.json              ← Coloration 109 + Lumiplex 35 (Paso 6)
│   ├── product_lines.json        ← mapeo línea → prefijos (Paso 3)
│   └── promos.json               ← banners de Inicio (Paso 11)
├── assets/
│   ├── topstyle-logo.png         ← logo sobre fondo claro
│   ├── productos/                ← fotos de productos (Paso 3)
│   └── pdfs/                     ← 4 PDFs, cuando los pase Gabb (REVISAR-6)
├── icons/                        ← íconos PWA (Paso 12)
├── netlify.toml
├── README.md
└── INVENTARIO-REUTILIZACION.md
```

**Nota SPA (decisión a confirmar con la estructura):** propongo que las 3
pantallas (Inicio, Catálogo, Carrito) vivan en **un solo `index.html`** y se
alternen con Alpine (`x-show` según una variable de estado tipo `pantalla`), en
vez de 3 archivos HTML separados. Razón: la app comparte estado (carrito,
nombre, datos del cliente) entre pantallas; con un solo archivo no se pierde nada
al "navegar", no hay recarga, y encaja mejor con PWA. El contra: el `index.html`
crece. Para el tamaño de esta app (3 pantallas) es manejable.

---

## Chequeo de cobertura

Piezas grandes (>50 líneas de código relevante) y su clasificación:

| Pieza | Líneas aprox | Categoría |
|---|---|---|
| Lógica JS modal de tono | ~210 | B1 |
| CSS modal de tono | ~220 | A4 |
| HTML modal de tono | ~50 | A3 |
| Objeto CART | ~50 | B2 (parcial) + D (cupones) |
| WhatsApp build/send | ~75 | B3 (parcial) + D (totales) |
| Panel Pedido Rápido (HTML+CSS+JS) | ~350 | B4 |
| Catálogo (datos) | 72 productos | B5 |
| Paletas (datos) | 144 tonos | A1 |
| admin.html | 1139 | D |
| Hero/strips/bestsellers/secciones | resto del index | D |

No quedan piezas grandes sin clasificar.
