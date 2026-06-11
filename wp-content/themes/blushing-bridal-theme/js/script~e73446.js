/* ========================================
   Whisper of Vows BOUTIQUE — Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- HEADER SCROLL EFFECT ---
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // --- DESKTOP DROPDOWN HOVER-INTENT ---
  // The dropdowns were CSS :hover-driven, but Elementor / page-builder layers
  // sometimes break the DOM-hover chain (transforms, will-change, container
  // queries) which makes the menu close mid-move. We track hover on BOTH
  // the menu LI and the dropdown panel separately — if either has the mouse,
  // the menu stays open. Only when BOTH lose hover do we schedule a close.
  // Touch/mobile users go through the mobile menu and aren't affected here.
  (function () {
    var DROPDOWNS = document.querySelectorAll('.nav__menu .nav__dropdown');
    var CLOSE_DELAY = 350; // ms — forgiving enough to cross any visual gap

    DROPDOWNS.forEach(function (li) {
      var menu = li.querySelector('.nav__dropdown-menu');
      if (!menu) return;

      var timer     = null;
      var inLi      = false;
      var inMenu    = false;

      function openNow() {
        clearTimeout(timer);
        li.classList.add('is-open');
      }
      function maybeClose() {
        if (inLi || inMenu) return;
        clearTimeout(timer);
        timer = setTimeout(function () { li.classList.remove('is-open'); }, CLOSE_DELAY);
      }

      li.addEventListener('mouseenter',   function () { inLi = true;  openNow(); });
      li.addEventListener('mouseleave',   function () { inLi = false; maybeClose(); });
      menu.addEventListener('mouseenter', function () { inMenu = true;  openNow(); });
      menu.addEventListener('mouseleave', function () { inMenu = false; maybeClose(); });

      // Keep open while keyboard focus is anywhere inside.
      li.addEventListener('focusin',  openNow);
      li.addEventListener('focusout', function (e) {
        if (!li.contains(e.relatedTarget)) maybeClose();
      });
    });
  })();

  // --- MOBILE MENU ---
  const mobileToggle = document.getElementById('mobileToggle') || document.querySelector('.nav__mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Toggle sub-menus on mobile — delegated so it works even if the menu
    // is re-rendered by WP, cached menu items get swapped in/out, or the
    // user opens the menu before script.js finishes evaluating.
    mobileMenu.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var parent = link.parentElement;
      // Only intercept the row that IS a parent (has children).
      // Sub-menu links (.mobile-menu__sub > li > a) should navigate normally.
      if (!parent || !parent.classList.contains('mobile-menu__parent')) return;
      // Make sure we got the parent's direct-child <a>, not a nested one.
      if (link.parentElement !== parent) return;
      e.preventDefault();
      parent.classList.toggle('open');
    });

    // Close menu when clicking a real (terminal) link — but NOT when tapping
    // an expandable parent row, otherwise we'd both expand the submenu and
    // close the whole menu in the same click. Delegated so it picks up newly
    // rendered links too.
    mobileMenu.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      // The link's immediate parent is the <li>. If that LI is an expandable
      // parent, the toggle handler above has it covered — don't close.
      if (link.parentElement && link.parentElement.classList.contains('mobile-menu__parent')
          && link.parentElement === link.parentNode) {
        return;
      }
      mobileToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // --- SCROLL REVEAL ANIMATIONS ---
  const revealElements = () => {
    const sections = document.querySelectorAll(
      '.gallery__header, .gallery__item, .review-card, .experience__item, ' +
      '.about__content, .about__image, .brands__header, .reviews__header, ' +
      '.fullscreen-cta__content, .reviews__more, .gallery__cta'
    );

    sections.forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  };

  revealElements();

  // --- STAGGER GALLERY ITEMS ---
  const galleryItems = document.querySelectorAll('.gallery__item');
  galleryItems.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.1}s`;
  });

  // --- STAGGER REVIEW CARDS ---
  const reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });

  // --- STAGGER EXPERIENCE ITEMS ---
  const expItems = document.querySelectorAll('.experience__item');
  expItems.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.15}s`;
  });

  // --- PARALLAX ON FULLSCREEN CTAs ---
  const fullscreenSections = document.querySelectorAll('.fullscreen-cta');

  if (window.matchMedia('(min-width: 769px)').matches) {
    window.addEventListener('scroll', () => {
      fullscreenSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const scrollPercent = rect.top / window.innerHeight;
        if (scrollPercent < 1 && scrollPercent > -1) {
          section.style.backgroundPositionY = `${50 + scrollPercent * 20}%`;
        }
      });
    }, { passive: true });
  }

  // --- SMOOTH ANCHOR SCROLLING ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- VIDEO LAZY LOADING & COMPRESSION HINT ---
  const video = document.querySelector('.hero__video-frame video');
  if (video) {
    // Reduce quality for faster playback on slow connections
    if (navigator.connection && navigator.connection.effectiveType) {
      const conn = navigator.connection.effectiveType;
      if (conn === '2g' || conn === 'slow-2g') {
        video.pause();
        video.poster && (video.style.display = 'none');
      }
    }

    // Play video only when visible
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.25 });

    videoObserver.observe(video);
  }

  // --- BRAND SLIDER PAUSE ON HOVER ---
  const brandTrack = document.querySelector('.brands__track');
  if (brandTrack) {
    const wrapper = brandTrack.parentElement;
    wrapper.addEventListener('mouseenter', () => {
      brandTrack.style.animationPlayState = 'paused';
    });
    wrapper.addEventListener('mouseleave', () => {
      brandTrack.style.animationPlayState = 'running';
    });
  }

  // --- SEARCH OVERLAY ---
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', () => {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput.focus(), 300);
    });

    searchClose.addEventListener('click', () => {
      searchOverlay.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        searchOverlay.classList.remove('active');
      }
    });
  }

  // --- CURRENCY DROPDOWN ---
  const currencyToggle = document.getElementById('currencyToggle');
  const currencyDropdown = document.getElementById('currencyDropdown');

  if (currencyToggle && currencyDropdown) {
    currencyToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      currencyDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!currencyDropdown.contains(e.target) && e.target !== currencyToggle) {
        currencyDropdown.classList.remove('active');
      }
    });
  }

  // --- BOOKING MODAL ---
  const bookingModal = document.getElementById('bookingModal');
  const bookingClose = document.getElementById('bookingClose');
  const bookingBackdrop = document.getElementById('bookingBackdrop');
  const bookTriggers = document.querySelectorAll('.book-appointment-trigger, #bookAppointmentBtn');

  if (bookingModal) {
    const openBooking = (e) => {
      e.preventDefault();
      bookingModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeBooking = () => {
      bookingModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    bookTriggers.forEach(trigger => trigger.addEventListener('click', openBooking));
    bookingClose.addEventListener('click', closeBooking);
    bookingBackdrop.addEventListener('click', closeBooking);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
        closeBooking();
      }
    });
  }

});
