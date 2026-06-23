<script lang="ts">
  import { onMount } from 'svelte';

  let cart: any[] = [];
  let promoCode    = '';
  let promoApplied = false;
  let promoError   = '';
  const DISCOUNT   = 0.10; // 10% promo

  onMount(() => {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
  });

  function updateQty(id: number, delta: number) {
    cart = cart.map((i: any) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i: any) => i.qty > 0);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('cart:update'));
  }

  function removeItem(id: number) {
    cart = cart.filter((i: any) => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('cart:update'));
  }

  function applyPromo() {
    promoError = '';
    if (promoCode.toUpperCase() === 'SHOPHUB10') {
      promoApplied = true;
    } else {
      promoError = 'Invalid promo code.';
    }
  }

  $: subtotal  = cart.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  $: discount  = promoApplied ? subtotal * DISCOUNT : 0;
  $: shipping  = subtotal > 50000 ? 0 : 3000;
  $: total     = subtotal - discount + shipping;
</script>

<svelte:head>
  <title>Cart — ShopHub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <h1 class="text-3xl font-bold tracking-tight mb-10">Shopping cart</h1>

  {#if cart.length === 0}
    <div class="text-center py-32">
      <div class="w-20 h-20 rounded-full bg-primary/5 grid place-items-center mx-auto mb-6">
        <svg class="w-8 h-8 text-muted" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-primary mb-2">Your cart is empty</h2>
      <p class="text-muted mb-8">Discover thousands of premium products.</p>
      <a href="/catalog" class="btn-primary">Start shopping</a>
    </div>

  {:else}
    <div class="grid lg:grid-cols-3 gap-8 lg:gap-12">

      <!-- Items -->
      <div class="lg:col-span-2 space-y-4">
        {#each cart as item}
          <div class="card p-5 flex gap-4 animate-fade-in">
            <a href="/product/{item.id}" class="flex-shrink-0">
              <img
                src={item.image_url}
                alt={item.name}
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-primary/3"
              />
            </a>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-xs font-semibold text-accent uppercase tracking-wide mb-0.5">{item.category}</p>
                  <a href="/product/{item.id}" class="font-semibold text-primary hover:text-accent transition-colors line-clamp-2 text-sm leading-snug">{item.name}</a>
                </div>
                <button
                  on:click={() => removeItem(item.id)}
                  class="w-7 h-7 rounded-xl grid place-items-center text-muted hover:text-danger hover:bg-danger/5 transition flex-shrink-0"
                  aria-label="Remove {item.name}"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div class="flex items-center justify-between mt-4">
                <!-- Qty -->
                <div class="flex items-center h-9 rounded-xl border border-primary/10 overflow-hidden">
                  <button
                    on:click={() => updateQty(item.id, -1)}
                    class="w-9 h-full grid place-items-center hover:bg-primary/5 transition text-muted"
                    aria-label="Decrease"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>
                  </button>
                  <span class="w-8 text-center text-sm font-semibold">{item.qty}</span>
                  <button
                    on:click={() => updateQty(item.id, 1)}
                    class="w-9 h-full grid place-items-center hover:bg-primary/5 transition text-muted"
                    aria-label="Increase"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
                <p class="font-bold text-primary">₦{(item.price * item.qty).toLocaleString('en-NG')}</p>
              </div>
            </div>
          </div>
        {/each}

        <!-- Continue shopping -->
        <a href="/catalog" class="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition mt-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Continue shopping
        </a>
      </div>

      <!-- Order summary -->
      <div class="lg:col-span-1">
        <div class="card p-6 sticky top-24">
          <h2 class="font-bold text-lg mb-6">Order summary</h2>

          <!-- Promo -->
          <div class="mb-6">
            <label class="text-sm font-medium text-primary mb-2 block">Promo code</label>
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={promoCode}
                placeholder="e.g. SHOPHUB10"
                class="input text-sm flex-1"
                disabled={promoApplied}
              />
              <button
                on:click={applyPromo}
                disabled={promoApplied}
                class="btn-ghost h-11 px-4 text-sm flex-shrink-0 disabled:opacity-40"
              >
                Apply
              </button>
            </div>
            {#if promoError}
              <p class="text-xs text-danger mt-1.5">{promoError}</p>
            {/if}
            {#if promoApplied}
              <p class="text-xs text-success mt-1.5 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                10% discount applied
              </p>
            {/if}
          </div>

          <!-- Line items -->
          <div class="space-y-3 text-sm border-t border-primary/5 pt-5 mb-5">
            <div class="flex justify-between text-muted">
              <span>Subtotal</span>
              <span class="text-primary font-medium">₦{subtotal.toLocaleString('en-NG')}</span>
            </div>
            {#if discount > 0}
              <div class="flex justify-between text-success">
                <span>Discount (10%)</span>
                <span>-₦{discount.toLocaleString('en-NG')}</span>
              </div>
            {/if}
            <div class="flex justify-between text-muted">
              <span>Shipping</span>
              <span class="text-primary font-medium">{shipping === 0 ? 'Free' : `₦${shipping.toLocaleString('en-NG')}`}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-primary border-t border-primary/5 pt-4 mt-2">
              <span>Total</span>
              <span>₦{total.toLocaleString('en-NG')}</span>
            </div>
          </div>

          <button class="btn-primary w-full gap-2 h-12 text-base">
            Checkout
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>

          <div class="flex items-center justify-center gap-2 mt-4 text-xs text-muted">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Secured by SSL encryption
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
