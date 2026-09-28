/* TATAZO landing page: the small mobile nav toggle (hidden above 900px, see responsive.css). */
(function () {
  "use strict";
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  ready(function () {
    var btn = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!btn || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("nav-open", open);
    }

    btn.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        btn.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      setOpen(false);
    });

    // If the viewport grows past the mobile breakpoint, drop any open/inline state.
    var mq = matchMedia("(min-width: 901px)");
    function syncToBreakpoint() { if (mq.matches) setOpen(false); }
    if (mq.addEventListener) mq.addEventListener("change", syncToBreakpoint);
    else if (mq.addListener) mq.addListener(syncToBreakpoint);
  });
})();

// One logo at a time (owner, 2026-09-27): the header's small logo stays hidden while the hero's
// big logo is on screen, and fades in once it scrolls away.
(function () {
  function init() {
    var lockup = document.querySelector(".hero .lockup"), root = document.documentElement;
    if (!lockup || !("IntersectionObserver" in window)) { root.classList.add("past-hero"); return; }
    new IntersectionObserver(function (es) { root.classList.toggle("past-hero", !es[0].isIntersecting); }).observe(lockup);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
