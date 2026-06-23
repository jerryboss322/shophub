<script lang="ts">
  let email = '', password = '', loading = false, error = '';

  async function handleLogin(e: Event) {
    e.preventDefault();
    loading = true; error = '';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { error = data.message || 'Invalid credentials'; return; }
      localStorage.setItem('user',  JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      window.location.href = data.user.is_admin ? '/admin' : '/';
    } catch { error = 'Network error. Please try again.'; }
    finally { loading = false; }
  }
</script>

<svelte:head><title>Sign in — ShopHub</title></svelte:head>

<div class="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-sm">
    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="w-12 h-12 rounded-2xl bg-primary grid place-items-center mx-auto mb-4">
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12l-1 9H3L2 4z" fill="#D4AF37"/>
          <path d="M6 4V3a2 2 0 014 0v1" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p class="text-muted text-sm mt-1">Sign in to your ShopHub account</p>
    </div>

    <div class="card p-8 animate-fade-up">
      {#if error}
        <div class="flex items-center gap-2 p-3.5 rounded-xl bg-danger/8 text-danger text-sm mb-5 border border-danger/15">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          {error}
        </div>
      {/if}

      <form on:submit={handleLogin} class="space-y-4" novalidate>
        <div>
          <label for="email" class="block text-sm font-semibold mb-1.5">Email address</label>
          <input id="email" type="email" bind:value={email} required placeholder="you@example.com" class="input" autocomplete="email"/>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="password" class="text-sm font-semibold">Password</label>
            <a href="#" class="text-xs text-accent font-medium hover:underline">Forgot password?</a>
          </div>
          <input id="password" type="password" bind:value={password} required placeholder="••••••••" class="input" autocomplete="current-password"/>
        </div>

        <button type="submit" disabled={loading} class="btn-primary w-full h-12 text-base mt-2 gap-2">
          {#if loading}
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Signing in…
          {:else}
            Sign in
          {/if}
        </button>
      </form>

      <p class="text-center text-sm text-muted mt-6">
        Don't have an account?
        <a href="/register" class="text-accent font-semibold hover:underline ml-1">Create one</a>
      </p>
    </div>

    <!-- Demo hint -->
    <p class="text-center text-xs text-muted mt-4 opacity-60">
      Demo: admin@shophub.ng · admin123
    </p>
  </div>
</div>
