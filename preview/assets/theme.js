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

  /* ---- Product catalog + cart (localStorage demo) ---- */
  var PRODUCTS = {
    "script-trucker-gold":  { name: "Script Trucker Hat — Gold",        price: 40, img: "assets/hat-script-gold.webp" },
    "script-trucker-pink":  { name: "Script Trucker Hat — Pink Stitch", price: 40, img: "assets/hat-script-pink.webp" },
    "neon-trucker-pink":    { name: "Neon Trucker Hat — Hot Pink",      price: 42, img: "assets/hat-pink.webp" },
    "patch-trucker-bw":     { name: "Patch Trucker Hat — Black / White",price: 38, img: "assets/hat-patch-bw.webp" },
    "rescue-tee-black":     { name: "Rescue Club Tee — Black",          price: 38, img: "assets/tee-dog-black.webp" },
    "harbor-tee-black":     { name: "Harbor Badge Tee — Black",         price: 38, img: "assets/tee-badge-black.webp" },
    "script-tee-white":     { name: "Essential Script Tee — White",     price: 36, img: "assets/tee-script-white.webp" },
    "script-tee-black":     { name: "Essential Script Tee — Black",     price: 36, img: "assets/tee-script-black.webp" },
    "script-tee-burgundy":  { name: "Essential Script Tee — Burgundy",  price: 36, img: "assets/tee-script-burgundy.webp" },
    "script-tee-cream":     { name: "Essential Script Tee — Cream",     price: 34, img: "assets/tee-script-cream.webp" }
  };

  function getCart() {
    try { return JSON.parse(localStorage.getItem("sd2cart")) || {}; }
    catch (e) { return {}; }
  }
  function setCart(c) {
    try { localStorage.setItem("sd2cart", JSON.stringify(c)); } catch (e) {}
    syncCartCount();
    renderCart();
  }
  function cartCount(c) {
    return Object.keys(c).reduce(function (n, k) { return n + (c[k].qty || 0); }, 0);
  }
  function syncCartCount() {
    var n = cartCount(getCart());
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = "(" + n + ")";
    });
  }
  function money(v) { return "$" + v.toFixed(2); }
  function addToCart(key, item, qty) {
    var c = getCart();
    if (c[key]) c[key].qty += qty;
    else c[key] = { name: item.name, price: item.price, img: item.img, qty: qty };
    setCart(c);
    showToast("Added to cart — " + item.name);
  }
  syncCartCount();

  /* PDP / anywhere: add-to-cart buttons carry data-atc="<product id>" */
  document.querySelectorAll("[data-atc]").forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.getAttribute("data-atc");
      var item = PRODUCTS[key] || { name: b.getAttribute("data-name") || key, price: parseFloat(b.getAttribute("data-price")) || 0, img: b.getAttribute("data-img") || "" };
      var n = document.querySelector("[data-qty] input");
      addToCart(key, item, n ? (parseInt(n.value, 10) || 1) : 1);
    });
  });

  /* ---- Gift card ---- */
  var giftPrice = document.querySelector("[data-gift-price]");
  var giftAmt = 25;
  document.querySelectorAll("[data-gift-amounts] .size-pill").forEach(function (p) {
    p.addEventListener("click", function () {
      document.querySelectorAll("[data-gift-amounts] .size-pill").forEach(function (x) { x.classList.remove("active"); });
      p.classList.add("active");
      giftAmt = parseInt(p.getAttribute("data-amt"), 10) || 25;
      if (giftPrice) giftPrice.textContent = money(giftAmt);
    });
  });
  var giftAtc = document.querySelector("[data-gift-atc]");
  if (giftAtc) giftAtc.addEventListener("click", function () {
    addToCart("gift-card-" + giftAmt, { name: "Gift Card — $" + giftAmt, price: giftAmt, img: "assets/straydog-logo-black.png" }, 1);
  });

  /* ---- Cart page ---- */
  var cartPage = document.querySelector("[data-cart-page]");
  function renderCart() {
    if (!cartPage) return;
    var c = getCart(), keys = Object.keys(c);
    if (!keys.length) {
      cartPage.innerHTML = '<p class="cart__empty">Your pile is empty — the drop is waiting.</p>' +
        '<a class="btn-primary" href="shop.html">Shop the drop</a>';
      return;
    }
    var total = 0;
    var rows = keys.map(function (k) {
      var it = c[k], line = it.price * it.qty; total += line;
      return '<div class="cart-item" data-key="' + k + '">' +
        '<img class="cart-item__img" src="' + it.img + '" alt="">' +
        '<div><p class="cart-item__name">' + it.name + '</p>' +
        '<p class="cart-item__price">' + money(it.price) + ' each</p></div>' +
        '<div class="cart-item__side">' +
        '<span class="cart-qty"><button data-dec>−</button><span>' + it.qty + '</span><button data-inc>+</button></span>' +
        '<button class="cart-remove" data-remove>Remove</button>' +
        '</div></div>';
    }).join("");
    cartPage.innerHTML = rows +
      '<div class="cart__summary"><span class="cart__total">Subtotal — ' + money(total) + '</span>' +
      '<button class="btn-primary" data-checkout>Checkout — ' + money(total) + '</button></div>' +
      '<p class="mono" style="font-size:11px;padding-top:10px">DEMO CHECKOUT — NO CARD REQUIRED</p>';
  }
  if (cartPage) {
    renderCart();
    cartPage.addEventListener("click", function (e) {
      var row = e.target.closest(".cart-item");
      if (e.target.closest("[data-checkout]")) {
        setCart({}); showToast("Order placed — see you at the lake");
        return;
      }
      if (!row) return;
      var c = getCart(), key = row.getAttribute("data-key");
      if (e.target.closest("[data-inc]")) c[key].qty++;
      else if (e.target.closest("[data-dec]")) c[key].qty = Math.max(1, c[key].qty - 1);
      else if (e.target.closest("[data-remove]")) { delete c[key]; showToast("Removed"); }
      else return;
      setCart(c);
    });
  }

  /* ---- Search page ---- */
  var sInput = document.querySelector("[data-search-input]");
  var sGrid = document.querySelector("[data-search-results]");
  var sCount = document.querySelector("[data-search-count]");
  if (sInput && sGrid) {
    var renderResults = function (q) {
      q = (q || "").trim().toLowerCase();
      var hits = Object.keys(PRODUCTS).filter(function (k) {
        return !q || PRODUCTS[k].name.toLowerCase().indexOf(q) !== -1;
      });
      sGrid.innerHTML = hits.map(function (k) {
        var p = PRODUCTS[k];
        return '<div class="p-card"><a class="p-card__well" href="product.html"><img src="' + p.img + '" alt=""></a>' +
          '<div class="p-card__meta"><a class="p-card__title" href="product.html">' + p.name + '</a>' +
          '<span class="p-card__price">' + money(p.price) + '</span></div></div>';
      }).join("");
      if (sCount) sCount.textContent = hits.length + " result" + (hits.length === 1 ? "" : "s") + (q ? ' — "' + q + '"' : "");
    };
    renderResults("");
    sInput.addEventListener("input", function () { renderResults(sInput.value); });
  }
})();
