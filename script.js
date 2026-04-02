/**
 * mobile-zoom.js
 *
 * @author  Mirko Ciesco
 * @license MIT
 * @link    https://github.com/mirkociesco/mobile-zoom
 *
 * Pan & pinch-zoom nativo per immagini su dispositivi touch.
 * Nessuna dipendenza. Attivo solo su (pointer: coarse).
 * Configura CONFIG.selector per adattarlo a qualsiasi progetto.
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════
  //  CONFIGURAZIONE — modifica solo questo blocco
  // ═══════════════════════════════════════════════

  const CONFIG = {

    // Selettore CSS delle immagini su cui attivare lo zoom.
    // Esempi:
    //   'img[data-zoomable]'        → attributo dedicato (default)
    //   'img.zoom'                  → classe personalizzata
    //   '.wp-block-image img'       → blocco immagine Gutenberg
    //   'article img'               → tutte le img dentro <article>
    //   '.entry-content img'        → area contenuto di un tema WordPress
    selector: '.border-simple img, .zoom img',

    // ── OPZIONE: applica lo zoom a TUTTE le immagini della pagina ──
    // Decommentare la riga sotto e commentare quella sopra.
    // selector: 'img',

    // Zoom massimo raggiungibile con il pizzico
    maxScale: 6,

    // Testo dell'hint mostrato al primo tocco
    hintText: 'Pizzica per zoomare · Scorri per esplorare',

  };

  // ═══════════════════════════════════════════════

  // Attivo solo su touch device
  if (!matchMedia('(pointer: coarse)').matches) return;

  const images = document.querySelectorAll(CONFIG.selector);
  if (!images.length) return;

  images.forEach(function (img) {

    /* ── 1. Avvolge l'img originale in-place ──────────────────────
       Il DOM risultante:
         <div class="mz-wrap">
           <div class="mz-viewport">
             <img ...>          ← l'elemento originale, invariato
             <div class="mz-hint">...</div>
             <div class="mz-badge">1×</div>
             <div class="mz-btns">...</div>
           </div>
           <p class="mz-caption">...</p>   (solo se data-caption)
         </div>
    ─────────────────────────────────────────────────────────────── */
    const viewport = document.createElement('div');
    viewport.className = 'mz-viewport';

    const hint = document.createElement('div');
    hint.className = 'mz-hint';
    hint.innerHTML = '<span>' + CONFIG.hintText + '</span>';

    const badge = document.createElement('div');
    badge.className = 'mz-badge';
    badge.textContent = '1×';

    const btns = document.createElement('div');
    btns.className = 'mz-btns';
    btns.innerHTML =
      '<button class="mz-btn" data-action="out">−</button>' +
      '<button class="mz-btn" data-action="reset">⌂</button>' +
      '<button class="mz-btn" data-action="in">+</button>';

    // Inserisce il viewport prima dell'img, poi sposta l'img dentro
    img.insertAdjacentElement('beforebegin', viewport);
    viewport.appendChild(img);          // l'img originale si sposta qui
    viewport.append(hint, badge, btns);

    // Wrap esterno (per la caption e margini)
    const wrap = document.createElement('div');
    wrap.className = 'mz-wrap';
    viewport.insertAdjacentElement('beforebegin', wrap);
    wrap.appendChild(viewport);

    // Caption opzionale da data-caption sull'img originale
    const captionText = img.dataset.caption;
    if (captionText) {
      const cap = document.createElement('p');
      cap.className = 'mz-caption';
      cap.textContent = captionText;
      wrap.appendChild(cap);
    }

    // Classi CSS sull'img originale per il comportamento zoom
    img.classList.add('mz-img');

    /* ── 2. Altezza viewport = proporzioni naturali dell'img ── */
    function syncHeight() {
      if (!img.naturalWidth) return;
      viewport.style.height =
        Math.round(img.naturalHeight / img.naturalWidth * viewport.offsetWidth) + 'px';
    }
    if (img.complete && img.naturalWidth) syncHeight();
    else img.addEventListener('load', syncHeight);
    window.addEventListener('resize', syncHeight, { passive: true });

    /* ── 3. Engine pan / zoom ── */
    let sc = 1, tx = 0, ty = 0;
    const MIN = 1, MAX = CONFIG.maxScale;
    let hintShown = true;
    let panning = false, px = 0, py = 0;
    let pinching = false, lastD = 0, startSc = 1;

    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

    function clampTranslate(s, x, y) {
      const W = viewport.offsetWidth, H = viewport.offsetHeight;
      return {
        x: clamp(x, W - W * s, 0),
        y: clamp(y, H - H * s, 0)
      };
    }

    function applyTransform(animated) {
      const c = clampTranslate(sc, tx, ty);
      tx = c.x; ty = c.y;
      img.style.transition = animated
        ? 'transform .28s cubic-bezier(.25,.8,.25,1)'
        : 'none';
      img.style.transform = 'scale(' + sc + ') translate(' + (tx / sc) + 'px,' + (ty / sc) + 'px)';
      badge.textContent = sc < 1.05 ? '1×' : sc.toFixed(1) + '×';
      badge.classList.toggle('visible', sc > 1.05);
    }

    function dismissHint() {
      if (!hintShown) return;
      hintShown = false;
      hint.classList.add('gone');
    }

    function getDistance(a, b) {
      return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    }

    viewport.addEventListener('touchstart', function (e) {
      dismissHint();
      if (e.touches.length === 2) {
        e.preventDefault();
        panning = false; pinching = true;
        lastD = getDistance(e.touches[0], e.touches[1]);
        startSc = sc;
      } else if (e.touches.length === 1) {
        panning = true; pinching = false;
        px = e.touches[0].clientX - tx;
        py = e.touches[0].clientY - ty;
      }
    }, { passive: false });

    viewport.addEventListener('touchmove', function (e) {
      if (pinching && e.touches.length === 2) {
        e.preventDefault();
        const d = getDistance(e.touches[0], e.touches[1]);
        const newSc = clamp(startSc * (d / lastD), MIN, MAX);
        const ratio = newSc / sc;
        const r = viewport.getBoundingClientRect();
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        tx = mx - ratio * (mx - tx);
        ty = my - ratio * (my - ty);
        sc = newSc;
        applyTransform(false);
      } else if (panning && e.touches.length === 1 && sc > 1.01) {
        e.preventDefault();
        tx = e.touches[0].clientX - px;
        ty = e.touches[0].clientY - py;
        applyTransform(false);
      }
    }, { passive: false });

    viewport.addEventListener('touchend', function (e) {
      if (e.touches.length < 2) pinching = false;
      if (e.touches.length === 0) {
        panning = false;
        if (sc < MIN) { sc = MIN; tx = 0; ty = 0; applyTransform(true); }
      }
    });

    /* Pulsanti + / − / reset */
    btns.addEventListener('click', function (e) {
      const btn = e.target.closest('.mz-btn');
      if (!btn) return;
      dismissHint();
      const action = btn.dataset.action;
      const W = viewport.offsetWidth, H = viewport.offsetHeight;
      if (action === 'in' || action === 'out') {
        const newSc = clamp(action === 'in' ? sc * 1.6 : sc / 1.6, MIN, MAX);
        const ratio = newSc / sc;
        tx = W / 2 - ratio * (W / 2 - tx);
        ty = H / 2 - ratio * (H / 2 - ty);
        sc = newSc;
      } else {
        sc = 1; tx = 0; ty = 0;
      }
      applyTransform(true);
    });

  }); // fine forEach

  /* ── Reading progress ── */
  const bar = document.getElementById('progress');
  if (bar) {
    window.addEventListener('scroll', function () {
      bar.style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
    }, { passive: true });
  }

}());
