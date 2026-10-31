/* Sidra native Shopify interactions. All prices, stock and cart state come from Shopify. */
(() => {
  'use strict';
  const root = window.SidraTheme?.routes?.root || window.Shopify?.routes?.root || '/';
  const live = document.createElement('p');
  live.className = 'sidra-live';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  document.body.append(live);
  const notify = (message) => { live.textContent = message; };
  const money = (cents, currency = window.Shopify?.currency?.active || window.SidraTheme?.currency || 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
  const request = async (path, body) => {
    const response = await fetch(root + path, {
      method: body ? 'POST' : 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let data;
    try { data = await response.json(); } catch { throw new Error('تعذّر قراءة استجابة المتجر. حاولي مرة أخرى.'); }
    if (!response.ok) {
      // Server messages may be in another language; don't leak English into the Arabic UI.
      if (response.status === 422) throw new Error('الكمية أو الخيار المطلوب غير متاح الآن. راجعي الكمية وحاولي مرة أخرى.');
      throw new Error('تعذّر تحديث السلة. تحققي من الاتصال وحاولي مرة أخرى.');
    }
    return data;
  };
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const drawer = document.getElementById('cart-drawer');
  const updateCount = (cart) => {
    document.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = String(cart.item_count);
      node.classList.toggle('is-empty', cart.item_count === 0);
      node.setAttribute('aria-label', `${cart.item_count} منتج في السلة`);
    });
  };
  let cartBusy = false;
  const renderCart = (cart) => {
    updateCount(cart);
    const container = document.querySelector('[data-cart-content]');
    if (!container) return;
    container.replaceChildren();
    const subtotalValue = document.querySelector('[data-cart-subtotal]');
    if (subtotalValue) subtotalValue.textContent = money(cart.total_price, cart.currency);
    const checkoutButton = drawer?.querySelector('[name="checkout"]');
    if (checkoutButton) checkoutButton.disabled = cart.item_count === 0;
    if (!cart.items.length) {
      container.append(element('p', 'سلتكِ بانتظار اختياراتكِ الجميلة.', 'empty-state'));
      return;
    }
    cart.items.forEach((item) => {
      const row = element('article', undefined, 'cart-line');
      if (item.image) {
        const img = element('img');
        img.src = item.image;
        img.alt = item.product_title;
        img.width = 80; img.height = 96;
        img.loading = 'lazy';
        img.className = 'cart-line__img';
        row.append(img);
      }
      const body = element('div', undefined, 'cart-line__info');
      const link = element('a', item.product_title, 'cart-line__title');
      link.href = item.url;
      body.append(link);
      if (item.variant_title && item.variant_title !== 'Default Title') body.append(element('p', item.variant_title, 'meta'));
      body.append(element('p', money(item.final_line_price, cart.currency), 'price'));
      const controls = element('div', undefined, 'cart-item-controls');
      const input = element('input');
      input.type = 'number'; input.min = '1'; input.value = String(item.quantity);
      input.setAttribute('aria-label', `كمية ${item.product_title}`);
      input.addEventListener('change', () => {
        const quantity = Number(input.value);
        if (!Number.isInteger(quantity) || quantity < 1) { input.value = String(item.quantity); return; }
        changeQuantity(item.key, quantity);
      });
      const remove = element('button', 'إزالة', 'cart-remove btn btn--ghost btn--sm');
      remove.type = 'button';
      remove.setAttribute('aria-label', `إزالة ${item.product_title}`);
      remove.addEventListener('click', () => changeQuantity(item.key, 0));
      controls.append(input, remove);
      body.append(controls);
      row.append(body);
      container.append(row);
    });
    cart.cart_level_discount_applications?.forEach((discount) => {
      container.append(element('p', `${discount.title}: −${money(discount.total_allocated_amount, cart.currency)}`, 'discount'));
    });
  };
  async function changeQuantity(key, quantity) {
    if (cartBusy) return;
    cartBusy = true;
    drawer?.setAttribute('aria-busy', 'true');
    const controls = drawer?.querySelectorAll('input, button, a');
    controls?.forEach((node) => {
      if (node instanceof HTMLButtonElement || node instanceof HTMLInputElement) node.disabled = true;
    });
    try {
      const cart = await request('cart/change.js', { id: key, quantity });
      renderCart(cart);
      notify(quantity === 0 ? 'تمت إزالة المنتج من السلة.' : 'تم تحديث الكمية.');
    } catch (error) {
      notify(error.message);
      const container = document.querySelector('[data-cart-content]');
      container?.prepend(element('p', error.message, 'form-msg form-msg--error'));
    } finally {
      cartBusy = false;
      drawer?.removeAttribute('aria-busy');
      controls?.forEach((node) => {
        if (node instanceof HTMLButtonElement || node instanceof HTMLInputElement) node.disabled = false;
      });
    }
  }
  async function openCart() {
    if (!drawer) { window.location.href = root + 'cart'; return; }
    if (!drawer.open) drawer.showModal();
    const container = document.querySelector('[data-cart-content]');
    container?.replaceChildren(element('p', 'جارٍ تحميل السلة…'));
    try { renderCart(await request('cart.js')); }
    catch (error) {
      container?.replaceChildren(element('p', error.message, 'form-msg form-msg--error'));
      notify(error.message);
    }
  }
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest('[data-open-cart], [data-open-dialog], [data-toggle-filters], [data-facets-toggle], [data-qty-step], [data-media-thumb]');
    if (!target) return;
    if (target.hasAttribute('data-open-cart')) { event.preventDefault(); openCart(); }
    if (target.hasAttribute('data-open-dialog')) {
      const dialog = document.getElementById(target.dataset.openDialog);
      if (dialog instanceof HTMLDialogElement) { event.preventDefault(); dialog.showModal(); }
    }
    if (target.hasAttribute('data-toggle-filters')) {
      const panel = document.getElementById(target.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !panel.hidden;
        target.setAttribute('aria-expanded', String(!panel.hidden));
      }
    }
    if (target.hasAttribute('data-facets-toggle')) {
      const panel = document.querySelector('[data-facets-panel]');
      if (panel) {
        const isOpen = panel.classList.toggle('is-open');
        document.querySelectorAll('[data-facets-toggle]').forEach((button) => button.setAttribute('aria-expanded', String(isOpen)));
        if (isOpen) panel.querySelector('button, input')?.focus();
      }
    }
    if (target.hasAttribute('data-qty-step')) {
      const input = target.closest('.qty')?.querySelector('input');
      if (input) {
        const minimum = Number(input.min || 1);
        const maximum = input.max ? Number(input.max) : Infinity;
        input.value = String(Math.min(maximum, Math.max(minimum, Number(input.value || minimum) + Number(target.dataset.qtyStep))));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    if (target.hasAttribute('data-media-thumb')) {
      const image = document.querySelector('[data-product-main-image]');
      if (image) {
        event.preventDefault();
        image.src = target.href;
        image.removeAttribute('srcset');
        image.alt = target.querySelector('img')?.alt || image.alt;
      }
    }
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
    dialog.addEventListener('toggle', () => { document.body.style.overflow = dialog.open ? 'hidden' : ''; });
  });
  const addingForms = new WeakSet();
  document.addEventListener('submit', async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.hasAttribute('data-product-form')) return;
      // Shopify accelerated checkout owns its flow; don't intercept it.
      if (event.submitter && !event.submitter.hasAttribute('data-add-to-cart')) return;
      event.preventDefault();
      if (addingForms.has(form) || cartBusy) return;
      const data = new FormData(form);
      const id = Number(data.get('id'));
      const quantity = Number(data.get('quantity') || 1);
      if (!id || !Number.isInteger(quantity) || quantity < 1) { notify('اختاري المنتج والكمية أولًا.'); return; }
      const submit = form.querySelector('[data-add-to-cart]') || form.querySelector('[type="submit"]');
      const label = submit?.textContent;
      const errorNode = form.querySelector('[data-product-error]');
      if (errorNode) { errorNode.textContent = ''; errorNode.hidden = true; }
      addingForms.add(form);
      if (submit) { submit.disabled = true; submit.textContent = 'جارٍ الإضافة…'; }
      try {
        await request('cart/add.js', { items: [{ id, quantity }] });
        notify('تمت إضافة المنتج إلى سلتكِ.');
        await openCart();
      } catch (error) {
        if (errorNode) { errorNode.textContent = error.message; errorNode.hidden = false; }
        notify(error.message);
      } finally {
        addingForms.delete(form);
        if (submit) { submit.disabled = false; submit.textContent = label; }
      }
    });
  document.querySelectorAll('[data-product-form]').forEach((form) => {
    const productScope = form.closest('.product__info');
    const variantsNode = productScope?.querySelector('[data-variant-json]');
    if (!variantsNode) return;
    let variants;
    try { variants = JSON.parse(variantsNode.textContent); } catch { return; }
    form.querySelector('[name="id"]')?.addEventListener('change', (event) => {
      const variant = variants.find((value) => String(value.id) === event.target.value);
      if (!variant) return;
      const price = productScope.querySelector('[data-product-price]');
      if (price) price.textContent = money(variant.price);
      const compare = productScope.querySelector('[data-product-compare]');
      if (compare) {
        compare.hidden = !(variant.compare_at_price > variant.price);
        compare.textContent = variant.compare_at_price > variant.price ? money(variant.compare_at_price) : '';
      }
      const submit = form.querySelector('[data-add-to-cart]');
      if (submit) {
        submit.disabled = !variant.available;
        submit.textContent = variant.available ? 'أضيفي إلى السلة' : 'غير متوفر';
      }
      const stock = productScope.querySelector('[data-stock-label]');
      if (stock) {
        stock.textContent = variant.available ? 'متوفر' : 'غير متوفر حاليًا';
        stock.classList.toggle('stock--out', !variant.available);
      }
      const url = new URL(window.location.href);
      url.searchParams.set('variant', String(variant.id));
      history.replaceState(null, '', url);
      if (variant.featured_image?.src) {
        const image = document.querySelector('[data-product-main-image]');
        if (image) {
          image.src = variant.featured_image.src;
          image.removeAttribute('srcset');
        }
      }
    });
  });
  document.querySelectorAll('[data-product-thumbnail]').forEach((button) => {
    button.addEventListener('click', () => {
      const image = document.querySelector('[data-main-product-image]');
      if (image && button.dataset.imageSrc) {
        image.src = button.dataset.imageSrc;
        image.removeAttribute('srcset');
        image.alt = button.dataset.imageAlt || image.alt;
      }
    });
  });
  document.querySelectorAll('[data-sort-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', select.value);
      url.searchParams.delete('page');
      window.location.assign(url);
    });
  });
  // Native section rendering uses Shopify's own recommendation engine. No
  // fabricated products or server-side catalog mirrors are introduced.
  const recommendations = document.querySelector('[data-recommendations][data-url]');
  if (recommendations) {
    const loadRecommendations = async () => {
      try {
        const response = await fetch(recommendations.dataset.url, { credentials: 'same-origin' });
        if (!response.ok) throw new Error('تعذّر تحميل المنتجات المقترحة.');
        const documentFragment = new DOMParser().parseFromString(await response.text(), 'text/html');
        const replacement = documentFragment.querySelector('[data-recommendations]');
        if (replacement?.querySelector('.product-grid')) recommendations.replaceChildren(...replacement.childNodes);
        else recommendations.hidden = true;
      } catch {
        recommendations.replaceChildren(element('p', 'المنتجات المقترحة غير متاحة الآن.', 'container meta'));
      }
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); loadRecommendations(); }
      }, { rootMargin: '200px' });
      observer.observe(recommendations);
    } else loadRecommendations();
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelector('[data-facets-panel]')?.classList.remove('is-open');
      document.querySelectorAll('[data-facets-toggle]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    }
  });
})();
