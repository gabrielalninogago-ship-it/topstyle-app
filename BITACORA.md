# Bitácora — App pública TopStyle

Registro por sesión de lo construido. La entrada más reciente va arriba.
Rutina de cierre de sesión: grabar memorias, anotar acá el resumen, commit + push.

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
