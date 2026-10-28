/* Stray Dog v2 — interactions (static preview) */
(function () {
  "use strict";

  /* ---- Announcement bar ---- */
  var ann = document.querySelector("[data-announce]");
  var annClose = document.querySelector("[data-announce-close]");
  if (ann && annClose) annClose.addEventListener("click", function () { ann.classList.add("hidden"); });

  /* ---- Mobile menu ---- */
  var menuBtn = document.querySelector("[data-menu-toggle]");
  var mMenu = document.querySelector("[data-mobile-menu]");
  if (menuBtn && mMenu) {
    menuBtn.addEventListener("click", function () { mMenu.classList.toggle("open"); });
  }

  /* ---- Back to top ---- */
  document.querySelectorAll("[data-btt]").forEach(function (b) {
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  });

  /* ---- Footer clock ---- */
  var clock = document.querySelector("[data-clock]");
  if (clock) {
    var tick = function () {
      var d = new Date();
      var hh = String(d.getHours()).padStart(2, "0");
      var mm = String(d.getMinutes()).padStart(2, "0");
      clock.textContent = hh + ":" + mm;
    };
    tick(); setInterval(tick, 15000);
  }

  /* ---- Toast ---- */
  var toast;
  function showToast(msg) {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(function () { toast.classList.add("show"); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  /* ---- Forms (newsletter / early access) ---- */
  document.querySelectorAll("form[data-demo-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = f.querySelector('input[type="email"]');
      if (email && !email.value) { email.focus(); return; }
      f.innerHTML = '<p class="early__done">You\'re in the pack — watch your inbox.</p>';
    });
  });

  /* ---- PDP: thumbnail scrollspy + click ---- */
  var gallery = document.querySelector("[data-gallery]");
  var thumbsWrap = document.querySelector("[data-thumbs]");
  if (gallery && thumbsWrap) {
    var imgs = gallery.querySelectorAll(".pdp__img");
    var thumbs = thumbsWrap.querySelectorAll(".pdp__thumb");
    thumbs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        if (imgs[i]) imgs[i].scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var idx = Array.prototype.indexOf.call(imgs, en.target);
            thumbs.forEach(function (t) { t.classList.remove("active"); });
            if (thumbs[idx]) thumbs[idx].classList.add("active");
          }
        });
      }, { rootMargin: "-30% 0px -50% 0px" });
      imgs.forEach(function (im) { io.observe(im); });
    }
  }

  /* ---- PDP: size pills ---- */
  document.querySelectorAll("[data-sizes] .size-pill").forEach(function (p) {
    p.addEventListener("click", function () {
      document.querySelectorAll("[data-sizes] .size-pill").forEach(function (x) { x.classList.remove("active"); });
      p.classList.add("active");
    });
  });

  /* ---- PDP: quantity ---- */
  var qty = document.querySelector("[data-qty]");
  if (qty) {
    var input = qty.querySelector("input");
    qty.querySelector("[data-qty-minus]").addEventListener("click", function () {
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
    });
    qty.querySelector("[data-qty-plus]").addEventListener("click", function () {
      input.value = (parseInt(input.value, 10) || 1) + 1;
    });
  }

  /* ---- PDP: real variant picker ----
     [data-variant-pick] sets the hidden variant id + active state;
     [data-option-group] pills pick option values and re-resolve the variant. */
  var variantData = document.querySelector("[data-variants-json]");
  if (variantData) {
    var variants = JSON.parse(variantData.textContent);
    var vidInput = document.querySelector("[data-variant-id]");
    var priceEl = document.querySelector("[data-pdp-price]");
    var chosen = {};
    document.querySelectorAll("[data-option-group]").forEach(function (g) {
      var active = g.querySelector(".size-pill.active, .vars a.active");
      if (active) chosen[g.getAttribute("data-option-group")] = active.getAttribute("data-value");
    });
    var resolve = function () {
      var match = variants.filter(function (v) {
        return Object.keys(chosen).every(function (k) { return v.options.indexOf(chosen[k]) !== -1; });
      })[0] || variants[0];
      if (!match) return;
      if (vidInput) vidInput.value = match.id;
      if (priceEl) priceEl.textContent = match.price;
      var atcBtn = document.querySelector("[data-pdp-atc]");
      if (atcBtn) { atcBtn.disabled = !match.available; atcBtn.querySelector("span:last-child").textContent = match.available ? match.price : "Sold out"; }
    };
    document.querySelectorAll("[data-direct-pick]").forEach(function (p) {
      p.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelectorAll("[data-direct-pick]").forEach(function (x) { x.classList.remove("active"); });
        p.classList.add("active");
        if (vidInput) vidInput.value = p.getAttribute("data-direct-pick");
        var atcBtn = document.querySelector("[data-pdp-atc]");
        if (atcBtn && p.getAttribute("data-price")) atcBtn.querySelector("span:last-child").textContent = p.getAttribute("data-price");
        if (priceEl && p.getAttribute("data-price")) priceEl.textContent = p.getAttribute("data-price") + " " + (priceEl.dataset.currency || "USD");
      });
    });
    document.querySelectorAll("[data-variant-pick]").forEach(function (p) {
      p.addEventListener("click", function (e) {
        e.preventDefault();
        var g = p.closest("[data-option-group]");
        g.querySelectorAll("[data-variant-pick]").forEach(function (x) { x.classList.remove("active"); });
        p.classList.add("active");
        chosen[g.getAttribute("data-option-group")] = p.getAttribute("data-value");
        resolve();
      });
    });
    resolve();
  }
})();
