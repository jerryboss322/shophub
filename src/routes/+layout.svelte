<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  // ---- State ----
  let cartCount  = 0;
  let wishCount  = 0;
  let user: any  = null;
  let menuOpen   = false;
  let searchOpen = false;
  let searchQ    = '';
  let scrolled   = false;
  let catOpen    = false;

  const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'];
  const NAV_LINKS  = [
    { label: 'Shop',       href: '/catalog' },
    { label: 'Categories', dropdown: true   },
    { label: 'Deals',      href: '/catalog?sort=discount' },
    { label: 'About',      href: '/about'   },
  ];

  // ---- Lifecycle ----
  onMount(() => {
    syncState();
    window.addEventListener('storage', syncState);
    window.addEventListener('cart:update',   syncState);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener('cart:update', syncState);
      window.removeEventListener('scroll', handleScroll);
    };
  });

  function syncState() {
    const cart = JSON.parse(localStorage.getItem('cart')    || '[]');
    const wish = JSON.parse(localStorage.getItem('wishlist')|| '[]');
    user       = JSON.parse(localStorage.getItem('user')    || 'null');
    cartCount  = cart.reduce((s: number, i: any) => s + i.qty, 0);
    wishCount  = wish.length;
  }

  function handleScroll() { scrolled = window.scrollY > 20; }

  function handleSearch(e: Event) {
    e.preventDefault();
    if (searchQ.trim()) {
      window.location.href = `/catalog?q=${encodeURIComponent(searchQ.trim())}`;
      searchOpen = false;
      searchQ = '';
    }
  }

  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    user = null;
    window.location.href = '/';
  }

  // Close dropdowns on route change
  $: $page, (() => { menuOpen = false; searchOpen = false; catOpen = false; })();
</script>

<!-- ===== ANNOUNCEMENT BAR ===== -->
<div class="bg-primary text-white text-xs text-center py-2.5 px-4 tracking-wide">
  Free delivery on orders over ₦50,000 &nbsp;·&nbsp; Fast shipping across Nigeria
</div>

<!-- ===== NAVBAR ===== -->
<header
  class="sticky top-0 z-50 transition-all duration-300"
  class:shadow-card={scrolled}
  style="background: {scrolled ? 'rgba(255,251,244,0.95)' : '#FFFBF4'}; backdrop-filter: {scrolled ? 'blur(16px)' : 'none'};"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">

    <!-- Logo -->
    <a href="/" class="flex items-center gap-2.5 flex-shrink-0" aria-label="ShopHub home">
      <div class="w-8 h-8 rounded-xl bg-primary grid place-items-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12l-1 9H3L2 4z" fill="#D4AF37"/>
          <path d="M6 4V3a2 2 0 014 0v1" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="font-bold text-primary tracking-tight text-lg">ShopHub</span>
    </a>

    <!-- Desktop Nav -->
    <nav class="hidden lg:flex items-center gap-1 flex-1" aria-label="Main navigation">
      {#each NAV_LINKS as link}
        {#if link.dropdown}
          <div class="relative group">
            <button
              class="nav-link flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary/5 transition"
              on:click={() => catOpen = !catOpen}
              on:mouseenter={() => catOpen = true}
              aria-haspopup="true"
              aria-expanded={catOpen}
            >
              {link.label}
              <svg class="w-3.5 h-3.5 transition-transform duration-200" class:rotate-180={catOpen} fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {#if catOpen}
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                class="absolute top-full left-0 mt-1 w-48 bg-surface rounded-2xl shadow-card-hover border border-primary/5 py-2 animate-fade-up"
                on:mouseleave={() => catOpen = false}
              >
                {#each CATEGORIES as cat}
                  <a
                    href="/catalog?category={encodeURIComponent(cat)}"
                    class="block px-4 py-2.5 text-sm font-medium text-muted hover:text-primary hover:bg-bg transition-colors"
                  >
                    {cat}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <a href={link.href} class="nav-link px-3 py-2 rounded-lg hover:bg-primary/5 transition">{link.label}</a>
        {/if}
      {/each}
    </nav>

    <!-- Search bar (desktop) -->
    <div class="hidden md:flex flex-1 max-w-sm">
      <form on:submit={handleSearch} class="relative w-full">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          bind:value={searchQ}
          type="search"
          placeholder="Search products..."
          class="w-full h-10 pl-9 pr-4 rounded-xl border border-primary/10 bg-surface text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition"
        />
      </form>
    </div>

    <!-- Right icons -->
    <div class="flex items-center gap-1 ml-auto lg:ml-0">

      <!-- Mobile search toggle -->
      <button
        class="md:hidden w-9 h-9 grid place-items-center rounded-xl hover:bg-primary/5 transition text-muted"
        on:click={() => searchOpen = !searchOpen}
        aria-label="Search"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </button>

      <!-- Wishlist -->
      <a href="/wishlist" class="relative w-9 h-9 grid place-items-center rounded-xl hover:bg-primary/5 transition text-muted" aria-label="Wishlist">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        {#if wishCount > 0}
          <span class="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-accent text-white text-[10px] font-bold rounded-full">{wishCount}</span>
        {/if}
      </a>

      <!-- Cart -->
      <a href="/cart" class="relative w-9 h-9 grid place-items-center rounded-xl hover:bg-primary/5 transition text-muted" aria-label="Cart ({cartCount} items)">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {#if cartCount > 0}
          <span class="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full">{cartCount}</span>
        {/if}
      </a>

      <!-- Account -->
      {#if user}
        <div class="relative group hidden sm:block">
          <button class="flex items-center gap-2 pl-2 pr-3 h-9 rounded-xl hover:bg-primary/5 transition text-sm font-medium" aria-haspopup="true">
            <div class="w-6 h-6 rounded-full bg-accent/20 text-accent grid place-items-center text-xs font-bold">
              {user.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span class="text-primary hidden md:block max-w-[80px] truncate">{user.full_name?.split(' ')[0]}</span>
          </button>
          <div class="absolute top-full right-0 mt-1 w-44 bg-surface rounded-2xl shadow-card-hover border border-primary/5 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
            <a href="/account" class="block px-4 py-2.5 text-sm text-muted hover:text-primary hover:bg-bg transition">My Account</a>
            {#if user.is_admin}
              <a href="/admin" class="block px-4 py-2.5 text-sm text-muted hover:text-primary hover:bg-bg transition">Admin Panel</a>
            {/if}
            <hr class="my-1 border-primary/5"/>
            <button on:click={logout} class="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition">Sign out</button>
          </div>
        </div>
      {:else}
        <a href="/login" class="hidden sm:inline-flex btn-primary h-9 px-4 text-sm">Sign in</a>
      {/if}

      <!-- Mobile hamburger -->
      <button
        class="lg:hidden w-9 h-9 grid place-items-center rounded-xl hover:bg-primary/5 transition"
        on:click={() => menuOpen = !menuOpen}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        {#if menuOpen}
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        {:else}
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile search bar -->
  {#if searchOpen}
    <div class="md:hidden px-4 pb-3 animate-fade-up">
      <form on:submit={handleSearch} class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          bind:value={searchQ}
          type="search"
          placeholder="Search products..."
          autofocus
          class="w-full h-11 pl-9 pr-4 rounded-xl border border-primary/10 bg-surface text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/25 transition"
        />
      </form>
    </div>
  {/if}

  <!-- Mobile menu -->
  {#if menuOpen}
    <nav class="lg:hidden border-t border-primary/5 bg-bg px-4 py-4 animate-fade-up" aria-label="Mobile navigation">
      <div class="space-y-1">
        {#each NAV_LINKS as link}
          {#if link.dropdown}
            <div class="pt-1">
              <p class="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider">Categories</p>
              {#each CATEGORIES as cat}
                <a href="/catalog?category={encodeURIComponent(cat)}" class="block px-3 py-2.5 text-sm font-medium text-muted hover:text-primary hover:bg-surface rounded-xl transition">{cat}</a>
              {/each}
            </div>
          {:else}
            <a href={link.href} class="block px-3 py-2.5 text-sm font-semibold text-primary hover:bg-surface rounded-xl transition">{link.label}</a>
          {/if}
        {/each}
        <hr class="my-3 border-primary/5"/>
        {#if user}
          <a href="/account" class="block px-3 py-2.5 text-sm font-semibold text-primary hover:bg-surface rounded-xl transition">My Account</a>
          <button on:click={logout} class="block w-full text-left px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5 rounded-xl transition">Sign out</button>
        {:else}
          <a href="/login" class="block px-3 py-2.5 text-sm font-semibold text-primary hover:bg-surface rounded-xl transition">Sign in</a>
          <a href="/register" class="block px-3 py-2.5 text-sm font-semibold text-accent hover:bg-accent/5 rounded-xl transition">Create account</a>
        {/if}
      </div>
    </nav>
  {/if}
</header>

<!-- ===== MAIN ===== -->
<main>
  <slot />
</main>

<!-- ===== FOOTER ===== -->
<footer class="bg-primary text-white mt-24">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">

      <!-- Brand -->
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-8 h-8 rounded-xl bg-accent grid place-items-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12l-1 9H3L2 4z" fill="white" fill-opacity=".9"/>
              <path d="M6 4V3a2 2 0 014 0v1" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="font-bold text-lg">ShopHub</span>
        </div>
        <p class="text-sm text-white/60 leading-relaxed max-w-[200px]">Premium products delivered across Nigeria.</p>
        <div class="flex gap-3 mt-5">
          {#each [['Instagram','M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'], ['Twitter','M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z']] as [name, svgPath]}
            <a href="#" aria-label={name} class="w-8 h-8 rounded-lg bg-white/10 hover:bg-accent grid place-items-center transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={svgPath}/></svg>
            </a>
          {/each}
        </div>
      </div>

      <!-- Shop -->
      <div>
        <h4 class="font-semibold text-sm mb-4 text-white/90">Shop</h4>
        <ul class="space-y-3">
          {#each CATEGORIES as cat}
            <li><a href="/catalog?category={encodeURIComponent(cat)}" class="text-sm text-white/55 hover:text-white transition-colors">{cat}</a></li>
          {/each}
        </ul>
      </div>

      <!-- Help -->
      <div>
        <h4 class="font-semibold text-sm mb-4 text-white/90">Help</h4>
        <ul class="space-y-3">
          {#each [['FAQ','#'],['Shipping','#'],['Returns','#'],['Track Order','#'],['Contact','#']] as [l,h]}
            <li><a href={h} class="text-sm text-white/55 hover:text-white transition-colors">{l}</a></li>
          {/each}
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h4 class="font-semibold text-sm mb-4 text-white/90">Contact</h4>
        <ul class="space-y-3 text-sm text-white/55">
          <li>Lagos, Nigeria</li>
          <li>hello@shophub.ng</li>
          <li>+234 800 000 0000</li>
        </ul>
      </div>
    </div>

    <div class="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-xs text-white/40">&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
      <div class="flex items-center gap-4">
        <span class="text-xs text-white/40">We accept</span>
        {#each ['Visa','Mastercard','Verve','PayStack'] as m}
          <span class="text-[10px] font-semibold text-white/60 bg-white/10 px-2 py-1 rounded">{m}</span>
        {/each}
      </div>
    </div>
  </div>
</footer>
