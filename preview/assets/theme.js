/* Stray Dog v2 — interactions (static preview) */
(function () {
  "use strict";

  /* ---- Announcement bar ---- */
  var ann = document.querySelector("[data-announce]");
  var annClose = document.querySelector("[data-announce-close]");
  if (ann && annClose) annClose.addEventListener("click", function () { ann.classList.add("hidden"); });

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

  /* ---- PDP: add to cart ---- */
  document.querySelectorAll("[data-atc]").forEach(function (b) {
    b.addEventListener("click", function () {
      var n = document.querySelector("[data-qty] input");
      var count = n ? (parseInt(n.value, 10) || 1) : 1;
      document.querySelectorAll("[data-cart-count]").forEach(function (c) {
        var cur = parseInt(c.textContent.replace(/\D/g, ""), 10) || 0;
        c.textContent = "(" + (cur + count) + ")";
      });
      showToast("Added to cart — " + (b.getAttribute("data-atc") || "item"));
    });
  });
})();
