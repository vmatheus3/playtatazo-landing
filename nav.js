/* TATAZO landing page: header behaviour.
   The mobile top bar (r-20260928-112, owner's choice) has no hamburger any more - just Forum, Wiki
   and a heart wishlist button, always visible - so there is no menu to open or close here. */

// One logo at a time (owner, 2026-09-27): the header's small logo stays hidden while the hero's
// big logo is on screen, and fades in once it scrolls away. (Mobile hides the header logo outright;
// see responsive.css.)
(function () {
  function init() {
    var lockup = document.querySelector(".hero .lockup"), root = document.documentElement;
    if (!lockup || !("IntersectionObserver" in window)) { root.classList.add("past-hero"); return; }
    new IntersectionObserver(function (es) { root.classList.toggle("past-hero", !es[0].isIntersecting); }).observe(lockup);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
