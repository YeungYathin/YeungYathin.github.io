/**
 * Yixuan Yang — Personal Homepage v3
 * main.js — SPA Router, Sidebar, Scroll-spy, Animations, Toggles
 */
(function () {
  'use strict';

  var ROUTES = ['home', 'research', 'projects', 'academics', 'life'];

  /* ── 1. Hash-based Router ─────────────────────────────── */

  function getRoute() {
    var raw = location.hash.replace(/^#\/?/, '');
    return ROUTES.indexOf(raw) !== -1 ? raw : 'home';
  }

  function navigate(route) {
    document.querySelectorAll('.page').forEach(function (p) {
      p.classList.toggle('is-active', p.dataset.route === route);
    });
    document.querySelectorAll('.route-link').forEach(function (l) {
      l.classList.toggle('is-active', l.dataset.route === route);
    });
    document.querySelectorAll('.sidebar-panel').forEach(function (p) {
      p.classList.toggle('is-active', p.dataset.route === route);
    });
    document.querySelectorAll('.mobile-menu a[data-route]').forEach(function (l) {
      l.classList.toggle('is-active', l.dataset.route === route);
    });

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Reset animation states for new page so they can re-trigger
    var page = document.querySelector('.page[data-route="' + route + '"]');
    if (page) {
      page.querySelectorAll('[data-animate].is-visible, [data-animate-stagger].is-visible').forEach(function (el) {
        el.classList.remove('is-visible');
      });
    }

    initScrollAnimations();
    initScrollSpy();
  }

  window.addEventListener('hashchange', function () {
    navigate(getRoute());
  });

  // Route-link clicks (top nav, mobile menu, brand)
  document.querySelectorAll('.route-link, .mobile-menu a[data-route], .top-nav-brand').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var route = el.dataset.route || 'home';
      location.hash = route === 'home' ? '#/' : '#/' + route;
    });
  });

  /* ── 2. Sidebar Section Links ─────────────────────────── */

  document.querySelectorAll('.sidebar-link[data-section]').forEach(function (link) {
    link.addEventListener('click', function () {
      var target = document.getElementById(link.dataset.section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 3. Scroll Animations ─────────────────────────────── */

  var animObserver;

  function initScrollAnimations() {
    if (animObserver) animObserver.disconnect();

    var page = document.querySelector('.page.is-active');
    if (!page) return;

    var els = page.querySelectorAll('[data-animate]:not(.is-visible), [data-animate-stagger]:not(.is-visible)');
    if (!els.length) return;

    animObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            animObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(function (el) {
      animObserver.observe(el);
    });
  }

  /* ── 4. Sidebar Scroll-Spy ────────────────────────────── */

  var spyObserver;

  function initScrollSpy() {
    if (spyObserver) spyObserver.disconnect();

    var panel = document.querySelector('.sidebar-panel.is-active');
    if (!panel) return;

    var links = panel.querySelectorAll('.sidebar-link[data-section]');
    var sections = [];

    links.forEach(function (link) {
      var el = document.getElementById(link.dataset.section);
      if (el) sections.push({ el: el, link: link });
    });

    if (!sections.length) return;

    spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sections.find(function (s) {
            return s.el === entry.target;
          });
          if (!match) return;
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove('is-active');
            });
            match.link.classList.add('is-active');
          }
        });
      },
      { threshold: 0.15, rootMargin: '-80px 0px -50% 0px' }
    );

    sections.forEach(function (s) {
      spyObserver.observe(s.el);
    });
  }

  /* ── 5. News Toggle ───────────────────────────────────── */

  var newsToggle = document.getElementById('newsToggle');
  var newsHidden = document.getElementById('newsHidden');

  if (newsToggle && newsHidden) {
    newsToggle.addEventListener('click', function () {
      var expanded = newsHidden.classList.toggle('is-visible');
      newsToggle.classList.toggle('is-expanded', expanded);
      newsToggle.querySelector('span').textContent = expanded
        ? 'Show less'
        : 'Show earlier news';
    });
  }

  /* ── 6. Mobile Menu ───────────────────────────────────── */

  var burger = document.querySelector('.nav-burger');
  var mobileMenu = document.querySelector('.mobile-menu');

  function closeMobileMenu() {
    if (burger) burger.classList.remove('is-open');
    if (mobileMenu) mobileMenu.classList.remove('is-open');
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open');
    });
  }

  /* ── 7. Boot ──────────────────────────────────────────── */

  navigate(getRoute());
})();
