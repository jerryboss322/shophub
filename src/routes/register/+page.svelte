<script lang="ts">
  let name = '', email = '', password = '', confirm = '';
  let loading = false, error = '', success = false;

  async function handleRegister(e: Event) {
    e.preventDefault();
    if (password !== confirm) { error = 'Passwords do not match.'; return; }
    if (password.length < 6) { error = 'Password must be at least 6 characters.'; return; }
    loading = true; error = '';
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ full_name: name, email, password })
      });
      const data = await res.json();
      if (!res.ok) { error = data.message || 'Registration failed.'; return; }
      success = true;
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } catch { error = 'Network error. Please try again.'; }
    finally { loading = false; }
  }
</script>

<svelte:head><title>Create account — ShopHub</title></svelte:head>

<div class="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <div class="w-12 h-12 rounded-2xl bg-primary grid place-items-center mx-auto mb-4">
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12l-1 9H3L2 4z" fill="#D4AF37"/>
          <path d="M6 4V3a2 2 0 014 0v1" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold tracking-tight">Create your account</h1>
      <p class="text-muted text-sm mt-1">Join thousands of shoppers on ShopHub</p>
    </div>

    <div class="card p-8 animate-fade-up">
      {#if success}
        <div class="text-center py-4">
          <div class="w-12 h-12 rounded-full bg-success/15 grid place-items-center mx-auto mb-3">
            <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <h3 class="font-bold text-lg mb-1">Account created!</h3>
          <p class="text-sm text-muted">Redirecting you to sign in…</p>
        </div>
      {:else}
        {#if error}
          <div class="flex items-center gap-2 p-3.5 rounded-xl bg-danger/8 text-danger text-sm mb-5 border border-danger/15">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {error}
          </div>
        {/if}

        <form on:submit={handleRegister} class="space-y-4" novalidate>
          <div>
            <label for="name" class="block text-sm font-semibold mb-1.5">Full name</label>
            <input id="name" type="text" bind:value={name} required placeholder="Amara Okonkwo" class="input" autocomplete="name"/>
          </div>
          <div>
            <label for="email" class="block text-sm font-semibold mb-1.5">Email address</label>
            <input id="email" type="email" bind:value={email} required placeholder="you@example.com" class="input" autocomplete="email"/>
          </div>
          <div>
            <label for="password" class="block text-sm font-semibold mb-1.5">Password</label>
            <input id="password" type="password" bind:value={password} required placeholder="Min. 6 characters" class="input" autocomplete="new-password"/>
          </div>
          <div>
            <label for="confirm" class="block text-sm font-semibold mb-1.5">Confirm password</label>
            <input id="confirm" type="password" bind:value={confirm} required placeholder="••••••••" class="input" autocomplete="new-password"/>
          </div>

          <button type="submit" disabled={loading} class="btn-primary w-full h-12 text-base mt-2 gap-2">
            {#if loading}
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Creating account…
            {:else}
              Create account
            {/if}
          </button>
        </form>

        <p class="text-center text-sm text-muted mt-6">
          Already have an account?
          <a href="/login" class="text-accent font-semibold hover:underline ml-1">Sign in</a>
        </p>
      {/if}
    </div>
  </div>
</div>
