<script lang="ts">
  import { onMount } from 'svelte';

  let tab = 'overview';
  let products: any[] = [], users: any[] = [], orders: any[] = [];
  let editing: any = null;
  let loading = true;

  onMount(async () => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (!u.is_admin) { location.href = '/'; return; }
    await loadAll();
    loading = false;
  });

  async function loadAll() {
    [products, users, orders] = await Promise.all([
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/orders').then(r => r.json()),
    ]);
  }

  async function saveProduct() {
    const method = editing.id ? 'PUT' : 'POST';
    await fetch('/api/admin/products', { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(editing) });
    editing = null;
    await loadAll();
  }

  async function deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    await fetch('/api/admin/products', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id}) });
    await loadAll();
  }

  async function updateOrder(id: number, status: string) {
    await fetch('/api/admin/orders', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id, status}) });
    await loadAll();
  }

  function logout() { localStorage.clear(); location.href = '/'; }

  const fmt    = (n: number) => '₦' + n.toLocaleString('en-NG');
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });

  // KPI computations
  $: revenue       = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
  $: pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
  $: lowStock      = products.filter((p: any) => (p.stock ?? 10) < 5);

  const TABS = [
    { id:'overview', label:'Overview', icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id:'products', label:'Products', icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id:'orders',   label:'Orders',   icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id:'customers',label:'Customers',icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const STATUS_COLORS: Record<string,string> = {
    completed:  'bg-success/10 text-success',
    pending:    'bg-accent/10 text-accent',
    processing: 'bg-blue-50 text-blue-600',
    cancelled:  'bg-danger/10 text-danger',
  };
</script>

<svelte:head>
  <title>Admin — ShopHub</title>
</svelte:head>

{#if loading}
  <div class="min-h-screen grid place-items-center">
    <div class="flex flex-col items-center gap-4">
      <div class="w-8 h-8 border-2 border-primary border-t-accent rounded-full animate-spin"></div>
      <p class="text-sm text-muted">Loading dashboard…</p>
    </div>
  </div>
{:else}
<div class="min-h-screen bg-bg">
  <!-- Admin top bar -->
  <div class="bg-primary text-white">
    <div class="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-xl bg-accent grid place-items-center">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12l-1 9H3L2 4z" fill="white" fill-opacity=".9"/><path d="M6 4V3a2 2 0 014 0v1" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <span class="font-bold">ShopHub Admin</span>
        <span class="hidden sm:inline text-white/40 text-sm">Control Panel</span>
      </div>
      <div class="flex items-center gap-3">
        <a href="/" class="text-white/60 hover:text-white text-sm transition">View site</a>
        <button on:click={logout} class="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Sign out
        </button>
      </div>
    </div>
  </div>

  <div class="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
    <!-- Tab nav -->
    <nav class="flex items-center gap-1 mb-8 overflow-x-auto no-scrollbar">
      {#each TABS as t}
        <button
          on:click={() => tab = t.id}
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap {tab===t.id ? 'bg-primary text-white' : 'text-muted hover:bg-primary/5 hover:text-primary'}"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d={t.icon}/></svg>
          {t.label}
        </button>
      {/each}
    </nav>

    <!-- OVERVIEW -->
    {#if tab === 'overview'}
      <!-- KPI cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {#each [
          { label:'Total Revenue', value: fmt(revenue), sub:'All time', icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color:'text-success' },
          { label:'Total Orders',  value: orders.length, sub:`${pendingOrders} pending`, icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color:'text-blue-600' },
          { label:'Products',      value: products.length, sub:`${lowStock.length} low stock`, icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color:'text-accent' },
          { label:'Customers',     value: [...new Set(orders.map((o: any) => o.customer_email))].length, sub:'Unique buyers', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color:'text-purple-600' },
        ] as kpi}
          <div class="card p-5">
            <div class="flex items-start justify-between mb-4">
              <p class="text-xs font-semibold text-muted uppercase tracking-wide">{kpi.label}</p>
              <div class="w-9 h-9 rounded-xl bg-primary/5 grid place-items-center">
                <svg class="w-4 h-4 {kpi.color}" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path d={kpi.icon}/></svg>
              </div>
            </div>
            <p class="text-2xl font-bold text-primary">{kpi.value}</p>
            <p class="text-xs text-muted mt-1">{kpi.sub}</p>
          </div>
        {/each}
      </div>

      <!-- Recent orders + Low stock -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Recent orders -->
        <div class="card overflow-hidden">
          <div class="p-5 border-b border-primary/5 flex items-center justify-between">
            <h3 class="font-bold">Recent orders</h3>
            <button on:click={() => tab = 'orders'} class="text-xs text-accent font-semibold">View all</button>
          </div>
          <div class="divide-y divide-primary/5">
            {#each orders.slice(0, 6) as o}
              <div class="px-5 py-3.5 flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <p class="font-semibold text-sm text-primary">#{o.id} · {o.customer_name}</p>
                  <p class="text-xs text-muted mt-0.5">{fmtDate(o.created_at)}</p>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <span class="badge {STATUS_COLORS[o.status] || 'bg-primary/5 text-muted'}">{o.status}</span>
                  <p class="font-bold text-sm">{fmt(o.total)}</p>
                </div>
              </div>
            {:else}
              <p class="px-5 py-8 text-sm text-muted text-center">No orders yet.</p>
            {/each}
          </div>
        </div>

        <!-- Low stock alerts -->
        <div class="card overflow-hidden">
          <div class="p-5 border-b border-primary/5 flex items-center justify-between">
            <h3 class="font-bold">Inventory alerts</h3>
            {#if lowStock.length}<span class="badge bg-danger/10 text-danger">{lowStock.length} items</span>{/if}
          </div>
          <div class="divide-y divide-primary/5">
            {#each (lowStock.length ? lowStock : products.slice(0,5)) as p}
              <div class="px-5 py-3.5 flex items-center gap-3">
                <img src={p.image_url} alt={p.name} class="w-10 h-10 rounded-xl object-cover bg-primary/5 flex-shrink-0"/>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate">{p.name}</p>
                  <p class="text-xs text-muted">{p.category}</p>
                </div>
                <span class="badge {(p.stock ?? 10) < 5 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'} flex-shrink-0">
                  {p.stock ?? 10} left
                </span>
              </div>
            {:else}
              <p class="px-5 py-8 text-sm text-muted text-center">All products are well stocked.</p>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- PRODUCTS -->
    {#if tab === 'products'}
      <div class="card overflow-hidden">
        <div class="p-5 border-b border-primary/5 flex items-center justify-between">
          <h2 class="font-bold">Products <span class="text-muted font-normal text-sm ml-1">({products.length})</span></h2>
          <button
            on:click={() => editing = {name:'',description:'',price:0,category:'Electronics',image_url:'',stock:10}}
            class="btn-primary h-9 px-4 text-sm gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Add product
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-bg border-b border-primary/5 text-left">
                <th class="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">Product</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Price</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Stock</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Category</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary/5">
              {#each products as p}
                <tr class="hover:bg-bg transition-colors">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <img src={p.image_url} alt={p.name} class="w-10 h-10 rounded-xl object-cover bg-primary/5 flex-shrink-0"/>
                      <span class="font-semibold text-primary truncate max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3.5 font-semibold">{fmt(p.price)}</td>
                  <td class="px-4 py-3.5">
                    <span class="badge {(p.stock??10)<5?'bg-danger/10 text-danger':'bg-success/10 text-success'}">{p.stock??10}</span>
                  </td>
                  <td class="px-4 py-3.5 text-muted">{p.category}</td>
                  <td class="px-4 py-3.5">
                    <div class="flex items-center gap-2">
                      <button on:click={() => editing = {...p}} class="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                      <button on:click={() => deleteProduct(p.id)} class="text-xs font-semibold text-danger hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- ORDERS -->
    {#if tab === 'orders'}
      <div class="card overflow-hidden">
        <div class="p-5 border-b border-primary/5">
          <h2 class="font-bold">Orders <span class="text-muted font-normal text-sm ml-1">({orders.length})</span></h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-bg border-b border-primary/5 text-left">
                {#each ['Order','Customer','Date','Total','Status','Action'] as h}
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">{h}</th>
                {/each}
              </tr>
            </thead>
            <tbody class="divide-y divide-primary/5">
              {#each orders as o}
                <tr class="hover:bg-bg transition-colors">
                  <td class="px-5 py-3.5 font-semibold">#{o.id}</td>
                  <td class="px-5 py-3.5">
                    <p class="font-medium text-primary">{o.customer_name}</p>
                    <p class="text-xs text-muted">{o.customer_phone}</p>
                  </td>
                  <td class="px-5 py-3.5 text-muted">{fmtDate(o.created_at)}</td>
                  <td class="px-5 py-3.5 font-bold">{fmt(o.total)}</td>
                  <td class="px-5 py-3.5">
                    <span class="badge {STATUS_COLORS[o.status] || 'bg-primary/5 text-muted'}">{o.status}</span>
                  </td>
                  <td class="px-5 py-3.5">
                    <select
                      value={o.status}
                      on:change={(e) => updateOrder(o.id, (e.target as HTMLSelectElement).value)}
                      class="text-xs border border-primary/10 rounded-lg px-2 py-1.5 bg-bg focus:outline-none focus:ring-2 focus:ring-accent/25 transition"
                    >
                      {#each ['pending','processing','completed','cancelled'] as s}
                        <option value={s}>{s}</option>
                      {/each}
                    </select>
                  </td>
                </tr>
              {:else}
                <tr><td colspan="6" class="text-center py-12 text-muted text-sm">No orders yet.</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- CUSTOMERS -->
    {#if tab === 'customers'}
      {@const uniqueCustomers = [...new Map(orders.map((o: any) => [o.customer_email, o])).values()]}
      <div class="card overflow-hidden">
        <div class="p-5 border-b border-primary/5">
          <h2 class="font-bold">Customers <span class="text-muted font-normal text-sm ml-1">({uniqueCustomers.length})</span></h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-bg border-b border-primary/5 text-left">
                {#each ['Customer','Email','Phone','Orders','Total spent'] as h}
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">{h}</th>
                {/each}
              </tr>
            </thead>
            <tbody class="divide-y divide-primary/5">
              {#each uniqueCustomers as c}
                {@const custOrders = orders.filter((o: any) => o.customer_email === c.customer_email)}
                {@const spent = custOrders.reduce((s: number, o: any) => s + (o.total || 0), 0)}
                <tr class="hover:bg-bg transition-colors">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-accent/15 text-accent grid place-items-center text-sm font-bold flex-shrink-0">{c.customer_name?.[0] ?? '?'}</div>
                      <span class="font-semibold">{c.customer_name}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 text-muted">{c.customer_email}</td>
                  <td class="px-5 py-3.5 text-muted">{c.customer_phone}</td>
                  <td class="px-5 py-3.5 font-semibold">{custOrders.length}</td>
                  <td class="px-5 py-3.5 font-bold">{fmt(spent)}</td>
                </tr>
              {:else}
                <tr><td colspan="5" class="text-center py-12 text-muted text-sm">No customers yet.</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>
{/if}

<!-- Product modal -->
{#if editing}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" on:click|self={() => editing = null}>
    <div class="bg-surface rounded-3xl shadow-card-hover w-full max-w-md animate-fade-up" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="flex items-center justify-between p-6 border-b border-primary/5">
        <h3 id="modal-title" class="font-bold text-lg">{editing.id ? 'Edit product' : 'New product'}</h3>
        <button on:click={() => editing = null} class="w-8 h-8 rounded-xl grid place-items-center text-muted hover:bg-primary/5 transition" aria-label="Close">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-1.5">Name</label>
          <input bind:value={editing.name} placeholder="Product name" class="input"/>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5">Description</label>
          <textarea bind:value={editing.description} placeholder="Product description" class="input h-24 resize-none py-3"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-1.5">Price (₦)</label>
            <input type="number" bind:value={editing.price} min="0" placeholder="0" class="input"/>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1.5">Stock</label>
            <input type="number" bind:value={editing.stock} min="0" placeholder="10" class="input"/>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5">Category</label>
          <select bind:value={editing.category} class="input bg-bg">
            {#each ['Electronics','Fashion','Home','Beauty'] as c}<option value={c}>{c}</option>{/each}
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5">Image URL</label>
          <input bind:value={editing.image_url} placeholder="https://..." class="input"/>
        </div>
      </div>
      <div class="flex gap-3 p-6 pt-0">
        <button on:click={saveProduct} class="btn-primary flex-1">Save product</button>
        <button on:click={() => editing = null} class="btn-ghost flex-1">Cancel</button>
      </div>
    </div>
  </div>
{/if}
