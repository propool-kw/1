/* =====================================================
   PROPOOL — Services Page
   File: services.js
   (standalone: لا يحتاج script.js في هذه الصفحة)
   ===================================================== */
(() => {
  "use strict";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const nav = $("#mainNav");
  const menu = $("#menu");
  const navLinks = $("#navLinks");
  const backTop = $("#backTop");
  const jumpBar = $("#svcJump .container");
  const mobileQuery = window.matchMedia("(max-width: 1024px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = () => (reduceMotion.matches ? "auto" : "smooth");
  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    if (!menu || !navLinks) return;
    navLinks.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  }
  if (menu && navLinks) {
    menu.addEventListener("click", () => {
      setMenu(!navLinks.classList.contains("open"));
    });
    // close when a link is tapped
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    // close when tapping outside the nav
    document.addEventListener("click", (e) => {
      if (nav && !nav.contains(e.target)) setMenu(false);
    });
    // close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
    // reset when switching to desktop width
    mobileQuery.addEventListener("change", () => setMenu(false));
  }
  /* ---------- Scroll: nav shadow + back-to-top ---------- */
  let ticking = false;
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 10);
    if (backTop) {
      const show = y > 400;
      backTop.classList.toggle("is-visible", show);
      backTop.classList.toggle("show", show);
    }
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();
  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
    });
  }
  /* ---------- Quick-jump bar: highlight the section in view ---------- */
  const jumpLinks = $$('#svcJump a[href^="#"]');
  const cards = $$(".svc-item");
  function centerInJumpBar(link) {
    if (!jumpBar || jumpBar.scrollWidth <= jumpBar.clientWidth) return;
    const c = jumpBar.getBoundingClientRect();
    const l = link.getBoundingClientRect();
    const delta = l.left + l.width / 2 - (c.left + c.width / 2);
    jumpBar.scrollTo({ left: jumpBar.scrollLeft + delta, behavior: scrollBehavior() });
  }
  function setActive(id) {
    jumpLinks.forEach((a) => {
      const on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active", on);
      if (on) {
        a.setAttribute("aria-current", "true");
        centerInJumpBar(a);
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }
  if ("IntersectionObserver" in window && cards.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    cards.forEach((card) => observer.observe(card));
  }
  // internal links (jump bar + footer): smooth scroll, offset handled by CSS scroll-margin-top
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      history.replaceState(null, "", "#" + id);
    });
  });
  /* ---------- Card videos: play only while visible ---------- */
  const cardVideos = $$(".svc-image video");
  if (cardVideos.length && "IntersectionObserver" in window && !reduceMotion.matches) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target;
          if (entry.isIntersecting) {
            const play = v.play();
            if (play && play.catch) play.catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    cardVideos.forEach((v) => videoObserver.observe(v));
  }
})();