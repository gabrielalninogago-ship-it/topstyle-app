# Pendientes de pulido (front)

> Estado al cierre del MVP (Paso 13). Lo resuelto queda marcado; lo que queda
> depende de assets o decisiones de Gabb.

## Resuelto en el Paso 13
- [x] Fallback de imágenes rotas → caen a `assets/placeholder.svg`.
- [x] Favicon + `<meta description>` + `<noscript>` + dimensiones del logo.
- [x] Ícono PWA definitivo integrado (pack `topstyle-pwa-pack.zip`): íconos
      reales, maskable, apple-touch, favicons, `favicon.ico`, manifest nuevo.

## Resuelto en la Sesión 5
- [x] **Theme-color fucsia → plum** (commit `6a28fae`). Verificado en producción.
- [x] **WhatsApp productivo** `5491127395984` (ver Recordatorio operativo).
- [x] **Logo de Inicio optimizado:** 648 KB → **56 KB** (400x400, ImageMagick +
      pngquant). Respaldo `.bak` fuera de `public/` (gitignored).
- [x] **Paleta / copy / tipografía de Inicio:** resueltos con el REDISEÑO de
      conversión (3 pasadas, commits `fd73cb1` → `9b6d976` → `6f82981`):
      sistema de marca gradiente plum→fucsia→coral, **fuente Poppins self-hosted**
      en toda la app, hero gradiente con CTA + reaseguro, prueba social, promos
      con gradiente, catálogo/carrito con tinte. SW a `topstyle-v18`. Verificado
      en producción. **V1 lista para testing.** Ajustes finos: post-test.

## Pendiente (post-testing / DNS)
- [ ] **Dominios:** colgar la app de **topstyle.ar** y **topstyle.com.ar** cuando
      estén los DNS (custom domain del Worker en el dash de Cloudflare; la app usa
      rutas relativas → no requiere cambios de código).
- [ ] **Assets viejos:** fotos de los 27 Beauty Color + `is-equilibre-mascara`
      (van con placeholder hasta que Gabb las pase).
- [ ] Cambios a proponer que surjan del testing.

## QA en mobile real (Gabb) — durante el testing
- [ ] iPhone SE / Android común: scroll de tabs, modal de tono, footer fijo del
      catálogo, banners de promo, instalación e ícono PWA, hero + fuente nueva.

## Recordatorio operativo
- [x] `WHATSAPP_NUMBER` en productivo `5491127395984` (Gabb dio el OK, 2026-06-04,
      sesión 5). Verificado en producción. SW a `topstyle-v15`.
