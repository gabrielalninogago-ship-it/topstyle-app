# Bitácora — App pública TopStyle

Registro por sesión de lo construido. La entrada más reciente va arriba.
Rutina de cierre de sesión: grabar memorias, anotar acá el resumen, commit + push.

---

## Sesión 5 — 2026-06-04 (deploy + WhatsApp prod + rediseño → V1 A TESTING)

**Deploy DESTRABADO y confirmado.** El build del commit con `public/` anduvo
(Gabb avisó + log). El log OK muestra "Read 97 files from .../public" (antes 145
con el `.git`), sin `Asset too large`. **URL real: https://topstyle-app.gabrielalninogago.workers.dev**
— es un **Worker** con static assets, NO un proyecto Pages; por eso todas las
`*.pages.dev` daban NXDOMAIN (nunca existieron). Verificado con curl: HTTP 200 y
sirve el sitio con el marcador `.version` correcto. Memorias corregidas (decían
`pages.dev`, erróneo).

**Theme-color fucsia → plum.** Commit `6a28fae`. `#ff2ea0` → `#5a2a4d` en el
`<meta theme-color>` (`public/index.html`) y en `theme_color` (`public/manifest.json`).
SW bumpeado `topstyle-v13` → `v14` (cache-first: sin el bump la PWA instalada no
tomaría el HTML nuevo). Auto-deploy verificado en vivo: producción sirve `#5a2a4d`
y `topstyle-v14`. El `background_color #1a1a1a` (splash PWA) se dejó sin tocar.

**Para ver el plum en la PWA instalada:** cerrar del todo y reabrir (o reinstalar
si no toma el `theme_color` nuevo del manifest).

**WhatsApp a PRODUCTIVO.** Gabb dio el OK y validó el plum en el celu. Commit
`a3ec71c`: `WHATSAPP_NUMBER` `5491150637625` → `5491127395984` en
`public/js/config.js`. SW `v14` → `v15` (config.js está en el CORE cacheado).
Verificado en producción: sirve el número productivo y `topstyle-v15`.

**Logo optimizado.** Gabb lo bajó con ImageMagick+pngquant: 648 KB → **56 KB**
(400x400). El respaldo `topstyle-logo-original.png.bak` quedó fuera de `public/`
(gitignored, no se deploya).

**REDISEÑO orientado a conversión (3 pasadas).** Encargo de Gabb: "como experto en
marketing/ventas, captar clientes y convertir". Público: profesionales del rubro.
- Pass 1 (`fd73cb1`): solo acentos de gradiente. Quedó tímido ("no veo cambio").
- Pass 2 — hero (`9b6d976`): hero superior con **gradiente de marca** (logo +
  titular grande + CTA blanco de alto contraste + reaseguro "te responde una
  persona, no un bot"); **fuente Poppins self-hosted** (woff2, queda offline);
  **prueba social** (reseña cualitativa real, sin cifras inventadas); CTA de envío
  del carrito grande con ícono de WhatsApp. Splash PWA a blanco. SW v17.
- Pass 3 — cohesión (`6f82981`, `build rediseño cohesivo`, SW v18): Poppins también
  en el TEXTO (pesos 400/500); **promos con gradiente de marca** (antes cajas
  planas plum; `promos.json` de ejemplo con `color_fondo` vacío → toman el
  gradiente); títulos de sección del catálogo con acento de gradiente; catálogo y
  carrito con **fondo de tinte suave** (menos blanco plano).
Todo verificado en producción con curl. Sistema de marca: gradiente
plum→fucsia→coral (del ícono), variables `--grad-marca` / `--fuente-titulo` /
`--fuente-base` en `styles.css`.

**ESTADO: V1 lista para testing.** Gabb la deja así para testear; ajustes finos y
cambios propuestos se ven DESPUÉS del test. Pendiente (no bloquea testing):
colgarla de **topstyle.ar** y **topstyle.com.ar** cuando estén los DNS.

### Pendiente de Gabb / próximo
- Testear la V1 en uso real.
- Post-test: juntar cambios a proponer.
- DNS: apuntar **topstyle.ar** y **topstyle.com.ar** al Worker (custom domain en el
  dash de Cloudflare; la app usa rutas relativas, no requiere cambios de código).
- Assets viejos pendientes: fotos de los 27 Beauty Color + `is-equilibre-mascara`.

---

## Sesión 4 — 2026-06-04 (deploy)

Sesión dedicada a por qué la app no se actualizaba. **Hallazgo:** el deploy de
Cloudflare venía fallando desde la migración. `npx wrangler deploy` subía desde
la raíz e incluía `.git`; el pack del historial pesa 31.4 MiB y supera el límite
de 25 MiB → `Asset too large` → deploy abortado → dominio NXDOMAIN. Gabb veía la
PWA del Paso 12 servida desde caché (offline).

**Fix pusheado:** sitio movido a `public/` + `wrangler.jsonc`
(`assets.directory = "./public"`) para excluir `.git` del upload. (Un
`.assetsignore` previo no fue respetado por wrangler.)

**Sin cerrar:** el último deploy seguía fallando porque corrió sobre un commit
viejo (probable "Retry" de un build anterior). Mañana: disparar deploy del último
commit de `main` (push nuevo / "Create deployment" desde HEAD, NO "Retry") y
confirmar la URL real en el log. Detalle en memoria [[deploy-cloudflare]].

**Anotado:** el `theme_color` fucsia `#ff2ea0` del pack queda mal en la barra de
arriba (choca con la app plum). Revertir a plum o color que combine
(`public/index.html` + `public/manifest.json`). Ver PENDIENTES-PULIDO.

---

## Sesión 2 — 2026-06-03

### Hecho
- **Paso 8 — Form del cliente + envío por WhatsApp.** VALIDADO en el celu.
  - Form simplificado en Pantalla 3: solo 2 textareas opcionales
    ("Productos adicionales" y "Notas / observaciones"). Decisión de Gabb:
    NO se pide tipo, zona ni WhatsApp del cliente (el nombre viene de Inicio;
    el destino se identifica por contacto agendado).
  - Arma el mensaje formato PRD §7 (sin precios) y abre `wa.me/...` en pestaña
    nueva (`encodeURIComponent`). Secciones se omiten si están vacías.
  - Productos con tono agrupados en una línea: `(tonos: 7.1, 7.3 x2)` (el "xN"
    solo si la cantidad de ese tono es >1). Se omitió el "N x" delante porque
    cada tono es un item separado y el número no representaba cantidad real.
  - Botón se habilita con carrito NO vacío O con adicionales.
  - `WHATSAPP_NUMBER` en `js/config.js` (constante única). HOY testing
    `5491150637625` (WhatsApp personal de Gabb); productivo `5491127395984`
    cuando Gabb avise.

### Pendiente de Gabb
- Avisar cuándo pasar `WHATSAPP_NUMBER` al número productivo `5491127395984`.

### Próximo: Paso 9 — persistencia en localStorage
Las 5 claves del PRD §5 (nombre, datos cliente, carrito en progreso, últimos 5
pedidos, pedido frecuente). Auto-relleno del nombre en Inicio/Carrito.

---

## Sesión 3 — 2026-06-04

### Hecho (codeado + deployado, pendiente de validar en celu)
- **Paso 9 — Persistencia en localStorage.** 3 claves activas: `topstyle_nombre`
  (watcher), `topstyle_carrito_actual` (persiste en cada mutación, `_persistirCarrito`),
  `topstyle_ultimos_pedidos` (al enviar, tope 5, más nuevo primero). `cliente_data`
  descartada (el form simplificado del Paso 8 dejó solo el nombre). Tras enviar:
  vacía el carrito y vuelve a Inicio. Helpers `_leerLS`/`_guardarLS` con try/catch
  para no romper en incógnito.
- **Paso 10 — Inicio "ya estuvo antes".** Saludo personalizado + "Nuevo pedido";
  tarjeta "Repetir tu último pedido" (resumen de 3 items + "y N más", carga con
  notas); tarjeta "Tu pedido frecuente" + checkbox en el carrito para guardarlo
  (carga sin notas, es plantilla). 5ta clave `topstyle_pedido_frecuente` lista.
  El modo recurrente se fija con un snapshot al cargar (`recurrente`), no reactivo
  al nombre, para que tipearlo la primera vez no dé vuelta la pantalla.

### Decisiones de la sesión
- Tras enviar un pedido se vuelve a Inicio con el carrito vacío.
- `cliente_data` (PRD §5) se descarta: el form ya no pide whatsapp/tipo/zona.
- Cargar "último pedido" trae las notas; cargar "frecuente" no (es plantilla).

- **Paso 11 — Promos.** `data/promos.json` editable (id, titulo, texto, imagen,
  color_fondo, link, activa, valida_hasta). Hasta 2 banners en Inicio recurrente:
  filtra activas y no vencidas. Color de texto auto según brillo del fondo.
  Documentado cómo editarlas en el README. Las 2 promos actuales son de ejemplo.
- **Paso 12 — PWA.** `manifest.json` + `sw.js` (cache-first del app shell +
  fallback offline; Alpine cacheado aparte) + registro del SW en index.html.
  Íconos placeholder generados con un encoder PNG mínimo (no había herramientas
  de imagen).
- **Paso 13 — Pulido + pack PWA.** Gabb pasó `topstyle-pwa-pack.zip` con íconos
  reales (perfil "HAIR COSMETICS"), maskable, apple-touch, favicons, favicon.ico
  y manifest nuevo (theme `#ff2ea0`, bg `#1a1a1a`). Integrado el head-snippet sin
  duplicados; SW a `topstyle-v13` con los íconos nuevos. Pulido: fallback de
  imágenes rotas (@error → placeholder), meta description, noscript, dims del logo.
  **MVP completo (pasos 1-13).**

### Decisiones de la sesión (cont.)
- Promos solo para clientes recurrentes (PRD §4.1).
- El pack PWA trae identidad fucsia/oscuro aplicada solo al chrome/PWA; la
  paleta de la app (plum) se decide después ("lo vemos después").

### Pendiente de Gabb
- Validar pasos 9 a 13 en el celu.
- Decidir paleta de la app (plum vs fucsia/oscuro del pack).
- Pasar versión liviana del logo de Inicio (648 KB hoy).
- Avisar cuándo pasar `WHATSAPP_NUMBER` al productivo `5491127395984`.

### Próximo
Validación final del MVP en mobile real. Post-MVP: paleta, logo, copy de Inicio.

---

## Infra — 2026-06-03

**Hosting migrado de Netlify a Cloudflare Pages** el 2026-06-03 por límite de
tokens del free tier de Netlify. URL nueva: https://topstyle-app.pages.dev
(la vieja https://cheery-paletas-012cd9.netlify.app se apaga pronto). Cloudflare
Pages da bandwidth ilimitado y mejor latencia en Latam.

Límite duro de Cloudflare Pages: **25 MB por archivo**. En la migración hubo que
comprimir con Ghostscript (`/ebook`): `carta-color-question.pdf` (era 25.5 MB) y
`catalogo-beauty.pdf` (era 40.5 MB). Regla para el futuro: cualquier asset >25 MB
se comprime antes de sumarlo al repo, o se hostea externo y se linkea.

---

## Sesión 1 — 2026-06-02 / 03

**Arrancamos de cero** (repo vacío) y dejamos la app funcionando hasta el carrito.

### Hecho (pasos del PRD)
- **Paso 1 — Setup + hosting + deploy.** Repo `topstyle-app` en GitHub
  (`gabrielalninogago-ship-it`, SSH), Netlify con deploy automático
  (https://cheery-paletas-012cd9.netlify.app), "hola mundo" validado.
- **Paso 1.5 — Inventario de reutilización.** `INVENTARIO-REUTILIZACION.md`:
  qué se trae del handoff viejo (A/B/C/D) y decisiones REVISAR-1..7 cerradas.
- **Paso 2 — Inicio (primera visita).** Saludo, campo de nombre, "Empezar pedido",
  footer con los 4 PDFs (ya hospedados). Look minimal, mobile-first, sin fuentes externas.
- **Paso 3 — Catálogo.** `data/catalogo.json` (85 productos sin precios: 58 Question
  activos + 27 Beauty Color). Grid agrupado por línea. Fotos reales de Question.
- **Paso 4 — Búsqueda y filtros.** Tabs (Coloración/Intelligent/Styling/Línea Salón/
  Beauty Color + sub-tabs), buscador en vivo sin acentos, degradado de scroll en tabs.
- **Paso 5 — Agregar al carrito.** Estado en memoria, contador, "Ver pedido", toast.
- **Paso 6 — Modal de tono.** Pieza portada del handoff, vanilla aislado
  (`js/color-modal.js`, glue `openColorPicker`). 109 Coloration + 35 Lumiplex, hex reales.
  Ajustes por feedback: familias en una fila deslizable, sin toggle, sin auto-teclado,
  botón × para limpiar búsqueda, toast más lento.
- **Paso 7 — Carrito.** Pantalla 3 con lista editable: stepper de cantidad, quitar,
  swatch del tono, estado vacío. Botón "Enviar por WhatsApp" todavía inerte.

### Decisiones de la sesión
- Hosting Netlify; repo bajo cuenta `ship-it` (la otra, `gabrielalbino`, no tiene la clave SSH).
- Arquitectura SPA: un solo `index.html`, pantallas con Alpine `x-show`.
- Modal de tono en JS vanilla aislado (no Alpine), selección múltiple siempre.
- Tabs: Twelve Spray va a "Styling"; los 12 de tratamiento van a "Línea Salón".

### Pendiente de Gabb
- Fotos de los **27 Beauty Color** + la de **`is-equilibre-mascara`** (van con placeholder).
- Para el Paso 8: **número de WhatsApp de testing** (productivo: `5491127395984`).

### Próximo: Paso 8 — form del cliente + envío por WhatsApp
Form en el carrito (nombre, WhatsApp, tipo, zona, notas), arma el mensaje (formato
PRD §7, sin precios) y abre `wa.me/...`. Después: 9 persistencia, 10 Inicio "ya estuvo",
11 promos, 12 PWA, 13 pulido.
