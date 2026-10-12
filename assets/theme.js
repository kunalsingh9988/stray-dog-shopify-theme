/* Stray Dog — theme.js */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const money = (cents) => {
    const el = document.querySelector('meta[name="sd-money-format"]');
    const fmt = el ? el.content : '${{amount}}';
    return fmt.replace(/\{\{\s*amount\s*\}\}/, (cents / 100).toFixed(2));
  };

  /* ---------- Overlay helpers ---------- */
  const overlay = () => $('[data-overlay]');
  const showOverlay = (on) => {
    const o = overlay();
    if (!o) return;
    o.hidden = false;
    requestAnimationFrame(() => o.classList.toggle('show', on));
    if (!on) setTimeout(() => { if (!o.classList.contains('show')) o.hidden = true; }, 300);
  };

  /* ---------- Header scroll state ---------- */
  const header = $('.sd-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu drawer ---------- */
  const menuDrawer = $('#MenuDrawer');
  $$('[data-open-menu]').forEach((btn) =>
    btn.addEventListener('click', () => {
      menuDrawer.classList.add('open');
      document.body.classList.add('drawer-open');
      showOverlay(true);
    })
  );
  $$('[data-close-menu]').forEach((btn) =>
    btn.addEventListener('click', () => {
      menuDrawer.classList.remove('open');
      document.body.classList.remove('drawer-open');
      showOverlay(false);
    })
  );

  /* ---------- Cart drawer ---------- */
  const cartDrawer = $('#CartDrawer');
  const openCart = () => {
    if (!cartDrawer) return (window.location.href = '/cart');
    cartDrawer.classList.add('open');
    document.body.classList.add('drawer-open');
    showOverlay(true);
  };
  const closeCart = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('open');
    document.body.classList.remove('drawer-open');
    showOverlay(false);
  };
  $$('[data-open-cart]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openCart(); }));
  $$('[data-close-cart]').forEach((b) => b.addEventListener('click', closeCart));

  const renderCartItems = (cart) => {
    const wrap = $('#CartDrawerItems');
    if (!wrap) return;
    if (!cart.items.length) {
      wrap.innerHTML = '<div class="cart-empty" style="padding:60px 0"><p>Your cart is currently empty.</p></div>';
    } else {
      wrap.innerHTML = cart.items.map((item) => `
        <div class="cart-line" data-key="${item.key}">
          <a href="${item.url}"><img src="${item.image || ''}" alt="${item.title}"></a>
          <div>
            <a class="cart-line__title" href="${item.url}">${item.product_title}</a>
            <div class="cart-line__meta">${item.variant_title || ''}</div>
            <div class="cart-line__qty">
              <button data-qty="-1" aria-label="Decrease">&minus;</button>
              <input type="number" value="${item.quantity}" min="0" data-qty-input aria-label="Quantity">
              <button data-qty="1" aria-label="Increase">+</button>
            </div>
            <a class="cart-line__remove" href="#" data-remove>Remove</a>
          </div>
          <div class="cart-line__price">${money(item.final_line_price)}</div>
        </div>`).join('');
    }
    const sub = $('#CartDrawerSubtotal');
    if (sub) sub.textContent = money(cart.total_price);
    updateCartCount(cart.item_count);
  };

  const updateCartCount = (n) => {
    $$('.cart-count').forEach((el) => (el.textContent = n));
  };

  const refreshCart = () =>
    fetch('/cart.js').then((r) => r.json()).then(renderCartItems).catch(() => {});

  const changeLine = (key, qty) =>
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty }),
    }).then((r) => r.json()).then(renderCartItems);

  document.addEventListener('click', (e) => {
    const line = e.target.closest('.cart-line');
    if (!line) return;
    const key = line.dataset.key;
    if (e.target.closest('[data-remove]')) {
      e.preventDefault();
      changeLine(key, 0);
    } else if (e.target.closest('[data-qty]')) {
      const delta = +e.target.closest('[data-qty]').dataset.qty;
      const input = line.querySelector('[data-qty-input]');
      changeLine(key, Math.max(0, +input.value + delta));
    }
  });
  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-qty-input]');
    if (input) changeLine(input.closest('.cart-line').dataset.key, +input.value);
  });

  /* ---------- Add to cart ---------- */
  const toast = (msg) => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2600);
  };

  const addToCart = (id, qty = 1, btn) => {
    if (btn) btn.disabled = true;
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id, quantity: qty }] }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((e) => Promise.reject(e))))
      .then(() => refreshCart().then(openCart))
      .catch((err) => toast(err.description || 'Could not add to cart'))
      .finally(() => { if (btn) btn.disabled = false; });
  };

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-ajax-atc]');
    if (!form) return;
    e.preventDefault();
    if (form.dataset.needsSize === '1' && !form.querySelector('.pdp__size.selected')) {
      return toast('Select a size');
    }
    const id = form.querySelector('[name="id"]').value;
    const qty = +(form.querySelector('[name="quantity"]')?.value || 1);
    addToCart(+id, qty, form.querySelector('[type="submit"]'));
  });

  /* CTL quick add */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    const sel = btn.closest('.ctl__item').querySelector('select');
    addToCart(+sel.value, 1, btn);
  });

  /* ---------- Slideshow ---------- */
  $$('.slideshow').forEach((root) => {
    const slides = $$('.shero__slide', root);
    const dotsWrap = $('.shero__dots', root);
    if (slides.length < 2) return;
    let i = 0, timer;
    const interval = +(root.dataset.interval || 6000);
    const go = (n) => {
      slides[i].classList.remove('active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('active');
      $$('button', dotsWrap).forEach((d, k) => d.setAttribute('aria-current', k === i));
    };
    if (dotsWrap) {
      slides.forEach((_, k) => {
        const d = document.createElement('button');
        d.setAttribute('aria-label', `Slide ${k + 1}`);
        d.setAttribute('aria-current', k === 0);
        d.addEventListener('click', () => { go(k); restart(); });
        dotsWrap.appendChild(d);
      });
    }
    const restart = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), interval); };
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', restart);
    restart();
  });

  /* ---------- Product carousels ---------- */
  $$('.scarousel').forEach((root) => {
    const track = $('.scarousel__track', root);
    const prev = $('.scarousel__arrow--prev', root);
    const next = $('.scarousel__arrow--next', root);
    if (!track || !prev || !next) return;
    const step = () => track.clientWidth * 0.8;
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    const sync = () => {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 8;
    };
    track.addEventListener('scroll', sync, { passive: true });
    sync();
  });

  /* ---------- Search modal ---------- */
  const searchModal = $('#SearchModal');
  const searchInput = $('#SearchInput');
  $$('[data-open-search]').forEach((b) =>
    b.addEventListener('click', () => {
      searchModal.classList.add('open');
      showOverlay(true);
      document.body.classList.add('drawer-open');
      setTimeout(() => searchInput && searchInput.focus(), 250);
    })
  );
  $$('[data-close-search]').forEach((b) =>
    b.addEventListener('click', () => {
      searchModal.classList.remove('open');
      showOverlay(false);
      document.body.classList.remove('drawer-open');
    })
  );

  let searchT;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchT);
      const q = searchInput.value.trim();
      const out = $('#SearchResults');
      if (q.length < 3) { if (out) out.innerHTML = ''; return; }
      searchT = setTimeout(() => {
        fetch(`/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=4`)
          .then((r) => r.json())
          .then((d) => {
            const products = d.resources?.results?.products || [];
            if (out) {
              out.innerHTML = products.map((p) => `
                <a class="product-card" href="${p.url}">
                  <span class="product-card__media"><img src="${p.featured_image?.url || p.image || ''}" alt="${p.title}"></span>
                  <span class="product-card__info">
                    <span class="product-card__title">${p.title}</span>
                    <span class="product-card__price">${p.price}</span>
                  </span>
                </a>`).join('');
            }
          }).catch(() => {});
      }, 280);
    });
  }

  /* ---------- PDP ---------- */
  const pdp = $('[data-pdp]');
  if (pdp) {
    const variants = JSON.parse($('#PdpVariants').textContent);
    const sizeBtns = $$('.pdp__size', pdp);
    const swatches = $$('.pdp__swatch', pdp);
    const idInput = $('#PdpVariantId');
    const atc = $('#PdpAtc');
    const priceEl = $('#PdpPrice');
    let chosenSize = null;
    let chosenColor = pdp.dataset.color || null;

    const findVariant = () =>
      variants.find((v) =>
        (!chosenSize || v.options.includes(chosenSize)) &&
        (!chosenColor || v.options.includes(chosenColor))
      );

    const needsSize = !!sizeBtns.length;
    const sync = () => {
      const v = findVariant();
      if (v) {
        idInput.value = v.id;
        atc.disabled = !v.available;
        atc.textContent = !v.available ? 'Sold out' : (needsSize && !chosenSize ? 'Select a size' : 'Add to cart');
        if (priceEl) priceEl.innerHTML = v.compare_at_price > v.price
          ? `<s>${money(v.compare_at_price)}</s><span class="price-sale">${money(v.price)}</span>`
          : money(v.price);
      } else {
        atc.disabled = true;
        atc.textContent = 'Unavailable';
      }
      sizeBtns.forEach((b) => {
        const match = variants.some((v) => v.options.includes(b.dataset.value) && (!chosenColor || v.options.includes(chosenColor)) && v.available);
        b.classList.toggle('soldout', !match);
      });
    };

    sizeBtns.forEach((b) =>
      b.addEventListener('click', () => {
        sizeBtns.forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        chosenSize = b.dataset.value;
        sync();
      })
    );

    swatches.forEach((s) =>
      s.addEventListener('click', (e) => {
        e.preventDefault();
        swatches.forEach((x) => x.parentElement.classList.remove('active'));
        s.parentElement.classList.add('active');
        chosenColor = s.dataset.value;
        const label = $('#PdpColorName');
        if (label) label.textContent = chosenColor;
        sync();
        if (s.dataset.url) history.replaceState({}, '', s.dataset.url);
      })
    );

    if (needsSize) sync();

    /* tabs */
    const tabs = $$('[role="tab"]', pdp);
    const panels = $$('[role="tabpanel"]', pdp);
    tabs.forEach((t) =>
      t.addEventListener('click', () => {
        tabs.forEach((x) => x.setAttribute('aria-selected', x === t));
        panels.forEach((p) => (p.hidden = p.id !== t.getAttribute('aria-controls')));
      })
    );

    /* thumbs -> scroll to media */
    $$('.pdp__thumb', pdp).forEach((th, k) =>
      th.addEventListener('click', () => {
        const media = $$('.pdp__media', pdp)[k];
        if (media) media.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
    );
    const mediaEls = $$('.pdp__media', pdp);
    if ('IntersectionObserver' in window && mediaEls.length) {
      const io = new IntersectionObserver((ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting) {
            $$('.pdp__thumb', pdp).forEach((th) => th.classList.remove('active'));
            const th = $(`.pdp__thumb[data-index="${en.target.dataset.index}"]`, pdp);
            if (th) th.classList.add('active');
          }
        });
      }, { threshold: 0.6 });
      mediaEls.forEach((m) => io.observe(m));
    }

    /* zoom */
    const zoom = $('#ZoomModal');
    if (zoom) {
      mediaEls.forEach((m) =>
        m.addEventListener('click', () => {
          const img = m.querySelector('img');
          zoom.querySelector('img').src = img.src;
          zoom.classList.add('open');
          showOverlay(true);
        })
      );
      zoom.addEventListener('click', () => { zoom.classList.remove('open'); showOverlay(false); });
    }

    /* size guide */
    const guide = $('#SizeGuideModal');
    $$('[data-open-size-guide]').forEach((b) =>
      b.addEventListener('click', () => { guide.classList.add('open'); showOverlay(true); })
    );
    if (guide) guide.querySelector('.sd-modal__close').addEventListener('click', () => { guide.classList.remove('open'); showOverlay(false); });
  }

  /* ---------- Overlay click closes everything ---------- */
  overlay() && overlay().addEventListener('click', () => {
    closeCart();
    searchModal && searchModal.classList.remove('open');
    menuDrawer && menuDrawer.classList.remove('open');
    document.body.classList.remove('drawer-open');
    showOverlay(false);
    $$('.sd-modal.open').forEach((m) => m.classList.remove('open'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      searchModal && searchModal.classList.remove('open');
      menuDrawer && menuDrawer.classList.remove('open');
      document.body.classList.remove('drawer-open');
      showOverlay(false);
      $$('.sd-modal.open').forEach((m) => m.classList.remove('open'));
    }
  });

  /* ---------- Collection sort ---------- */
  const sortSel = $('#SortBy');
  if (sortSel) {
    sortSel.addEventListener('change', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', sortSel.value);
      window.location.href = url.toString();
    });
  }

  /* money format meta for JS formatting */
  document.addEventListener('DOMContentLoaded', refreshCart);
})();
