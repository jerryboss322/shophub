<script>
  const TEAM = [
    { name: 'Adaeze Mbachu', role: 'Founder & CEO', initials: 'AM' },
    { name: 'Kunle Adeyemi',  role: 'Head of Product',initials: 'KA' },
    { name: 'Ngozi Eze',      role: 'Head of Ops',    initials: 'NE' },
  ];
</script>

<svelte:head><title>About — ShopHub</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-16">
  <div class="text-center mb-16">
    <p class="text-xs font-semibold text-accent uppercase tracking-widest mb-3">Our story</p>
    <h1 class="text-section font-bold tracking-tight mb-5">Shopping made <span class="text-accent">premium</span> for Nigeria</h1>
    <p class="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
      ShopHub was born from a simple idea: Nigerians deserve a world-class shopping experience. We curate authentic, premium products and deliver them fast — everywhere in Nigeria.
    </p>
  </div>

  <div class="grid sm:grid-cols-3 gap-5 mb-16">
    {#each [['10,000+','Happy customers'],['48h','Average delivery'],['100%','Authentic products']] as [num,label]}
      <div class="card p-8 text-center">
        <p class="text-4xl font-bold text-accent mb-2">{num}</p>
        <p class="text-muted text-sm">{label}</p>
      </div>
    {/each}
  </div>

  <div class="mb-16">
    <h2 class="text-2xl font-bold tracking-tight mb-8 text-center">Meet the team</h2>
    <div class="grid sm:grid-cols-3 gap-5">
      {#each TEAM as member}
        <div class="card p-6 text-center">
          <div class="w-16 h-16 rounded-2xl bg-accent/15 text-accent grid place-items-center text-xl font-bold mx-auto mb-4">{member.initials}</div>
          <h3 class="font-bold">{member.name}</h3>
          <p class="text-sm text-muted mt-1">{member.role}</p>
        </div>
      {/each}
    </div>
  </div>

  <div class="text-center">
    <h2 class="text-2xl font-bold tracking-tight mb-4">Ready to shop?</h2>
    <p class="text-muted mb-6">Discover thousands of premium products curated just for you.</p>
    <a href="/catalog" class="btn-primary">Browse all products</a>
  </div>
</div>
