<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let allProducts: any[] = [];
  let loading = true;
  let searchQ = '';
  let selectedCategory = '';
  let sortBy = 'newest';
  let currentPage = 1;
  const PER_PAGE = 12;

  const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty'];
  const SORT_OPTIONS = [
    { value: 'newest',    label: 'Newest first' },
    { value: 'price-asc', label: 'Price: low to high' },
    { value: 'price-desc',label: 'Price: high to low' },
  ];

  onMount(async () => {
    const params      = new URLSearchParams($page.url.search);
    searchQ           = params.get('q') ?? '';
    selectedCategory  = params.get('category') ?? '';
    sortBy            = params.get('sort') ?? 'newest';
    const res         = await fetch('/api/products');
    allProducts       = await res.json();
    loading           = false;
  });

  function addToCart(product: any) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find((i: any) => i.id === product.id);
    if (item) item.qty += 1;
    else cart.push({ ...product, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('cart:update'));
    showToast(`${product.name} added to cart`);
  }

  function toggleWishlist(product: any) {
    const wish = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const idx = wish.indexOf(product.id);
    if (idx > -1) wish.splice(idx, 1);
    else wish.push(product.id);
    localStorage.setItem('wishlist', JSON.stringify(wish));
    window.dispatchEvent(new Event('storage'));
  }

  function isWishlisted(id: number) {
    if (typeof window === 'undefined') return false;
    return JSON.parse(localStorage.getItem('wishlist') || '[]').includes(id);
  }

  let toastMsg = '', toastShow = false;
  let toastTimer: ReturnType<typeof setTimeout>;
  function showToast(msg: string) {
    toastMsg = msg; toastShow = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastShow = false), 2500);
  }

  $: filtered = allProducts
    .filter(p => {
      const matchCat = !selectedCategory || p.category === selectedCategory;
      const matchQ   = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase());
      return matchCat && matchQ;
    })
    .sort((a, b) => sortBy === 'price-asc' ? a.price - b.price : sortBy === 'price-desc' ? b.price - a.price : b.id - a.id);

  $: totalPages = Math.ceil(filtered.length / PER_PAGE);
  $: paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  $: searchQ, selectedCategory, sortBy, (() => { currentPage = 1; })();
</script>

<svelte:head>
  <title>{selectedCategory ? selectedCategory + ' — ' : ''}Shop All — ShopHub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <div class="mb-8">
    <h1 class="text-section font-bold tracking-tight mb-1">{selectedCategory || 'All products'}</h1>
    {#if !loading}<p class="text-muted text-sm">{filtered.length} products</p>{/if}
  </div>

  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Sidebar -->
    <aside class="lg:w-56 flex-shrink-0">
      <div class="card p-5 space-y-6 sticky top-24">
        <div>
          <label class="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">Search</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="search" bind:value={searchQ} placeholder="Search..." class="input pl-9 text-sm"/>
          </div>
        </div>

        <div>
          <label class="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">Category</label>
          <div class="space-y-1">
            <button on:click={() => selectedCategory = ''} class="w-full text-left px-3 py-2 rounded-xl text-sm transition font-medium {!selectedCategory ? 'bg-primary text-white' : 'text-muted hover:bg-primary/5 hover:text-primary'}">All</button>
            {#each CATEGORIES as cat}
              <button on:click={() => selectedCategory = cat} class="w-full text-left px-3 py-2 rounded-xl text-sm transition {selectedCategory===cat ? 'bg-primary text-white font-medium' : 'text-muted hover:bg-primary/5 hover:text-primary'}">{cat}</button>
            {/each}
          </div>
        </div>

        <div>
          <label class="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">Sort by</label>
          <select bind:value={sortBy} class="input text-sm bg-bg">
            {#each SORT_OPTIONS as opt}<option value={opt.value}>{opt.label}</option>{/each}
          </select>
        </div>

        {#if selectedCategory || searchQ}
          <button on:click={() => { selectedCategory = ''; searchQ = ''; }} class="w-full text-sm text-danger font-medium py-2 hover:bg-danger/5 rounded-xl transition">Clear filters</button>
        {/if}
      </div>
    </aside>

    <!-- Grid -->
    <div class="flex-1">
      {#if loading}
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {#each Array(9) as _}<div class="space-y-3"><div class="aspect-[4/5] rounded-3xl bg-primary/5 animate-pulse"></div><div class="h-3 bg-primary/5 rounded-full w-2/3 animate-pulse"></div><div class="h-4 bg-primary/5 rounded-full animate-pulse"></div></div>{/each}
        </div>
      {:else if paginated.length === 0}
        <div class="text-center py-24">
          <h2 class="font-bold text-lg mb-2">No products found</h2>
          <p class="text-muted text-sm">Try adjusting your filters.</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {#each paginated as product, i}
            <div class="group relative flex flex-col animate-fade-up" style="animation-delay:{(i%6)*50}ms">
              <button on:click={() => toggleWishlist(product)} class="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-surface/90 grid place-items-center shadow-card opacity-0 group-hover:opacity-100 transition" aria-label="Wishlist">
                <svg class="w-3.5 h-3.5" class:text-danger={isWishlisted(product.id)} class:text-muted={!isWishlisted(product.id)} fill={isWishlisted(product.id)?'currentColor':'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </button>
              <a href="/product/{product.id}" class="block">
                <div class="aspect-[4/5] overflow-hidden rounded-3xl bg-primary/3 mb-3">
                  <img src={product.image_url} alt={product.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
                </div>
                <p class="text-[11px] font-bold text-accent uppercase tracking-wide mb-1">{product.category}</p>
                <h3 class="font-semibold text-sm text-primary line-clamp-2 mb-2 group-hover:text-accent transition-colors">{product.name}</h3>
                <p class="font-bold text-primary text-sm">₦{product.price.toLocaleString('en-NG')}</p>
              </a>
              <button on:click={() => addToCart(product)} class="mt-2 w-full h-9 rounded-2xl bg-primary text-white text-xs font-semibold hover:bg-accent active:scale-[0.98] transition-all duration-150 opacity-0 group-hover:opacity-100">Add to cart</button>
            </div>
          {/each}
        </div>

        {#if totalPages > 1}
          <div class="flex items-center justify-center gap-2 mt-12">
            <button on:click={() => currentPage = Math.max(1, currentPage - 1)} disabled={currentPage === 1} class="w-9 h-9 rounded-xl border border-primary/10 grid place-items-center text-muted hover:bg-primary/5 transition disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>
            {#each Array(totalPages) as _, i}
              <button on:click={() => currentPage = i+1} class="w-9 h-9 rounded-xl text-sm font-semibold transition {currentPage===i+1?'bg-primary text-white':'border border-primary/10 text-muted hover:bg-primary/5'}">{i+1}</button>
            {/each}
            <button on:click={() => currentPage = Math.min(totalPages, currentPage + 1)} disabled={currentPage === totalPages} class="w-9 h-9 rounded-xl border border-primary/10 grid place-items-center text-muted hover:bg-primary/5 transition disabled:opacity-30"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

{#if toastShow}
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-primary text-white text-sm font-medium shadow-card-hover flex items-center gap-2 animate-fade-up" role="status" aria-live="polite">
    <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
    {toastMsg}
  </div>
{/if}
