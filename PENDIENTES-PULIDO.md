# Pendientes de pulido (front)

> Estado al cierre del MVP (Paso 13). Lo resuelto queda marcado; lo que queda
> depende de assets o decisiones de Gabb.

## Resuelto en el Paso 13
- [x] Fallback de imágenes rotas → caen a `assets/placeholder.svg`.
- [x] Favicon + `<meta description>` + `<noscript>` + dimensiones del logo.
- [x] Ícono PWA definitivo integrado (pack `topstyle-pwa-pack.zip`): íconos
      reales, maskable, apple-touch, favicons, `favicon.ico`, manifest nuevo.

## Pendiente de Gabb (assets / decisión)
- [ ] **El fucsia de arriba NO queda bien** (Gabb, sesión 4). El `theme_color`
      `#ff2ea0` del pack tiñe la barra del navegador/PWA de fucsia y choca con la
      app violeta plum. Revertir el `<meta name="theme-color">` (y evaluar el
      `theme_color` del manifest) a plum `#5a2a4d` o a un color que combine.
      Archivos: `public/index.html` y `public/manifest.json`.
- [ ] **Logo de Inicio:** `assets/topstyle-logo.png` pesa 648 KB y se muestra a
      130 px. Reemplazar por una versión liviana (~300 px o webp). Sin
      herramientas de imagen en la máquina → lo cambia Gabb o pasa el archivo.
- [ ] **Paleta de la app:** el pack de íconos trae identidad fucsia
      (`#ff2ea0`) + fondo oscuro (`#1a1a1a`), aplicada al chrome del navegador /
      PWA. La app sigue en violeta plum (`#5a2a4d`). Decidir si el resto migra a
      fucsia/oscuro o se mantiene plum.
- [ ] **Copy de Inicio** (saludo, propuesta de valor) y tipografía definitivas.

## QA en mobile real (Gabb)
- [ ] iPhone SE / Android común: scroll de tabs, modal de tono, footer fijo del
      catálogo, banners de promo, instalación e ícono PWA.

## Recordatorio operativo
- [ ] Cambiar `WHATSAPP_NUMBER` en `js/config.js` de testing (`5491150637625`)
      al productivo (`5491127395984`) cuando Gabb avise.
