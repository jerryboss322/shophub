<script lang="ts">
  import { onMount } from 'svelte';
  let user: any = null;
  onMount(() => {
    user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) window.location.href = '/login';
  });
  function logout() { localStorage.removeItem('user'); localStorage.removeItem('token'); window.location.href = '/'; }
</script>

<svelte:head><title>My Account — ShopHub</title></svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
  {#if user}
    <h1 class="text-section font-bold tracking-tight mb-8">My account</h1>
    <div class="grid sm:grid-cols-2 gap-5">
      <div class="card p-6">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-14 h-14 rounded-2xl bg-accent/15 text-accent grid place-items-center text-xl font-bold flex-shrink-0">
            {user.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 class="font-bold text-lg">{user.full_name}</h2>
            <p class="text-muted text-sm">{user.email}</p>
          </div>
        </div>
        {#if user.is_admin}
          <a href="/admin" class="btn-accent w-full justify-center mb-3">Admin dashboard</a>
        {/if}
        <button on:click={logout} class="btn-ghost w-full justify-center text-danger border-danger/20 hover:bg-danger/5">Sign out</button>
      </div>
      <div class="card p-6 space-y-4">
        <h3 class="font-bold">Quick links</h3>
        {#each [['Wishlist','/wishlist','M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z'],['Shop','/catalog','M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'],['About','/about','M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z']] as [label, href, icon]}
          <a {href} class="flex items-center gap-3 text-sm font-medium text-muted hover:text-primary transition-colors">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d={icon}/></svg>
            {label}
          </a>
        {/each}
      </div>
    </div>
  {:else}
    <div class="text-center py-20"><div class="w-8 h-8 border-2 border-primary border-t-accent rounded-full animate-spin mx-auto"></div></div>
  {/if}
</div>
