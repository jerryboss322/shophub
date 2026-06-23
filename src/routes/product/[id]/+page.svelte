<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let product: any = null;
  let related: any[] = [];
  let loading = true;
  let qty = 1;
  let selectedImg = 0;
  let toastMsg = '';
  let toastShow = false;
  let toastTimer: ReturnType<typeof setTimeout>;

  // Multiple images via Unsplash variants
  $: images = product ? [
    product.image_url,
    product.image_url?.replace('w=400', 'w=401'),
    product.image_url?.replace('w=400', 'w=402'),
  ] : [];

  onMount(async () => {
    const id = $page.params.id;
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      product = await res.json();
      document.title = `${product.name} — ShopHub`;
      // Load related
      const all = await (await fetch('/api/products')).json();
      related = all.filter((p: any) => p.category === product.category && p.id !== product.id).slice(0, 4);
    }
    loading = false;
  });

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find((i: any) => i.id === product.id);
    if (item) item.qty += qty;
    else cart.push({ ...product, qty });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('cart:update'));
    showToast('Added to cart');
  }

  function toggleWishlist() {
    const wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const idx  = wish.indexOf(product.id);
    if (idx > -1) { wish.splice(idx, 1); showToast('Removed from wishlist'); }
    else { wish.push(product.id); showToast('Added to wishlist'); }
    localStorage.setItem('wishlist', JSON.stringify(wish));
    window.dispatchEvent(new Event('storage'));
  }

  function isWishlisted() {
    if (typeof window === 'undefined') return false;
    return JSON.parse(localStorage.getItem('wishlist') || '[]').includes(product?.id);
  }

  function showToast(msg: string) {
    toastMsg  = msg;
    toastShow = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastShow = false), 2500);
  }

  // Mock reviews
  const REVIEWS = [
    { name: 'Amara O.', rating: 5, text: 'Excellent quality. Delivery was fast and packaging was great.', date: '2 weeks ago' },
    { name: 'Chidi N.', rating: 4, text: 'Very good product. Works exactly as described. Would recommend.', date: '1 month ago' },
    { name: 'Fatima B.', rating: 5, text: 'Authentic product. Happy with my purchase from ShopHub!', date: '1 month ago' },
  ];
</script>

<svelte:head>
  {#if product}
    <title>{product.name} — ShopHub</title>
    <meta name="description" content={product.description || `Buy ${product.name} at ShopHub Nigeria.`} />
    <meta property="og:title" content={product.name} />
    <meta property="og:image" content={product.image_url} />
    <script type="application/ld+json">{JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.image_url,
      "description": product.description,
      "offers": {
        "@type": "Offer",
        "price": product.price / 100,
        "priceCurrency": "NGN",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    })}</script>
  {/if}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-muted mb-8">
    <a href="/" class="hover:text-primary transition-colors">Home</a>
    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
    <a href="/catalog" class="hover:text-primary transition-colors">Shop</a>
    {#if product}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      <a href="/catalog?category={encodeURIComponent(product.category)}" class="hover:text-primary transition-colors">{product.category}</a>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      <span class="text-primary font-medium line-clamp-1">{product.name}</span>
    {/if}
  </nav>

  {#if loading}
    <!-- Skeleton -->
    <div class="grid md:grid-cols-2 gap-12">
      <div class="space-y-3">
        <div class="aspect-square rounded-3xl bg-primary/5 animate-pulse"></div>
        <div class="grid grid-cols-3 gap-2">
          {#each [1,2,3] as _}
            <div class="aspect-square rounded-xl bg-primary/5 animate-pulse"></div>
          {/each}
        </div>
      </div>
      <div class="space-y-4 py-4">
        <div class="h-4 bg-primary/5 rounded-full w-24 animate-pulse"></div>
        <div class="h-10 bg-primary/5 rounded-full animate-pulse"></div>
        <div class="h-8 bg-primary/5 rounded-full w-32 animate-pulse"></div>
        <div class="h-20 bg-primary/5 rounded-xl animate-pulse"></div>
      </div>
    </div>

  {:else if !product}
    <div class="text-center py-32">
      <h1 class="text-2xl font-bold mb-4">Product not found</h1>
      <a href="/" class="btn-primary">Back to shop</a>
    </div>

  {:else}
    <div class="grid md:grid-cols-2 gap-10 lg:gap-16 animate-fade-in">

      <!-- Gallery -->
      <div class="space-y-3">
        <div class="aspect-square rounded-3xl overflow-hidden bg-primary/3 group cursor-zoom-in">
          <img
            src={images[selectedImg]}
            alt={product.name}
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <!-- Thumbnails -->
        <div class="grid grid-cols-3 gap-2">
          {#each images as img, i}
            <button
              on:click={() => selectedImg = i}
              class="aspect-square rounded-xl overflow-hidden border-2 transition-all {selectedImg===i ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}"
              aria-label="View image {i+1}"
            >
              <img src={img} alt="" class="w-full h-full object-cover"/>
            </button>
          {/each}
        </div>
      </div>

      <!-- Product info -->
      <div class="py-2">
        <p class="text-xs font-semibold text-accent uppercase tracking-widest mb-3">{product.category}</p>
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-4 leading-tight">{product.name}</h1>

        <!-- Rating -->
        <div class="flex items-center gap-3 mb-5">
          <div class="flex items-center gap-0.5">
            {#each [1,2,3,4,5] as s}
              <svg class="w-4 h-4 {s<=4?'text-accent':'text-primary/15'}" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            {/each}
          </div>
          <span class="text-sm text-muted">4.0 · {REVIEWS.length} reviews</span>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-3 mb-6">
          <span class="text-3xl font-bold text-primary">₦{product.price.toLocaleString('en-NG')}</span>
          <span class="text-base text-muted line-through">₦{Math.round(product.price * 1.15).toLocaleString('en-NG')}</span>
          <span class="badge bg-success/10 text-success text-xs">Save 13%</span>
        </div>

        <!-- Description -->
        <p class="text-muted leading-relaxed mb-8">{product.description || 'Premium quality product. Fast delivery available across Nigeria.'}</p>

        <!-- Stock indicator -->
        <div class="flex items-center gap-2 text-sm mb-6">
          <div class="w-2 h-2 rounded-full {product.stock > 5 ? 'bg-success' : product.stock > 0 ? 'bg-accent' : 'bg-danger'}"></div>
          <span class="text-muted font-medium">
            {product.stock > 5 ? 'In stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}
          </span>
        </div>

        <!-- Qty + Add to cart -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <!-- Qty -->
          <div class="flex items-center h-11 rounded-2xl border border-primary/15 overflow-hidden">
            <button
              on:click={() => qty = Math.max(1, qty - 1)}
              class="w-11 h-full grid place-items-center hover:bg-primary/5 transition"
              aria-label="Decrease quantity"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>
            </button>
            <span class="w-10 text-center text-sm font-semibold">{qty}</span>
            <button
              on:click={() => qty = Math.min(product.stock, qty + 1)}
              class="w-11 h-full grid place-items-center hover:bg-primary/5 transition"
              aria-label="Increase quantity"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>

          <button
            on:click={addToCart}
            disabled={product.stock === 0}
            class="btn-primary flex-1 gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>

          <button
            on:click={toggleWishlist}
            class="w-11 h-11 rounded-2xl border border-primary/15 grid place-items-center hover:bg-danger/5 hover:border-danger/20 transition"
            aria-label="Add to wishlist"
          >
            <svg class="w-5 h-5 transition-colors" class:text-danger={isWishlisted()} class:text-muted={!isWishlisted()} fill={isWishlisted() ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>

        <!-- Trust row -->
        <div class="pt-6 border-t border-primary/5 grid grid-cols-3 gap-4 text-center">
          {#each [
            { icon:'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12h12L19 8', label:'Free delivery', sub:'Over ₦50k' },
            { icon:'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', label:'Easy returns', sub:'14 days' },
            { icon:'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', label:'Authentic', sub:'100% genuine' }
          ] as t}
            <div>
              <div class="w-8 h-8 rounded-xl bg-accent/10 grid place-items-center mx-auto mb-1.5">
                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path d={t.icon}/></svg>
              </div>
              <p class="text-xs font-semibold text-primary">{t.label}</p>
              <p class="text-xs text-muted">{t.sub}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Reviews -->
    <div class="mt-16 pt-12 border-t border-primary/5">
      <h2 class="text-2xl font-bold tracking-tight mb-8">Customer reviews</h2>
      <div class="grid md:grid-cols-3 gap-5">
        {#each REVIEWS as r}
          <div class="card p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-accent/15 text-accent grid place-items-center text-sm font-bold flex-shrink-0">
                  {r.name[0]}
                </div>
                <div>
                  <p class="font-semibold text-sm">{r.name}</p>
                  <p class="text-xs text-muted">{r.date}</p>
                </div>
              </div>
              <div class="flex">
                {#each [1,2,3,4,5] as s}
                  <svg class="w-3.5 h-3.5 {s<=r.rating?'text-accent':'text-primary/15'}" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                {/each}
              </div>
            </div>
            <p class="text-sm text-muted leading-relaxed">{r.text}</p>
          </div>
        {/each}
      </div>
    </div>

    <!-- Related products -->
    {#if related.length}
      <div class="mt-16 pt-12 border-t border-primary/5">
        <h2 class="text-2xl font-bold tracking-tight mb-8">You may also like</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
          {#each related as p}
            <div class="group">
              <a href="/product/{p.id}" class="block">
                <div class="aspect-[4/5] rounded-3xl overflow-hidden bg-primary/3 mb-3">
                  <img src={p.image_url} alt={p.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
                </div>
                <h3 class="font-semibold text-sm text-primary line-clamp-1 mb-1">{p.name}</h3>
                <p class="font-bold text-sm">₦{p.price.toLocaleString('en-NG')}</p>
              </a>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<!-- Toast -->
{#if toastShow}
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-primary text-white text-sm font-medium shadow-card-hover flex items-center gap-2 animate-fade-up"
    role="status"
    aria-live="polite"
  >
    <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
    {toastMsg}
  </div>
{/if}
