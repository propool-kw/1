/* PROPOOL — projects page */
(function () {
  'use strict';
  /* 1) اللغة المحفوظة من الصفحة الرئيسية */
  var APPLY_SAVED_LANG = true; // خليها false لو التصميم الإنجليزي مش جاهز
  var lang = 'ar';
  try { lang = localStorage.getItem('propool-lang') || 'ar'; } catch (e) {}
  if (APPLY_SAVED_LANG && lang === 'en') {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.textContent = el.getAttribute('data-en');
    });
  }
  /* 2) قائمة الموبايل */
  var menu = document.getElementById('menu');
  var links = document.getElementById('navLinks');
  function setMenu(open) {
    if (!menu || !links) return;
    menu.classList.toggle('open', open);
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menu && links) {
    menu.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }
  /* 3) ظل الهيدر عند النزول */
  var nav = document.getElementById('mainNav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  /* 4) تشغيل فيديوهات المشاريع لما تظهر في الشاشة */
  var vids = document.querySelectorAll('.prj-media video');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (v.preload === 'none') v.preload = 'metadata';
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
  }
})();
