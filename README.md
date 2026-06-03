# TopStyle App (pública)

PWA pública de TopStyle: les permite a clientes habituales (peluquerías,
distribuidores) armar su pedido desde el celular y enviarlo por WhatsApp
formateado.

## Qué es

- App web instalable (PWA), **100% frontend estático**. Sin backend.
- Stack: HTML + CSS + [Alpine.js](https://alpinejs.dev) + `localStorage`.
- La salida del pedido es un mensaje de WhatsApp pre-armado (`wa.me/...`).
  **No se muestran precios al cliente** (decisión de negocio).

El detalle funcional completo vive en el PRD:
`topstyle_tech_web_prd_app_publica_v0_1.md` (carpeta `docs/` del proyecto
`topstyle-app-publica`).

## Estado

🚧 **En construcción.** Paso 8: form del cliente + envío por WhatsApp.

## Hosting

- **Cloudflare Pages**, deploy automático conectado a este repo de GitHub.
  (Migrado desde Netlify el 2026-06-03 por límite de tokens del free tier;
  Cloudflare Pages da bandwidth ilimitado y mejor latencia en Latam.)
- Cada push a la rama principal redeploya solo en 1-2 minutos.
- URL pública: **https://topstyle-app.pages.dev**
- Panel de administración: dashboard de Cloudflare Pages (dash.cloudflare.com).

Para verificar que un deploy se actualizó: el `index.html` muestra un marcador
de versión (`.version`) en Inicio que se bumpea en cada push. Si cambia en la
URL pública, el deploy automático anduvo.

> ⚠️ **Límite de tamaño de archivo:** Cloudflare Pages rechaza cualquier
> archivo de más de **25 MB**. Antes de sumar un asset pesado al repo (PDF,
> imagen, etc.), comprimirlo o hostearlo externo y linkearlo. En la migración
> hubo que comprimir `carta-color-question.pdf` y `catalogo-beauty.pdf` con
> Ghostscript (modo `/ebook`).

## Cómo trabajamos

- De a un módulo por vez, validando con Gabb antes de avanzar.
- Comentarios del código en español.
- Sin build step: los archivos se sirven tal cual.

## Orden de implementación

Ver sección 10 del PRD. Resumen: setup → Inicio → Catálogo → búsqueda →
carrito → modal de tono → carrito con edición → form + WhatsApp →
persistencia → Inicio "ya estuvo" → promos → PWA → pulido.
