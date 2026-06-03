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

🚧 **En construcción.** Paso 4: Catálogo con búsqueda y filtros por tab.

## Hosting

- **Netlify**, deploy automático conectado a este repo de GitHub.
- Cada push a la rama principal redeploya solo en 1-2 minutos.
- URL pública (Netlify): **https://cheery-paletas-012cd9.netlify.app**
- Panel de administración: https://app.netlify.com/projects/cheery-paletas-012cd9

Para verificar que un deploy se actualizó: el `index.html` muestra
"Último deploy: <fecha>". Esa fecha se edita a mano en cada push; si cambia
en la URL pública, el deploy automático anduvo.

## Cómo trabajamos

- De a un módulo por vez, validando con Gabb antes de avanzar.
- Comentarios del código en español.
- Sin build step: los archivos se sirven tal cual.

## Orden de implementación

Ver sección 10 del PRD. Resumen: setup → Inicio → Catálogo → búsqueda →
carrito → modal de tono → carrito con edición → form + WhatsApp →
persistencia → Inicio "ya estuvo" → promos → PWA → pulido.
