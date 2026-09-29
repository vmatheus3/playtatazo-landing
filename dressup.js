/* TATAZO landing: the wardrobe's dress-up stage (r-20260928-112, owner's choice). One big Tatazo on a
   small stage: pick a class, then a skin, and his outfit swaps; a boy/girl toggle swaps the model too.
   Data comes from dressup-data.js (window.TATAZO_SKINS, built from wiki/data/skins.json). Pictures are
   the game's own skin renders (img/skins/<id>_<boy|girl>.webp, with a .png fallback via onerror). */
(function () {
  "use strict";
  var data = window.TATAZO_SKINS || [];
  var box = document.getElementById("dressup");
  if (!box || !data.length) return;

  var figure = document.getElementById("du-figure");
  var nameEl = document.getElementById("du-name");
  var blurbEl = document.getElementById("du-blurb");
  var swatchWrap = document.getElementById("du-swatches");
  var classTabs = Array.prototype.slice.call(document.querySelectorAll("#du-classes [role=tab]"));
  var genderBtn = document.getElementById("du-gender");

  var gender = "boy", skinId = "knight_sun";

  function byClass(c) { return data.filter(function (s) { return s.cls === c; }); }
  function findSkin(id) { for (var i = 0; i < data.length; i++) if (data[i].id === id) return data[i]; return null; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function updateFigure() {
    var s = findSkin(skinId);
    var webp = "img/skins/" + skinId + "_" + gender + ".webp";
    var png = "img/skins/" + skinId + "_" + gender + ".png";
    figure.onerror = function () { figure.onerror = null; figure.src = png; };
    figure.src = webp;
    figure.alt = "Tatazo the " + cap(s.cls) + " wearing the " + s.name + " look";
  }

  function renderSwatches(cls) {
    var list = byClass(cls);
    swatchWrap.innerHTML = "";
    list.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "option");
      b.className = "du-sw";
      b.setAttribute("aria-selected", String(s.id === skinId));
      b.setAttribute("aria-label", s.name + (s.free ? " (a starter look)" : ""));
      b.title = s.name;
      b.style.background = "linear-gradient(135deg," + s.sw[0] + " 0 34%," + s.sw[1] + " 34% 67%," + s.sw[2] + " 67% 100%)";
      b.dataset.skin = s.id;
      if (s.free) b.classList.add("free");
      b.addEventListener("click", function () { selectSkin(s.id); });
      swatchWrap.appendChild(b);
    });
  }

  function markSwatch() {
    Array.prototype.forEach.call(swatchWrap.querySelectorAll(".du-sw"), function (b) {
      b.setAttribute("aria-selected", String(b.dataset.skin === skinId));
    });
  }

  function selectSkin(id) {
    var s = findSkin(id);
    if (!s) return;
    skinId = id;
    nameEl.textContent = s.name;
    blurbEl.textContent = s.blurb;
    updateFigure();
    markSwatch();
  }

  function selectClass(c, focus) {
    box.dataset.cls = c;
    classTabs.forEach(function (t) {
      var on = t.dataset.cls === c;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    renderSwatches(c);
    var list = byClass(c);
    var pick = list.filter(function (s) { return s.free; })[0] || list[0];
    selectSkin(pick.id);
  }

  classTabs.forEach(function (t) {
    t.addEventListener("click", function () { selectClass(t.dataset.cls); });
  });
  document.getElementById("du-classes").addEventListener("keydown", function (e) {
    var cur = classTabs.indexOf(document.activeElement);
    if (cur < 0) return;
    var k = e.key === "ArrowRight" ? cur + 1 : e.key === "ArrowLeft" ? cur - 1
      : e.key === "Home" ? 0 : e.key === "End" ? classTabs.length - 1 : null;
    if (k === null) return;
    e.preventDefault();
    selectClass(classTabs[(k + classTabs.length) % classTabs.length].dataset.cls, true);
  });

  genderBtn.addEventListener("click", function () {
    gender = gender === "boy" ? "girl" : "boy";
    genderBtn.setAttribute("aria-pressed", String(gender === "girl"));
    genderBtn.setAttribute("aria-label", gender === "girl" ? "Show the boy gator instead" : "Show the girl gator instead");
    updateFigure();
  });

  renderSwatches("knight");
  selectSkin(skinId);
})();
