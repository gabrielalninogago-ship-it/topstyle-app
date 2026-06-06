# TopStyle — App pública (orientación para Claude)

> Este archivo se autocarga al abrir una sesión en esta carpeta. Si lo estás
> leyendo, sos "Clau", la instancia de Claude Code del proyecto TopStyle.

## Qué es
App pública de **TopStyle** (negocio de Gabb, hair cosmetics / distribución de
productos profesionales). PWA **estática** (HTML + CSS + Alpine.js + localStorage,
**sin backend**): el cliente arma un pedido y lo manda **por WhatsApp**.

## Estado (al 2026-06-04)
**V1 deployada y EN TESTING.** MVP completo (pasos 1-13 del PRD) + deploy
confirmado + WhatsApp productivo + logo optimizado + rediseño de conversión.
Los cambios/agregados que surjan del testing los trae Gabb.

## Dónde está todo
- **Código (este repo):** `/home/gabb/topstyle-app/` · sitio en `public/`.
- **App en vivo:** https://topstyle-app.gabrielalninogago.workers.dev
  (Cloudflare **Worker** con static assets, NO Pages; las `*.pages.dev` no existen).
- **GitHub:** `gabrielalninogago-ship-it/topstyle-app` (SSH; la otra cuenta
  `gabrielalbino` no tiene la clave).
- **Memoria del proyecto (LEER PRIMERO):**
  `/home/gabb/.claude/projects/-home-gabb-topstyle-app-publica/memory/MEMORY.md`
  (índice; de ahí salen estado, deploy, rediseño, dominios). Se autocarga solo si
  la sesión se abre desde `/home/gabb/topstyle-app-publica`.
- **Bitácora:** `BITACORA.md` (lo más nuevo arriba) · **Pendientes:**
  `PENDIENTES-PULIDO.md` · **Decisiones:** `INVENTARIO-REUTILIZACION.md` ·
  **Editar promos/datos:** `README.md`.

## Antes de tocar nada
Leé `BITACORA.md` (última sesión) y la memoria del proyecto.

## Cómo trabajamos
- De a un paso, **validando con Gabb en el celu** (esta máquina no tiene navegador).
- Salida a internet **solo** con `dangerouslyDisableSandbox` en Bash (para verificar
  la URL con curl, etc.).
- Explicar antes de codear. Sin sycophancy. Sin em dashes. Comentarios del código
  en **español**.
- En cada push que cambie archivos: **bumpear** el marcador `.version` (en Inicio)
  y el `CACHE` del service worker `public/sw.js` (es cache-first: sin bump, la PWA
  instalada no toma lo nuevo).
- Deploy = push a `main` → auto-deploy en Cloudflare (1-2 min). Verificar en
  producción con curl. Cierre de sesión = grabar memorias + BITACORA + commit/push.

## Pendiente (no bloquea testing)
- Dominios propios **topstyle.ar** y **topstyle.com.ar** cuando estén los DNS
  (custom domain del Worker; la app usa rutas relativas, sin cambios de código).
- Fotos reales de los 27 productos Beauty Color + `is-equilibre-mascara`
  (van con placeholder).
- WHATSAPP_NUMBER productivo `5491127395984` en `public/js/config.js`.
