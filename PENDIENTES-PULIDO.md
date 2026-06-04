# Pendientes de pulido (front)

> Estado al cierre del MVP (Paso 13). Lo resuelto queda marcado; lo que queda
> depende de assets o decisiones de Gabb.

## Resuelto en el Paso 13
- [x] Fallback de imágenes rotas → caen a `assets/placeholder.svg`.
- [x] Favicon + `<meta description>` + `<noscript>` + dimensiones del logo.
- [x] Ícono PWA definitivo integrado (pack `topstyle-pwa-pack.zip`): íconos
      reales, maskable, apple-touch, favicons, `favicon.ico`, manifest nuevo.

## Resuelto en la Sesión 5
- [x] **Theme-color fucsia → plum** (commit `6a28fae`). `#ff2ea0` → `#5a2a4d` en
      el `<meta theme-color>` (`public/index.html`) y `theme_color`
      (`public/manifest.json`). SW a `topstyle-v14`. Verificado en producción.
      Falta que Gabb lo vea en el celu (cerrar/reabrir la PWA, o reinstalar).

## Pendiente de Gabb (assets / decisión)
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
- [x] `WHATSAPP_NUMBER` en productivo `5491127395984` (Gabb dio el OK, 2026-06-04,
      sesión 5). Verificado en producción. SW a `topstyle-v15`.
