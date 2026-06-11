/**
 * Disable Broken Links
 * ---------------------
 * Intercepts clicks on <a> and <button> elements that point to
 * pages which don't exist in the cloned site. Instead of navigating
 * to a 404, the click is silently swallowed and the element is
 * styled to look disabled.
 *
 * Works from any page depth thanks to path normalisation.
 */
(function () {
  'use strict';

  /* ── Broken internal paths (relative to site root) ── */
  var BROKEN_PATHS = [
    'about-us-blushing-bridal-boutique/index.html',
    'cart/index.html',
    'index~452e9a.html',
    'index~6cc610.html',
    'index~c5a527.html',
    'mood-board/index.html',
    'my-account/index.html',
    'my-story/index.html',
    'product-category/accessories/index.html',
    'product-category/ari-villoso/ciao-bella/index.html',
    'product-category/ari-villoso/harmony/index.html',
    'product-category/ari-villoso/honey/index.html',
    'product-category/ari-villoso/index.html',
    'product-category/ari-villoso/say-yes/index.html',
    'product-category/in-stock/index.html',
    'product-category/milla-nova/chapter-bride/index.html',
    'product-category/milla-nova/couture/index.html',
    'product-category/milla-nova/dart/index.html',
    'product-category/milla-nova/index.html',
    'product-category/milla-nova/la-maison-rose/index.html',
    'product-category/milla-nova/milla-by-lorenzo-rossi/index.html',
    'product-category/milla-nova/pearl-of-the-season/index.html',
    'product-category/milla-nova/secret-garden/index.html',
    'product-category/milla-nova/sleeping-beauty/index.html',
    'product-category/milla-nova/sounds-of-couture/index.html',
    'product-category/milla-nova/white-and-lace-line/bubbly-mood/index.html',
    'product-category/milla-nova/white-and-lace-line/calypso/index.html',
    'product-category/milla-nova/white-and-lace-line/index.html',
    'product-category/milla-nova/white-and-lace-line/muse-is/index.html',
    'product-category/shop-online/index.html',
    'product-category/shop-online/sale/index.html',
    'product-category/shop-online/say-yes-now/index.html'
  ];

  /* Build a fast-lookup Set from the broken paths */
  var brokenSet = new Set(BROKEN_PATHS);

  /**
   * Resolve a potentially-relative href into a root-relative
   * normalised path (strips leading "./" segments and collapses
   * "../" so it works from nested pages too).
   */
  function normalise(href) {
    if (!href) return '';
    /* Use the browser's own <a> resolution */
    var a = document.createElement('a');
    a.href = href;
    /* Only care about same-origin links */
    if (a.origin !== window.location.origin) return '';
    /* Strip the leading "/" and any trailing "#…" or "?…" */
    var path = a.pathname.replace(/^\//, '');
    return path;
  }

  /**
   * Check whether a given href resolves to one of the broken paths.
   */
  function isBroken(href) {
    var path = normalise(href);
    return path !== '' && brokenSet.has(path);
  }

  /**
   * Mark an element as disabled so it's visually obvious and
   * doesn't trigger navigation.
   */
  function disableElement(el) {
    if (el.dataset.brokenDisabled) return; /* already processed */
    el.dataset.brokenDisabled = 'true';
    el.style.pointerEvents = 'auto';   /* keep it clickable for the blocker */
    el.style.cursor = 'default';
    el.removeAttribute('href');         /* prevent native navigation */
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }

  /**
   * Scan the DOM for links pointing to broken pages and disable them.
   */
  function scanAndDisable() {
    var links = document.querySelectorAll('a[href]');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      /* Quick-match: starts with "./" or is a bare relative path */
      var cleaned = href.replace(/^\.\//, '');
      if (brokenSet.has(cleaned)) {
        disableElement(link);
        return;
      }

      /* Fallback: resolve the full URL and compare */
      if (isBroken(href)) {
        disableElement(link);
      }
    });
  }

  /* Run once when the DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndDisable);
  } else {
    scanAndDisable();
  }

  /* Also catch dynamically-added links via MutationObserver */
  var observer = new MutationObserver(function (mutations) {
    var needsScan = false;
    mutations.forEach(function (m) {
      if (m.addedNodes.length) needsScan = true;
    });
    if (needsScan) scanAndDisable();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
