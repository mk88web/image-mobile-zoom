# image-mobile-zoom
Native pan &amp; pinch-zoom for images on touch devices — no libraries, no dependencies, no touching existing HTML.

Built for editorial websites and blogs that want a premium mobile experience on images: users can pinch to zoom up to 6× and drag to explore the details, just like a native app — without triggering the browser's page zoom.
 
---
 
## How it works
 
The script finds images matching `CONFIG.selector`, wraps them in a dedicated viewport, and initializes the pan/zoom engine. **The original `<img>` element is never cloned or removed** — it is simply moved inside the wrapper. On desktop the script does nothing at all.
 
```
Before:
  <img src="photo.jpg" data-zoomable>
 
After (touch devices only):
  <div class="mz-wrap">
    <div class="mz-viewport">
      <img src="photo.jpg" data-zoomable>   ← the original element, untouched
      <div class="mz-hint">...</div>
      <div class="mz-badge">1×</div>
      <div class="mz-btns">− ⌂ +</div>
    </div>
  </div>
```
 
---
 
## Installation
 
### 1. Add the CSS
 
Paste the `<style>` block into your theme's `<head>` (or your global CSS file). It contains all `.mz-*` rules and only activates inside `@media (pointer: coarse)`.
 
### 2. Add the script
 
Paste the `<script>` block just before `</body>`. You can also save it as a standalone `mobile-zoom.js` file and reference it externally.
 
### 3. Mark your images
 
The simplest approach: add `data-zoomable` to the images you want to activate.
 
```html
<img src="infographic.png" alt="Workflow diagram" data-zoomable>
```
 
Want to add a caption below the image?
 
```html
<img
  src="infographic.png"
  alt="Workflow diagram"
  data-zoomable
  data-caption="Figure 1 — The complete flow from input to output"
>
```
 
---
 
## Configuration
 
All behaviour is controlled from a single `CONFIG` block at the top of the script. You don't need to touch anything else.
 
```js
const CONFIG = {
 
  // CSS selector for the images to activate zoom on.
  // Change this value to match your project.
  selector: 'img[data-zoomable]',
 
  // ── Alternative examples ──
  // selector: 'img.zoom'                // custom class
  // selector: '.wp-block-image img'     // Gutenberg image block
  // selector: 'article img'             // all images inside <article>
  // selector: '.entry-content img'      // WordPress theme content area
  // selector: 'img'                     // ALL images on the page
 
  // Maximum zoom level reachable by pinching (default: 6)
  maxScale: 6,
 
  // Hint text shown on the first touch
  hintText: 'Pinch to zoom · Drag to explore',
 
};
```
 
### Recommended selectors for WordPress
 
| Situation | Selector |
|---|---|
| Choose image by image | `'img[data-zoomable]'` |
| You have a custom class in your theme | `'img.zoom'` |
| Using the block editor (Gutenberg) | `'.wp-block-image img'` |
| Using the classic editor | `'.entry-content img'` |
| Activate on everything | `'img'` |
 
---
 
## Features
 
- **Pinch-to-zoom** — zoom centered on the midpoint between two fingers
- **Pan** — free scrolling when zoomed in, with edge clamping
- **+ / − / ⌂ buttons** — alternative controls for tap-based interaction
- **Zoom badge** — live level indicator (only visible when scale > 1×)
- **First-touch hint** — fades out automatically after the first gesture
- **Adaptive height** — the viewport respects the image's natural aspect ratio
- **Zero dependencies** — vanilla JS, no framework required
- **Non-invasive** — on desktop nothing is modified, the `<img>` stays in place
- **Theme-agnostic** — does not override any existing styles on the image
 
---
 
## Requirements
 
- Modern browsers (Chrome, Safari, Firefox, Edge) with `touch events` and `pointer` media query support
- No JavaScript dependencies
- No build step required
 
---
 
## License
 
MIT — free to use, modify, and distribute. If you use it in a public project, a credit is appreciated but not required.
 
---
 
**Author:** Mirko Ciesco — [mirkociesco.it](https://www.mirkociesco.it)
