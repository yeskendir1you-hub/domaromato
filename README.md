# Dom Aromatov — сайт

Статичный сайт для магазина отливантов Dom Aromatov: 3D-флакон (Three.js), плавная прокрутка (Lenis), анимации (GSAP), каталог с корзиной и заказом через WhatsApp.

- `data.js` — **всё, что нужно менять**: номер WhatsApp, цены по объёмам, список ароматов.
- `index.html`, `styles.css` — вёрстка и стили.
- `app.js` — каталог, фильтры, сэт (корзина), заказ.
- `js/main.js` — интро, прокрутка, анимации.
- `src/scene.js` — исходник 3D-сцены; собранный файл `js/scene.min.js`.
  Пересборка: `npm i three@0.187.0 esbuild` и
  `npx esbuild src/scene.js --bundle --minify --format=esm --target=es2020 --outfile=js/scene.min.js`
- `vendor/` — GSAP 3.15.0, ScrollTrigger, Lenis 1.3.27.
- `assets/` — фото ведущей, логотип, иконка.

Деплой: Vercel, статический сайт без build-команды (каждый push в ветку обновляет сайт).
