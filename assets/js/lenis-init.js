/**
 * Lenis Smooth Scroll — Initialization
 * Lightweight, performant smooth scrolling for the entire page.
 * https://github.com/darkroomengineering/lenis
 */

(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────────── */
  const LENIS_OPTIONS = {
    duration   : 1.2,       // scroll duration (seconds) — higher = smoother
    easing     : function (t) {
      return Math.min(1, 1.001 - Math.pow(2, -10 * t)); // expo-out easing
    },
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: false,     // keep native momentum on touch devices
    touchMultiplier: 2,
  };

  /* ── Guard: bail if Lenis didn't load ──────────────── */
  if (typeof Lenis === 'undefined') {
    console.warn('[lenis-init] Lenis library not found — skipping smooth scroll.');
    return;
  }

  /* ── Create instance ───────────────────────────────── */
  const lenis = new Lenis(LENIS_OPTIONS);

  /* ── Animation loop ────────────────────────────────── */
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* ── Anchor-link integration ───────────────────────── */
  // Smooth-scroll to any on-page #hash link
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: -80 }); // 80px offset for sticky header
      }
    });
  });

  /* ── Pause during modal / overlay opens ────────────── */
  // Stop Lenis when booking modal, search overlay, or mobile menu is open
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type !== 'attributes' || m.attributeName !== 'class') return;
      var target = m.target;

      var isOverlayOpen =
        target.classList.contains('booking-modal--open') ||
        target.classList.contains('search-overlay--open') ||
        target.classList.contains('mobile-menu--open');

      if (isOverlayOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* ── Expose globally (optional, useful for debugging) ─ */
  window.__lenis = lenis;
})();
