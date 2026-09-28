/* TATAZO landing page: launch-news signup and the Wiki/Forum links.
   Plain fetch, no SDK: posts straight to Supabase's PostgREST endpoint. Needs config.js loaded first. */
(function () {
  "use strict";

  var CONSENT_TEXT = "I'm a grown-up (16+) and I agree to get TATAZO launch news. I can unsubscribe any time.";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var cfg = window.TATAZO_CONFIG || {};

    // Wiki / Forum links: point them at the configured URLs (or the placeholder defaults in config.js).
    document.querySelectorAll("[data-config-link]").forEach(function (a) {
      var key = a.getAttribute("data-config-link");
      var url = cfg[key];
      // data-config-path adds a page inside that site (e.g. the wiki's "guides/game-modes.html").
      var path = a.getAttribute("data-config-path");
      if (url && path) url = url.replace(/\/?$/, "/") + path;
      if (url) a.setAttribute("href", url);
    });

    var form = document.getElementById("newsletter-form");
    if (!form) return;
    var emailField = document.getElementById("newsletter-email");
    var consentField = document.getElementById("newsletter-consent");
    var honeypot = document.getElementById("newsletter-hp");
    var submitBtn = document.getElementById("newsletter-submit");
    var msg = document.getElementById("newsletter-msg");

    var hasBackend = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

    if (!hasBackend) {
      emailField.disabled = true;
      consentField.disabled = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Coming soon";
      msg.textContent = "Coming soon: launch news sign-ups aren't open yet.";
      msg.className = "form-msg form-msg-info";
      return;
    }

    function setMsg(text, kind) {
      msg.textContent = text;
      msg.className = "form-msg" + (kind ? " form-msg-" + kind : "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: real people never fill this hidden field in. If it's filled, quietly pretend
      // to succeed without posting anything, so bots learn nothing from the response.
      if (honeypot && honeypot.value) {
        setMsg("Check your inbox to confirm.", "success");
        form.reset();
        return;
      }

      var email = (emailField.value || "").trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        setMsg("Please enter a valid email address.", "error");
        emailField.focus();
        return;
      }
      if (!consentField.checked) {
        setMsg("Please tick the box to agree before signing up.", "error");
        consentField.focus();
        return;
      }

      submitBtn.disabled = true;
      var prevLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      setMsg("", "");

      var body = {
        email: email,
        consent_at: new Date().toISOString(),
        consent_text: CONSENT_TEXT,
        locale: (navigator.language || "en"),
        source: "landing"
      };

      fetch(cfg.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/newsletter_signups", {
        method: "POST",
        headers: {
          "apikey": cfg.SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(body)
      }).then(function (res) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel;
        if (res.ok) {
          setMsg("Check your inbox to confirm.", "success");
          form.reset();
        } else {
          setMsg("Something went wrong. Please try again in a moment.", "error");
        }
      }).catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel;
        setMsg("Something went wrong. Please try again in a moment.", "error");
      });
    });
  });
})();
