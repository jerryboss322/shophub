<script lang="ts">
  import { onMount } from 'svelte';

  let wishlistProducts: any[] = [];
  let loading = true;

  onMount(async () => {
    const ids = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (ids.length) {
      const all = await (await fetch('/api/products')).json();
      wishlistProducts = all.filter((p: any) => ids.includes(p.id));
    }
    loading = false;
  });

  function removeFromWishlist(id: number) {
    const wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const idx  = wish.indexOf(id);
    if (idx > -1) wish.splice(idx, 1);
    localStorage.setItem('wishlist', JSON.stringify(wish));
    wishlistProducts = wishlistProducts.filter(p => p.id !== id);
    window.dispatchEvent(new Event('storage'));
  }

  function addToCart(product: any) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find((i: any) => i.id === product.id);
    if (item) item.qty += 1;
    else cart.push({ ...product, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('cart:update'));
  }
</script>

<svelte:head><title>Wishlist — ShopHub</title></svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <h1 class="text-section font-bold tracking-tight mb-2">Wishlist</h1>
  {#if !loading}<p class="text-muted text-sm mb-8">{wishlistProducts.length} saved item{wishlistProducts.length !== 1 ? 's' : ''}</p>{/if}

  {#if loading}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      {#each Array(4) as _}
        <div class="space-y-3">
          <div class="aspect-[4/5] rounded-3xl bg-primary/5 animate-pulse"></div>
          <div class="h-4 bg-primary/5 rounded-full animate-pulse"></div>
        </div>
      {/each}
    </div>
  {:else if wishlistProducts.length === 0}
    <div class="text-center py-32">
      <div class="w-20 h-20 rounded-full bg-primary/5 grid place-items-center mx-auto mb-6">
        <svg class="w-8 h-8 text-muted" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </div>
      <h2 class="text-xl font-bold mb-2">Your wishlist is empty</h2>
      <p class="text-muted text-sm mb-8">Save items you love while you browse.</p>
      <a href="/catalog" class="btn-primary">Browse products</a>
    </div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      {#each wishlistProducts as product}
        <div class="group relative flex flex-col animate-fade-up">
          <button
            on:click={() => removeFromWishlist(product.id)}
            class="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-surface/90 grid place-items-center shadow-card"
            aria-label="Remove from wishlist"
          >
            <svg class="w-3.5 h-3.5 text-danger" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
          <a href="/product/{product.id}" class="block">
            <div class="aspect-[4/5] overflow-hidden rounded-3xl bg-primary/3 mb-3">
              <img src={product.image_url} alt={product.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
            </div>
            <p class="text-[11px] font-bold text-accent uppercase tracking-wide mb-1">{product.category}</p>
            <h3 class="font-semibold text-sm text-primary line-clamp-2 mb-2">{product.name}</h3>
            <p class="font-bold">₦{product.price.toLocaleString('en-NG')}</p>
          </a>
          <button
            on:click={() => addToCart(product)}
            class="mt-3 w-full h-10 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-accent transition-all duration-150"
          >
            Add to cart
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
