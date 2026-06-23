<script lang="ts">
  import { onMount } from 'svelte';

  let products: any[]  = [];
  let loading          = true;
  let email            = '';
  let newsletterSent   = false;

  const BENEFITS = [
    { icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12h12L19 8', title: 'Free Delivery', desc: 'On orders above ₦50,000 across Nigeria.' },
    { icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', title: 'Authentic Products', desc: 'Every product is 100% genuine.' },
    { icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', title: 'Easy Returns', desc: '14-day hassle-free return policy.' },
    { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: '24/7 Support', desc: 'Always here when you need us.' },
  ];

  const CATEGORIES_FEATURED = [
    { name: 'Electronics', img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80', count: 48 },
    { name: 'Fashion',     img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80', count: 124 },
    { name: 'Home',        img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', count: 67 },
    { name: 'Beauty',      img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', count: 89 },
  ];

  onMount(async () => {
    const res = await fetch('/api/products');
    products  = await res.json();
    loading   = false;
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
    const idx  = wish.indexOf(product.id);
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
    toastTimer = setTimeout(() => { toastShow = false; }, 2500);
  }

  function handleNewsletter(e: Event) {
    e.preventDefault();
    if (email.trim()) newsletterSent = true;
  }

  $: trending = products.slice(0, 4);
  $: bestSell = products.slice(4, 8);
  $: newArr   = products.slice(8, 12);
</script>

<svelte:head>
  <title>ShopHub — Premium Shopping in Nigeria</title>
</svelte:head>

<!-- HERO -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 lg:pt-24 lg:pb-16">
  <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
    <div class="animate-fade-up">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-6 tracking-wide">
        <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft"></span>
        New arrivals every week
      </div>
      <h1 class="text-[2.75rem] sm:text-[3.5rem] lg:text-[4.25rem] font-bold tracking-[-0.03em] leading-[1.07] text-primary mb-6 text-balance">
        Shop smarter.<br/>Live&nbsp;<span class="text-accent">better.</span>
      </h1>
      <p class="text-lg text-muted leading-relaxed mb-8 max-w-md">
        Premium products curated for modern Nigerian living — electronics, fashion, home essentials, and more.
      </p>
      <div class="flex flex-wrap items-center gap-4 mb-10">
        {#each ['10,000+ customers', 'Same-day Lagos delivery', '100% authentic'] as badge}
          <div class="flex items-center gap-1.5 text-sm text-muted">
            <svg class="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            {badge}
          </div>
        {/each}
      </div>
      <div class="flex flex-wrap gap-3">
        <a href="/catalog" class="btn-primary gap-2">
          Shop now
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/catalog?sort=discount" class="btn-ghost">View deals</a>
      </div>
    </div>

    <div class="relative animate-fade-up" style="animation-delay:.12s">
      <div class="relative rounded-4xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-primary/5 to-accent/10 max-w-md mx-auto lg:max-w-none">
        {#if products[0]}
          <img src={products[0].image_url} alt={products[0].name} class="w-full h-full object-cover" loading="eager"/>
          <div class="absolute bottom-6 left-6 right-6 bg-surface/95 backdrop-blur-sm rounded-2xl p-4 shadow-card-hover">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-muted mb-0.5 font-medium">{products[0].category}</p>
                <p class="font-semibold text-primary text-sm">{products[0].name}</p>
                <p class="text-accent font-bold mt-1">₦{products[0].price.toLocaleString('en-NG')}</p>
              </div>
              <button on:click={() => addToCart(products[0])} class="w-10 h-10 rounded-2xl bg-primary grid place-items-center text-white hover:bg-accent transition-colors" aria-label="Add to cart">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
          </div>
        {:else}
          <div class="w-full h-full bg-gradient-to-br from-primary/5 to-accent/5"></div>
        {/if}
      </div>
      <div class="absolute -top-12 -right-12 w-64 h-64 bg-accent/8 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  </div>
</section>

<!-- CATEGORIES -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div class="flex items-end justify-between mb-8">
    <div>
      <p class="text-xs font-semibold text-accent uppercase tracking-widest mb-2">Browse</p>
      <h2 class="text-section font-bold tracking-tight">Categories</h2>
    </div>
    <a href="/catalog" class="nav-link flex items-center gap-1.5 font-medium">All products <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
  </div>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#each CATEGORIES_FEATURED as cat}
      <a href="/catalog?category={encodeURIComponent(cat.name)}" class="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-primary/5">
        <img src={cat.img} alt={cat.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
        <div class="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-5">
          <p class="font-bold text-white text-lg leading-tight">{cat.name}</p>
          <p class="text-white/70 text-sm mt-0.5">{cat.count} products</p>
        </div>
      </a>
    {/each}
  </div>
</section>

<!-- TRENDING -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex items-end justify-between mb-8">
    <div>
      <p class="text-xs font-semibold text-accent uppercase tracking-widest mb-2">Trending now</p>
      <h2 class="text-section font-bold tracking-tight">Most popular</h2>
    </div>
    <a href="/catalog" class="nav-link flex items-center gap-1.5 font-medium">View all <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
  </div>

  {#if loading}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      {#each Array(4) as _}
        <div class="space-y-3">
          <div class="aspect-[4/5] rounded-3xl bg-primary/5 animate-pulse"></div>
          <div class="h-3 bg-primary/5 rounded-full w-2/3 animate-pulse"></div>
          <div class="h-4 bg-primary/5 rounded-full animate-pulse"></div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      {#each trending as product, i}
        <div class="group relative flex flex-col" style="animation-delay:{i*60}ms">
          <button on:click={() => toggleWishlist(product)} class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm grid place-items-center shadow-card opacity-0 group-hover:opacity-100 transition-all duration-200" aria-label="Toggle wishlist">
            <svg class="w-4 h-4 transition-colors" class:text-danger={isWishlisted(product.id)} class:text-muted={!isWishlisted(product.id)} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
          <a href="/product/{product.id}" class="block">
            <div class="aspect-[4/5] overflow-hidden rounded-3xl bg-primary/3 mb-4">
              <img src={product.image_url} alt={product.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
            </div>
            <div class="px-1">
              <p class="text-xs font-semibold text-accent uppercase tracking-wide mb-1">{product.category}</p>
              <h3 class="font-semibold text-primary text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-accent transition-colors">{product.name}</h3>
              <div class="flex items-center gap-1.5 mb-2">
                <div class="flex">
                  {#each [1,2,3,4,5] as s}
                    <svg class="w-3.5 h-3.5 {s<=4?'text-accent':'text-primary/15'}" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {/each}
                </div>
                <span class="text-xs text-muted">(4.0)</span>
              </div>
              <p class="font-bold text-primary">₦{product.price.toLocaleString('en-NG')}</p>
            </div>
          </a>
          <button on:click={() => addToCart(product)} class="mt-3 w-full h-10 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-accent active:scale-[0.98] transition-all duration-150 opacity-0 group-hover:opacity-100" aria-label="Add {product.name} to cart">Add to cart</button>
        </div>
      {/each}
    </div>
  {/if}
</section>

<!-- BENEFITS -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {#each BENEFITS as b, i}
      <div class="text-center p-6 rounded-3xl bg-surface shadow-card border border-primary/5" style="animation-delay:{i*80}ms">
        <div class="w-12 h-12 rounded-2xl bg-accent/10 grid place-items-center mx-auto mb-4">
          <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path d={b.icon}/></svg>
        </div>
        <h3 class="font-bold text-primary text-sm mb-1.5">{b.title}</h3>
        <p class="text-xs text-muted leading-relaxed">{b.desc}</p>
      </div>
    {/each}
  </div>
</section>

<!-- BEST SELLERS -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex items-end justify-between mb-8">
    <div>
      <p class="text-xs font-semibold text-accent uppercase tracking-widest mb-2">Editor's pick</p>
      <h2 class="text-section font-bold tracking-tight">Best sellers</h2>
    </div>
  </div>
  {#if !loading}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      {#each bestSell as product, i}
        <div class="group relative flex flex-col" style="animation-delay:{i*60}ms">
          <button on:click={() => toggleWishlist(product)} class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface/90 grid place-items-center shadow-card opacity-0 group-hover:opacity-100 transition" aria-label="Toggle wishlist">
            <svg class="w-4 h-4" class:text-danger={isWishlisted(product.id)} class:text-muted={!isWishlisted(product.id)} fill={isWishlisted(product.id)?'currentColor':'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
          <a href="/product/{product.id}" class="block">
            <div class="aspect-[4/5] overflow-hidden rounded-3xl bg-primary/3 mb-4">
              <img src={product.image_url} alt={product.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
            </div>
            <p class="text-xs font-semibold text-accent uppercase tracking-wide mb-1">{product.category}</p>
            <h3 class="font-semibold text-sm text-primary line-clamp-2 mb-1.5">{product.name}</h3>
            <p class="font-bold text-primary">₦{product.price.toLocaleString('en-NG')}</p>
          </a>
          <button on:click={() => addToCart(product)} class="mt-3 w-full h-10 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-accent transition-all opacity-0 group-hover:opacity-100">Add to cart</button>
        </div>
      {/each}
    </div>
  {/if}
</section>

<!-- NEW ARRIVALS -->
{#if newArr.length}
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex items-end justify-between mb-8">
    <div>
      <p class="text-xs font-semibold text-accent uppercase tracking-widest mb-2">Just in</p>
      <h2 class="text-section font-bold tracking-tight">New arrivals</h2>
    </div>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
    {#each newArr as product, i}
      <div class="group relative flex flex-col" style="animation-delay:{i*60}ms">
        <button on:click={() => toggleWishlist(product)} class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface/90 grid place-items-center shadow-card opacity-0 group-hover:opacity-100 transition" aria-label="Toggle wishlist">
          <svg class="w-4 h-4" class:text-danger={isWishlisted(product.id)} class:text-muted={!isWishlisted(product.id)} fill={isWishlisted(product.id)?'currentColor':'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
        <a href="/product/{product.id}" class="block">
          <div class="aspect-[4/5] overflow-hidden rounded-3xl bg-primary/3 mb-4">
            <img src={product.image_url} alt={product.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
          </div>
          <p class="text-xs font-semibold text-accent uppercase tracking-wide mb-1">{product.category}</p>
          <h3 class="font-semibold text-sm text-primary line-clamp-2 mb-1.5">{product.name}</h3>
          <p class="font-bold text-primary">₦{product.price.toLocaleString('en-NG')}</p>
        </a>
        <button on:click={() => addToCart(product)} class="mt-3 w-full h-10 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-accent transition-all opacity-0 group-hover:opacity-100">Add to cart</button>
      </div>
    {/each}
  </div>
</section>
{/if}

<!-- NEWSLETTER -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div class="bg-primary rounded-4xl px-8 py-14 md:px-16 text-center relative overflow-hidden">
    <div class="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none"></div>
    <div class="relative">
      <p class="text-xs font-semibold text-accent uppercase tracking-widest mb-3">Stay in the loop</p>
      <h2 class="text-[2rem] md:text-section font-bold tracking-tight text-white mb-4 text-balance">Get exclusive deals first</h2>
      <p class="text-white/60 mb-8 max-w-md mx-auto">Join 10,000+ subscribers. Unsubscribe anytime.</p>
      {#if newsletterSent}
        <div class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-success/20 text-success font-semibold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          You're subscribed — thank you!
        </div>
      {:else}
        <form on:submit={handleNewsletter} class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="email" bind:value={email} required placeholder="your@email.com" class="flex-1 h-12 px-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition"/>
          <button type="submit" class="btn-accent h-12 px-7 flex-shrink-0">Subscribe</button>
        </form>
      {/if}
    </div>
  </div>
</section>

{#if toastShow}
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-primary text-white text-sm font-medium shadow-card-hover flex items-center gap-2 animate-fade-up" role="status" aria-live="polite">
    <svg class="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
    {toastMsg}
  </div>
{/if}
