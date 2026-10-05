/* TATAZO in-game screenshots page (/gallery/).
   Each card opens a lightbox (a modal <dialog>: Esc closes, focus stays inside, arrow keys move) and has
   "Copy link" (the picture's direct full-size address, /img/gallery/<name>.jpg) and "Forum code"
   ([img]address[/img]) so a forum post can show the picture without uploading it.
   A link to /gallery/#<name> opens that picture straight away. */
(function () {
  "use strict";
  var shots = Array.prototype.slice.call(document.querySelectorAll(".gshot"));
  if (!shots.length) return;
  var dlg = document.getElementById("lightbox"), img = document.getElementById("lb-img");
  var titleEl = document.getElementById("lb-title"), capEl = document.getElementById("lb-caption");
  var countEl = document.getElementById("lb-count"), openEl = document.getElementById("lb-open");
  var toastEl = document.getElementById("gal-toast");
  var cur = -1, opener = null, toastTimer = 0;

  function slugOf(i) { return shots[i].getAttribute("data-slug"); }
  function fullUrl(slug) { return location.origin + "/img/gallery/" + slug + ".jpg"; }
  function forumCode(slug) { return "[img]" + fullUrl(slug) + "[/img]"; }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("on"); }, 2200);
  }
  // While the dialog is open everything outside it is inert, so the toast and the copy fallback live inside it.
  function host() { return dlg.open ? dlg : document.body; }

  function copy(text, msg, btn) {
    function done() {
      toast(msg);
      if (!btn) return;
      var label = btn.lastChild;
      if (!btn.hasAttribute("data-label")) btn.setAttribute("data-label", label.nodeValue);
      btn.classList.add("is-done");
      label.nodeValue = "Copied";
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.classList.remove("is-done"); label.nodeValue = btn.getAttribute("data-label"); }, 1600);
    }
    function fallback() {
      var back = document.activeElement, t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.top = "0"; t.style.opacity = "0";
      host().appendChild(t); t.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      t.remove();
      if (back && back.focus) back.focus();
      if (ok) done(); else toast("Copy this: " + text);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  function show(i) {
    cur = (i + shots.length) % shots.length;
    var s = shots[cur], slug = slugOf(cur), full = fullUrl(slug);
    img.src = "../img/gallery/" + slug + "-md.webp";      // quick preview, then the full picture
    img.alt = s.getAttribute("data-title") + ": " + s.getAttribute("data-caption");
    var big = new Image();
    big.onload = function () { if (slugOf(cur) === slug) img.src = full; };
    big.src = full;
    titleEl.textContent = s.getAttribute("data-title");
    capEl.textContent = s.getAttribute("data-caption");
    countEl.textContent = (cur + 1) + " / " + shots.length;
    openEl.href = full;
    try { history.replaceState(null, "", "#" + slug); } catch (e) {}
    [cur + 1, cur - 1].forEach(function (k) { new Image().src = "../img/gallery/" + slugOf((k + shots.length) % shots.length) + "-md.webp"; });
  }
  function open(i, from) {
    opener = from || null;
    show(i);
    if (!dlg.open) {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
      dlg.appendChild(toastEl);
    }
  }
  dlg.addEventListener("close", function () {
    document.body.appendChild(toastEl);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (opener) opener.focus();
  });

  shots.forEach(function (s, i) {
    s.querySelector(".shot-open").addEventListener("click", function () { open(i, this); });
    s.querySelectorAll("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var slug = s.getAttribute("data-slug");
        if (b.getAttribute("data-copy") === "forum") copy(forumCode(slug), "Forum code copied. Paste it into your post.", b);
        else copy(fullUrl(slug), "Picture link copied.", b);
      });
    });
  });

  dlg.addEventListener("click", function (e) {
    var act = e.target.closest("[data-lb]");
    if (act) {
      var a = act.getAttribute("data-lb");
      if (a === "close") dlg.close();
      else if (a === "prev") show(cur - 1);
      else if (a === "next") show(cur + 1);
      else if (a === "link") copy(fullUrl(slugOf(cur)), "Picture link copied.", act);
      else if (a === "forum") copy(forumCode(slugOf(cur)), "Forum code copied. Paste it into your post.", act);
      return;
    }
    // a click on the dark area around the picture closes it
    if (e.target === dlg || e.target.classList.contains("lb-stage") || e.target.classList.contains("lb-frame")) dlg.close();
  });
  document.addEventListener("keydown", function (e) {
    if (!dlg.open) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
  });
  // swipe on touch screens
  var x0 = null;
  dlg.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // /gallery/#<name> opens that picture
  var h = decodeURIComponent(location.hash.slice(1));
  if (h) shots.forEach(function (s, i) { if (s.getAttribute("data-slug") === h) open(i, s.querySelector(".shot-open")); });
})();
