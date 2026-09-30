// Aplicação Principal - Regras de Negócio, Navegação e CRUDs

let currentCategorias = [];
let currentProdutos = [];
let currentPromocoes = [];
let currentCupons = [];
let currentClientes = [];
let currentFilterCategory = null;
let searchQuery = '';

// Máscaras e Utilitários de Entrada
function maskCPF(value) {
  if (!value) return '';
  let v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9) {
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  } else if (v.length > 6) {
    return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (v.length > 3) {
    return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  return v;
}

function maskPhone(value) {
  if (!value) return '';
  let v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) {
    return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (v.length > 6) {
    return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else if (v.length > 2) {
    return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else if (v.length > 0) {
    return v.replace(/(\d*)/, '($1');
  }
  return v;
}

function unmask(value) {
  return value ? value.replace(/\D/g, '') : '';
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  CartState.init();
  await loadInitialData();
  showSection('store-home');

  // Event Listeners Globais para Máscaras
  document.addEventListener('input', (e) => {
    if (e.target.matches('#chk-cpf, .cpf-mask')) {
      e.target.value = maskCPF(e.target.value);
    }
    if (e.target.matches('#chk-telefone, .phone-mask')) {
      e.target.value = maskPhone(e.target.value);
    }
  });
});

// Carga Inicial dos Dados do Supabase
async function loadInitialData() {
  try {
    const [cats, prods, promos, cupons] = await Promise.all([
      SupabaseDB.getCategorias(),
      SupabaseDB.getProdutos(),
      SupabaseDB.getPromocoes(),
      SupabaseDB.getCupons()
    ]);

    currentCategorias = cats || [];
    currentProdutos = prods || [];
    currentPromocoes = promos || [];
    currentCupons = cupons || [];

    renderCategoriesNav();
    renderStoreProducts();
  } catch (e) {
    console.error('Erro ao carregar dados do Supabase:', e);
    showToast('Aviso: Erro ao carregar dados remotos do banco.', 'error');
  }
}

// Navegação entre Seções Principais
function showSection(sectionId) {
  const sections = ['sec-store-home', 'sec-product-detail', 'sec-store-cart', 'sec-store-checkout', 'sec-store-orders', 'sec-admin-dashboard'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(`sec-${sectionId}`);
  if (target) {
    target.classList.remove('hidden');
  }

  // Renders Específicos
  if (sectionId === 'store-cart') {
    renderCartView();
  } else if (sectionId === 'store-checkout') {
    renderCheckoutView();
  } else if (sectionId === 'store-orders') {
    renderClientOrdersView();
  } else if (sectionId === 'admin-dashboard') {
    renderAdminProductsTable();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Autenticação Admin
let isAdminAuthenticated = false;

function checkAdminAuth() {
  if (sessionStorage.getItem('techpanca_admin_auth') === 'true') {
    isAdminAuthenticated = true;
  }
  return isAdminAuthenticated;
}

function promptAdminAuth() {
  const modal = document.getElementById('admin-auth-modal');
  const errorDiv = document.getElementById('admin-auth-error');
  const input = document.getElementById('admin-password-input');
  if (errorDiv) errorDiv.classList.add('hidden');
  if (input) input.value = '';
  if (modal) modal.classList.remove('hidden');
}

function closeAdminAuthModal() {
  const modal = document.getElementById('admin-auth-modal');
  if (modal) modal.classList.add('hidden');
}

function handleAdminAuthSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('admin-password-input');
  const errorDiv = document.getElementById('admin-auth-error');

  if (input && input.value === 'admin123') {
    isAdminAuthenticated = true;
    sessionStorage.setItem('techpanca_admin_auth', 'true');
    closeAdminAuthModal();
    executeSwitchToAdmin();
  } else {
    if (errorDiv) errorDiv.classList.remove('hidden');
  }
}

function executeSwitchToAdmin() {
  const btnStore = document.getElementById('btn-mode-store');
  const btnAdmin = document.getElementById('btn-mode-admin');

  if (btnStore && btnAdmin) {
    btnStore.className = "px-3 py-1.5 rounded-md font-bold text-on-surface-variant hover:text-on-surface transition-colors";
    btnAdmin.className = "px-3 py-1.5 rounded-md font-bold transition-colors bg-primary-container text-on-primary flex items-center gap-1";
  }
  showSection('admin-dashboard');
}

// Switcher Loja vs Admin
function switchViewMode(mode) {
  const btnStore = document.getElementById('btn-mode-store');
  const btnAdmin = document.getElementById('btn-mode-admin');

  if (mode === 'admin') {
    if (!checkAdminAuth()) {
      promptAdminAuth();
      return;
    }
    executeSwitchToAdmin();
  } else {
    if (btnAdmin && btnStore) {
      btnAdmin.className = "px-3 py-1.5 rounded-md font-bold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1";
      btnStore.className = "px-3 py-1.5 rounded-md font-bold transition-colors bg-primary-container text-on-primary";
    }
    showSection('store-home');
  }
}

// Renderizar Categorias na Navegação
function renderCategoriesNav() {
  const container = document.getElementById('categories-nav-list');
  if (!container) return;

  let html = `
    <button onclick="filterByCategory(null)" class="px-3 py-1.5 rounded-lg ${currentFilterCategory === null ? 'bg-primary-container text-on-primary' : 'text-secondary-fixed hover:bg-surface-variant'} uppercase font-bold transition-colors shrink-0">
      Todos
    </button>
  `;

  currentCategorias.forEach(cat => {
    const isActive = currentFilterCategory === cat.id;
    html += `
      <button onclick="filterByCategory('${cat.id}')" class="px-3 py-1.5 rounded-lg ${isActive ? 'bg-primary-container text-on-primary' : 'text-secondary-fixed hover:bg-surface-variant'} uppercase font-bold transition-colors shrink-0">
        ${cat.nome}
      </button>
    `;
  });

  container.innerHTML = html;
}

function filterByCategory(catId) {
  currentFilterCategory = catId;
  renderCategoriesNav();
  renderStoreProducts();

  const titleEl = document.getElementById('store-products-title');
  if (titleEl) {
    if (catId) {
      const cat = currentCategorias.find(c => c.id === catId);
      titleEl.textContent = cat ? `Categoria: ${cat.nome}` : 'Produtos';
    } else {
      titleEl.textContent = 'Lançamentos & Ofertas Ninja';
    }
  }
}

// Pesquisa
function handleSearch(e) {
  if (e.key === 'Enter') {
    applySearch();
  }
}

function applySearch() {
  const input = document.getElementById('store-search-input');
  searchQuery = input ? input.value.trim().toLowerCase() : '';
  showSection('store-home');
  renderStoreProducts();
}

function scrollToProducts() {
  const anchor = document.getElementById('products-section-anchor');
  if (anchor) {
    anchor.scrollIntoView({ behavior: 'smooth' });
  }
}

// Renderizar Produtos da Vitrine
function renderStoreProducts() {
  const grid = document.getElementById('store-products-grid');
  if (!grid) return;

  let prods = [...currentProdutos].filter(p => p.ativo !== false);

  if (currentFilterCategory) {
    prods = prods.filter(p => p.categoria_id === currentFilterCategory);
  }

  if (searchQuery) {
    prods = prods.filter(p => p.nome.toLowerCase().includes(searchQuery) || (p.descricao && p.descricao.toLowerCase().includes(searchQuery)));
  }

  // Ordenação
  const sort = document.getElementById('sort-products-select')?.value || 'default';
  if (sort === 'price-asc') {
    prods.sort((a, b) => calculateProductPrice(a, currentPromocoes).precoFinal - calculateProductPrice(b, currentPromocoes).precoFinal);
  } else if (sort === 'price-desc') {
    prods.sort((a, b) => calculateProductPrice(b, currentPromocoes).precoFinal - calculateProductPrice(a, currentPromocoes).precoFinal);
  } else if (sort === 'name') {
    prods.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  if (prods.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-on-surface-variant space-y-2">
        <span class="material-symbols-outlined text-4xl">search_off</span>
        <p class="font-bold text-sm">Nenhum produto encontrado para a busca/categoria selecionada.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = prods.map(p => {
    const calc = calculateProductPrice(p, currentPromocoes);
    const imgUrl = getProductImageUrl(p.foto_url);

    return `
      <div class="bg-surface-container-low border border-surface-variant rounded-2xl p-4 flex flex-col justify-between hover:border-primary-container transition-all group shadow-lg">
        <div>
          <!-- Badge de Oferta -->
          <div class="relative mb-3 aspect-square rounded-xl overflow-hidden bg-background flex items-center justify-center p-2">
            ${calc.temPromocao ? `
              <span class="absolute top-2 left-2 z-10 bg-primary-container text-on-primary text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow">
                <span class="material-symbols-outlined text-[12px]">bolt</span> -${calc.descontoPercentual}% OFF
              </span>
            ` : ''}
            <img src="${imgUrl}" alt="${p.nome}" class="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300">
          </div>

          <span class="text-[10px] uppercase font-bold text-secondary-fixed">
            ${getCategoryName(p.categoria_id)}
          </span>

          <h3 class="font-bold text-xs lg:text-sm text-on-surface line-clamp-2 mt-1 min-h-[36px]">
            ${p.nome}
          </h3>
        </div>

        <div class="mt-4 pt-3 border-t border-surface-variant/50 space-y-2">
          ${calc.temPromocao ? `
            <span class="block text-[10px] text-on-surface-variant line-through">${formatCurrency(calc.precoOriginal)}</span>
          ` : '<span class="block text-[10px] text-transparent">.</span>'}

          <div class="flex items-baseline gap-1">
            <span class="text-xl font-black text-primary-container">${formatCurrency(calc.precoFinal)}</span>
            <span class="text-[10px] font-bold text-tertiary">à vista no PIX</span>
          </div>

          <button onclick="openProductDetail('${p.id}')" class="w-full bg-surface-variant hover:bg-primary-container hover:text-on-primary text-on-surface py-2 rounded-lg font-bold text-xs uppercase transition-colors flex items-center justify-center gap-1 mt-2">
            <span class="material-symbols-outlined text-[16px]">visibility</span> Ver Detalhes
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryName(catId) {
  const cat = currentCategorias.find(c => c.id === catId);
  return cat ? cat.nome : 'Hardware';
}

// Detalhes do Produto
function openProductDetail(prodId) {
  const p = currentProdutos.find(item => item.id === prodId);
  if (!p) return;

  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const calc = calculateProductPrice(p, currentPromocoes);
  const imgUrl = getProductImageUrl(p.foto_url);

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Imagem -->
      <div class="lg:col-span-5 bg-background border border-surface-variant rounded-2xl p-6 flex items-center justify-center relative">
        ${calc.temPromocao ? `
          <span class="absolute top-4 left-4 bg-primary-container text-on-primary font-black text-xs px-3 py-1 rounded-full uppercase flex items-center gap-1 shadow-lg">
            <span class="material-symbols-outlined text-[14px]">bolt</span> PROMOÇÃO ${calc.descontoPercentual}% OFF
          </span>
        ` : ''}
        <img src="${imgUrl}" alt="${p.nome}" class="max-h-80 object-contain">
      </div>

      <!-- Informações -->
      <div class="lg:col-span-7 space-y-6">
        <div>
          <span class="text-xs font-bold text-secondary-fixed uppercase tracking-wider">${getCategoryName(p.categoria_id)}</span>
          <h1 class="text-xl lg:text-3xl font-black text-on-surface uppercase mt-1 leading-tight">${p.nome}</h1>
          <p class="text-xs text-on-surface-variant mt-2">${p.descricao || 'Produto de alta performance com garantia nacional.'}</p>
        </div>

        <!-- Bloco de Preço -->
        <div class="bg-background border border-surface-variant rounded-2xl p-5 space-y-2">
          ${calc.temPromocao ? `
            <span class="text-xs text-on-surface-variant line-through block">De: ${formatCurrency(calc.precoOriginal)}</span>
          ` : ''}
          <div class="flex items-baseline gap-2">
            <span class="text-3xl lg:text-4xl font-black text-primary-container">${formatCurrency(calc.precoFinal)}</span>
            <span class="text-xs font-bold text-tertiary">à vista com 15% OFF no PIX</span>
          </div>
          <span class="text-xs text-on-surface-variant block">Ou 10x de ${formatCurrency(calc.precoOriginal / 10)} sem juros no cartão</span>
        </div>

        <!-- Ação Adicionar ao Carrinho -->
        <div class="flex flex-wrap items-center gap-4 pt-2">
          <div class="flex items-center border border-surface-variant rounded-xl bg-background overflow-hidden">
            <button onclick="adjustDetailQty(-1)" class="px-3 py-2 text-on-surface font-bold hover:bg-surface-variant">-</button>
            <input type="number" id="detail-qty-input" value="1" min="1" class="w-12 text-center bg-transparent text-sm font-bold text-on-surface focus:outline-none">
            <button onclick="adjustDetailQty(1)" class="px-3 py-2 text-on-surface font-bold hover:bg-surface-variant">+</button>
          </div>

          <button onclick="addDetailToCart('${p.id}')" class="flex-1 bg-primary-container text-on-primary py-3 px-6 rounded-xl font-black text-sm uppercase shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span>Adicionar ao Carrinho</span>
          </button>
        </div>
      </div>
    </div>
  `;

  showSection('product-detail');
}

function adjustDetailQty(delta) {
  const input = document.getElementById('detail-qty-input');
  if (input) {
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    input.value = val;
  }
}

function addDetailToCart(prodId) {
  const p = currentProdutos.find(item => item.id === prodId);
  if (!p) return;

  const input = document.getElementById('detail-qty-input');
  const qty = input ? parseInt(input.value) || 1 : 1;

  const calc = calculateProductPrice(p, currentPromocoes);
  CartState.addItem(p, calc.precoFinal, calc.promocao, qty);

  showToast(`${p.nome} adicionado ao carrinho!`);
  showSection('store-cart');
}

// Renderizar Carrinho de Compras
function renderCartView() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  if (CartState.items.length === 0) {
    container.innerHTML = `
      <div class="bg-surface-container-low border border-surface-variant rounded-2xl p-10 text-center space-y-4">
        <span class="material-symbols-outlined text-5xl text-on-surface-variant">remove_shopping_cart</span>
        <h3 class="text-lg font-bold">Seu carrinho está vazio</h3>
        <p class="text-xs text-on-surface-variant">Aproveite nossas promoções ninja e adicione componentes incríveis!</p>
        <button onclick="showSection('store-home')" class="bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-primary">
          Ir às Compras
        </button>
      </div>
    `;
  } else {
    container.innerHTML = CartState.items.map(item => {
      const imgUrl = getProductImageUrl(item.produto.foto_url);
      const subtotalItem = item.precoCalculado * item.quantidade;

      return `
        <div class="bg-surface-container-low border border-surface-variant rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4 w-full sm:w-auto">
            <img src="${imgUrl}" alt="${item.produto.nome}" class="w-16 h-16 object-contain bg-background rounded-lg p-1 border border-surface-variant shrink-0">
            <div>
              <h4 class="font-bold text-xs sm:text-sm text-on-surface line-clamp-2">${item.produto.nome}</h4>
              <span class="text-xs text-primary-container font-black block mt-1">${formatCurrency(item.precoCalculado)} un.</span>
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 border-surface-variant pt-2 sm:pt-0">
            <div class="flex items-center border border-surface-variant rounded-lg bg-background overflow-hidden">
              <button onclick="CartState.updateQuantity('${item.id}', -1); renderCartView();" class="px-2.5 py-1 text-on-surface font-bold hover:bg-surface-variant">-</button>
              <span class="px-3 text-xs font-bold">${item.quantidade}</span>
              <button onclick="CartState.updateQuantity('${item.id}', 1); renderCartView();" class="px-2.5 py-1 text-on-surface font-bold hover:bg-surface-variant">+</button>
            </div>

            <span class="font-black text-sm text-on-surface w-24 text-right">${formatCurrency(subtotalItem)}</span>

            <button onclick="CartState.removeItem('${item.id}'); renderCartView();" class="text-on-surface-variant hover:text-error transition-colors p-1" title="Remover item">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Atualiza Resumo de Preços
  const subtotal = CartState.getSubtotal();
  const desc = CartState.getDescontoCupom();
  const total = CartState.getTotal();

  document.getElementById('cart-subtotal-val').textContent = formatCurrency(subtotal);

  const discountRow = document.getElementById('cart-discount-row');
  const discountVal = document.getElementById('cart-discount-val');
  if (desc > 0) {
    discountRow.classList.remove('hidden');
    discountVal.textContent = `- ${formatCurrency(desc)}`;
  } else {
    discountRow.classList.add('hidden');
  }

  document.getElementById('cart-total-val').textContent = formatCurrency(total);
}

// Aplicação de Cupom no Carrinho
async function applyCupomCode() {
  const input = document.getElementById('cart-cupom-input');
  const feedback = document.getElementById('cupom-feedback-msg');
  if (!input || !feedback) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    feedback.className = "text-xs font-bold text-error mt-1";
    feedback.textContent = "Digite um código de cupom.";
    return;
  }

  feedback.textContent = "Validando cupom...";
  feedback.className = "text-xs font-bold text-on-surface-variant mt-1";

  try {
    const cupom = await SupabaseDB.getCupomByCodigo(code);
    if (!cupom || !cupom.ativo) {
      feedback.className = "text-xs font-bold text-error mt-1";
      feedback.textContent = "Cupom inválido ou inativo.";
      return;
    }

    // Checar expiração
    if (cupom.data_expiracao && new Date(cupom.data_expiracao) < new Date()) {
      feedback.className = "text-xs font-bold text-error mt-1";
      feedback.textContent = "Cupom expirado.";
      return;
    }

    // Checar limite de uso
    if (cupom.limite_uso && cupom.usos >= cupom.limite_uso) {
      feedback.className = "text-xs font-bold text-error mt-1";
      feedback.textContent = "Limite de uso deste cupom esgotado.";
      return;
    }

    CartState.cupom = cupom;
    CartState.save();
    renderCartView();

    feedback.className = "text-xs font-bold text-tertiary-container mt-1";
    feedback.textContent = `Cupom ${cupom.codigo} aplicado com sucesso!`;
  } catch (e) {
    console.error(e);
    feedback.className = "text-xs font-bold text-error mt-1";
    feedback.textContent = "Erro ao validar cupom.";
  }
}

function goToCheckout() {
  if (CartState.items.length === 0) {
    showToast('Adicione produtos ao carrinho antes de ir ao checkout.', 'error');
    return;
  }
  showSection('store-checkout');
}

// Renderizar Checkout
function renderCheckoutView() {
  const miniContainer = document.getElementById('checkout-items-mini');
  if (!miniContainer) return;

  miniContainer.innerHTML = CartState.items.map(i => `
    <div class="flex items-center justify-between text-xs border-b border-surface-variant/40 pb-2">
      <span class="font-medium text-on-surface truncate max-w-[200px]">${i.quantidade}x ${i.produto.nome}</span>
      <span class="font-bold text-on-surface">${formatCurrency(i.precoCalculado * i.quantidade)}</span>
    </div>
  `).join('');

  const subtotal = CartState.getSubtotal();
  const desc = CartState.getDescontoCupom();
  const total = CartState.getTotal();

  document.getElementById('chk-subtotal-val').textContent = formatCurrency(subtotal);

  const discountRow = document.getElementById('chk-discount-row');
  const discountVal = document.getElementById('chk-discount-val');
  if (desc > 0) {
    discountRow.classList.remove('hidden');
    discountVal.textContent = `- ${formatCurrency(desc)}`;
  } else {
    discountRow.classList.add('hidden');
  }

  document.getElementById('chk-total-val').textContent = formatCurrency(total);
}

// Submissão do Checkout
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (CartState.items.length === 0) {
    showToast('Seu carrinho está vazio!', 'error');
    return;
  }

  const nome = document.getElementById('chk-nome').value.trim();
  const email = document.getElementById('chk-email').value.trim();
  const cpfFormatted = document.getElementById('chk-cpf').value.trim();
  const telefoneFormatted = document.getElementById('chk-telefone').value.trim();

  const cpfClean = unmask(cpfFormatted);
  const telefoneClean = unmask(telefoneFormatted);

  if (!nome || !email || !cpfClean) {
    showToast('Preencha os campos obrigatórios do formulário.', 'error');
    return;
  }

  const btn = document.getElementById('btn-finish-order');
  btn.disabled = true;
  btn.textContent = 'Processando pedido...';

  try {
    // Check if client exists (searching with clean or formatted)
    let cliente = await SupabaseDB.getClienteByEmailOuCpf(email, cpfClean);

    if (!cliente) {
      // Create new client with unmasked numbers
      const newClientRes = await SupabaseDB.createCliente({
        id: crypto.randomUUID(),
        nome,
        email,
        cpf: cpfClean,
        telefone: telefoneClean
      });
      cliente = newClientRes[0];
    }

    const subtotal = CartState.getSubtotal();
    const desconto = CartState.getDescontoCupom();
    const total = CartState.getTotal();

    // Prepare Venda Data
    const vendaData = {
      id: crypto.randomUUID(),
      cliente_id: cliente.id,
      cupom_id: CartState.cupom ? CartState.cupom.id : null,
      valor_subtotal: subtotal,
      valor_desconto: desconto,
      valor_total: total,
      status: 'Aprovado'
    };

    // Prepare Itens
    const itensData = CartState.items.map(i => ({
      id: crypto.randomUUID(),
      produto_id: i.produto.id,
      quantidade: i.quantidade,
      preco_unitario: i.precoCalculado,
      preco_total: i.precoCalculado * i.quantidade
    }));

    await SupabaseDB.createVenda(vendaData, itensData);

    // Se usou cupom, incrementa usos
    if (CartState.cupom) {
      await SupabaseDB.updateCupom(CartState.cupom.id, {
        usos: (CartState.cupom.usos || 0) + 1
      });
    }

    showToast('Pedido realizado com sucesso! Obrigado pela compra.', 'success');
    CartState.clear();
    showSection('store-orders');
  } catch (err) {
    console.error(err);
    showToast('Ocorreu um erro ao processar o pedido.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Finalizar Compra Agora`;
  }
}

// Histórico de Pedidos
async function renderClientOrdersView() {
  const container = document.getElementById('client-orders-container');
  if (!container) return;

  container.innerHTML = '<p class="text-xs font-bold text-on-surface-variant">Carregando histórico de pedidos...</p>';

  try {
    const vendas = await SupabaseDB.getVendas();
    if (!vendas || vendas.length === 0) {
      container.innerHTML = `
        <div class="bg-surface-container-low border border-surface-variant rounded-2xl p-8 text-center text-on-surface-variant">
          Nenhum pedido encontrado.
        </div>
      `;
      return;
    }

    container.innerHTML = vendas.map(v => `
      <div class="bg-surface-container-low border border-surface-variant rounded-2xl p-5 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-variant/50 pb-3">
          <div>
            <span class="text-xs font-black uppercase text-primary-container">Pedido #${v.id.substring(0, 8)}</span>
            <span class="text-[10px] text-on-surface-variant block">${new Date(v.created_at).toLocaleString('pt-BR')}</span>
          </div>
          <span class="px-2.5 py-1 bg-tertiary-container/20 text-tertiary font-bold text-xs rounded-full uppercase">
            ${v.status || 'Aprovado'}
          </span>
        </div>

        <div class="flex flex-wrap justify-between items-center text-xs">
          <div>
            <span class="text-on-surface-variant block">Cliente: <strong>${v.clientes ? v.clientes.nome : 'Cliente N/A'}</strong></span>
            <span class="text-on-surface-variant block">E-mail: ${v.clientes ? v.clientes.email : '-'}</span>
          </div>
          <div class="text-right">
            <span class="text-on-surface-variant block">Total do Pedido:</span>
            <span class="text-base font-black text-primary-container">${formatCurrency(v.valor_total)}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p class="text-xs font-bold text-error">Erro ao carregar histórico de pedidos.</p>';
  }
}

// ==========================================
// MÓDULO PAINEL ADMINISTRATIVO (CRUDs)
// ==========================================

function switchAdminTab(tabName) {
  const tabs = ['produtos', 'categorias', 'promocoes', 'cupons', 'vendas', 'clientes'];
  tabs.forEach(t => {
    const view = document.getElementById(`adm-view-${t}`);
    const btn = document.getElementById(`tab-adm-${t}`);
    if (view) view.classList.add('hidden');
    if (btn) btn.className = "px-4 py-2 rounded-lg font-bold text-xs text-on-surface-variant hover:text-on-surface transition-colors";
  });

  const targetView = document.getElementById(`adm-view-${tabName}`);
  const targetBtn = document.getElementById(`tab-adm-${tabName}`);
  if (targetView) targetView.classList.remove('hidden');
  if (targetBtn) targetBtn.className = "px-4 py-2 rounded-lg font-bold text-xs transition-colors bg-primary-container text-on-primary";

  if (tabName === 'produtos') renderAdminProductsTable();
  if (tabName === 'categorias') renderAdminCategoriesTable();
  if (tabName === 'promocoes') renderAdminPromotionsTable();
  if (tabName === 'cupons') renderAdminCouponsTable();
  if (tabName === 'vendas') renderAdminSalesTable();
  if (tabName === 'clientes') renderAdminClientsTable();
}

// Table Renders
async function renderAdminProductsTable() {
  const tbody = document.getElementById('adm-table-produtos');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center">Carregando produtos...</td></tr>';
  currentProdutos = await SupabaseDB.getProdutos();

  if (!currentProdutos || currentProdutos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-on-surface-variant">Nenhum produto cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = currentProdutos.map(p => `
    <tr class="hover:bg-surface-variant/30 transition-colors">
      <td class="p-3">
        <img src="${getProductImageUrl(p.foto_url)}" class="w-10 h-10 object-contain rounded bg-background p-1 border border-surface-variant">
      </td>
      <td class="p-3 font-bold">${p.nome}</td>
      <td class="p-3">${getCategoryName(p.categoria_id)}</td>
      <td class="p-3 font-bold text-primary-container">${formatCurrency(p.preco)}</td>
      <td class="p-3">${p.estoque} un</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.ativo ? 'bg-tertiary-container/20 text-tertiary' : 'bg-error/20 text-error'}">
          ${p.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td class="p-3 text-right space-x-2">
        <button onclick="openProdutoModal('${p.id}')" class="text-secondary-fixed hover:underline font-bold">Editar</button>
        <button onclick="deleteProdutoAction('${p.id}')" class="text-error hover:underline font-bold">Excluir</button>
      </td>
    </tr>
  `).join('');
}

async function renderAdminCategoriesTable() {
  const tbody = document.getElementById('adm-table-categorias');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center">Carregando categorias...</td></tr>';
  currentCategorias = await SupabaseDB.getCategorias();

  if (!currentCategorias || currentCategorias.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-on-surface-variant">Nenhuma categoria cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = currentCategorias.map(c => `
    <tr class="hover:bg-surface-variant/30 transition-colors">
      <td class="p-3 font-bold">${c.nome}</td>
      <td class="p-3 text-on-surface-variant">${c.slug}</td>
      <td class="p-3">${c.descricao || '-'}</td>
      <td class="p-3 text-right space-x-2">
        <button onclick="openCategoriaModal('${c.id}')" class="text-secondary-fixed hover:underline font-bold">Editar</button>
        <button onclick="deleteCategoriaAction('${c.id}')" class="text-error hover:underline font-bold">Excluir</button>
      </td>
    </tr>
  `).join('');
}

async function renderAdminPromotionsTable() {
  const tbody = document.getElementById('adm-table-promocoes');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">Carregando promoções...</td></tr>';
  currentPromocoes = await SupabaseDB.getPromocoes();

  if (!currentPromocoes || currentPromocoes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Nenhuma promoção cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = currentPromocoes.map(p => {
    let target = 'Geral';
    if (p.produto_id) {
      const prod = currentProdutos.find(item => item.id === p.produto_id);
      target = prod ? `Produto: ${prod.nome}` : 'Produto';
    } else if (p.categoria_id) {
      target = `Categoria: ${getCategoryName(p.categoria_id)}`;
    }

    const exp = p.data_expiracao ? new Date(p.data_expiracao).toLocaleDateString('pt-BR') : 'Sem expiração';

    return `
      <tr class="hover:bg-surface-variant/30 transition-colors">
        <td class="p-3 font-bold">${p.nome}</td>
        <td class="p-3 font-black text-primary-container">${p.percentual_desconto}%</td>
        <td class="p-3 text-xs">${target}</td>
        <td class="p-3">${exp}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.ativo ? 'bg-tertiary-container/20 text-tertiary' : 'bg-error/20 text-error'}">
            ${p.ativo ? 'Ativa' : 'Inativa'}
          </span>
        </td>
        <td class="p-3 text-right space-x-2">
          <button onclick="openPromocaoModal('${p.id}')" class="text-secondary-fixed hover:underline font-bold">Editar</button>
          <button onclick="deletePromocaoAction('${p.id}')" class="text-error hover:underline font-bold">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function renderAdminCouponsTable() {
  const tbody = document.getElementById('adm-table-cupons');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">Carregando cupons...</td></tr>';
  currentCupons = await SupabaseDB.getCupons();

  if (!currentCupons || currentCupons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Nenhum cupom cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = currentCupons.map(c => {
    const desc = c.percentual_desconto ? `${c.percentual_desconto}%` : formatCurrency(c.valor_desconto);
    const exp = c.data_expiracao ? new Date(c.data_expiracao).toLocaleDateString('pt-BR') : 'Sem data';

    return `
      <tr class="hover:bg-surface-variant/30 transition-colors">
        <td class="p-3 font-black text-primary-container uppercase">${c.codigo}</td>
        <td class="p-3 font-bold">${desc}</td>
        <td class="p-3">${c.usos} / ${c.limite_uso}</td>
        <td class="p-3">${exp}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.ativo ? 'bg-tertiary-container/20 text-tertiary' : 'bg-error/20 text-error'}">
            ${c.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td class="p-3 text-right space-x-2">
          <button onclick="openCupomModal('${c.id}')" class="text-secondary-fixed hover:underline font-bold">Editar</button>
          <button onclick="deleteCupomAction('${c.id}')" class="text-error hover:underline font-bold">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function renderAdminSalesTable() {
  const tbody = document.getElementById('adm-table-vendas');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center">Carregando vendas...</td></tr>';
  const vendas = await SupabaseDB.getVendas();

  if (!vendas || vendas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-on-surface-variant">Nenhuma venda registrada.</td></tr>';
    return;
  }

  tbody.innerHTML = vendas.map(v => `
    <tr class="hover:bg-surface-variant/30 transition-colors">
      <td class="p-3 font-bold">
        #${v.id.substring(0, 8)}
        <span class="block text-[10px] text-on-surface-variant font-normal">${new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
      </td>
      <td class="p-3">${v.clientes ? v.clientes.nome : 'N/A'}</td>
      <td class="p-3">${formatCurrency(v.valor_subtotal)}</td>
      <td class="p-3 text-tertiary font-bold">${formatCurrency(v.valor_desconto)}</td>
      <td class="p-3 font-black text-primary-container">${formatCurrency(v.valor_total)}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container/20 text-tertiary uppercase">
          ${v.status || 'Aprovado'}
        </span>
      </td>
      <td class="p-3 text-right">
        <button onclick="viewVendaDetails('${v.id}')" class="text-secondary-fixed hover:underline font-bold">Itens</button>
      </td>
    </tr>
  `).join('');
}

async function renderAdminClientsTable() {
  const tbody = document.getElementById('adm-table-clientes');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Carregando clientes...</td></tr>';
  try {
    const clientes = await SupabaseDB.getClientes();
    if (clientes && clientes.length > 0) {
      currentClientes = clientes;
    }
  } catch (e) {
    console.warn('Falha ao buscar clientes do Supabase, usando lista local:', e);
  }

  if (!currentClientes || currentClientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-on-surface-variant">Nenhum cliente cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = currentClientes.map(c => `
    <tr class="hover:bg-surface-variant/30 transition-colors">
      <td class="p-3 font-bold">${c.nome}</td>
      <td class="p-3">${c.email}</td>
      <td class="p-3">${c.cpf ? maskCPF(c.cpf) : '-'}</td>
      <td class="p-3">${c.telefone ? maskPhone(c.telefone) : '-'}</td>
      <td class="p-3">${c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-'}</td>
    </tr>
  `).join('');
}

// Modal e Handler Cadastro de Cliente no Admin
function openClienteModal() {
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.textContent = 'Cadastrar Novo Cliente';

  body.innerHTML = `
    <form onsubmit="saveClienteForm(event)" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold mb-1">Nome Completo *</label>
        <input type="text" id="f-cli-nome" required placeholder="Ex: Maria Souza" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
      </div>

      <div>
        <label class="block font-bold mb-1">E-mail *</label>
        <input type="email" id="f-cli-email" required placeholder="cliente@email.com" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">CPF *</label>
          <input type="text" id="f-cli-cpf" required placeholder="000.000.000-00" class="cpf-mask w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
        </div>
        <div>
          <label class="block font-bold mb-1">Telefone / WhatsApp</label>
          <input type="tel" id="f-cli-tel" placeholder="(11) 99999-9999" class="phone-mask w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
        </div>
      </div>

      <div class="pt-3 border-t border-surface-variant flex justify-end gap-2">
        <button type="button" onclick="closeAdminModal()" class="px-4 py-2 rounded-lg bg-surface-variant font-bold">Cancelar</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-bold">Salvar Cliente</button>
      </div>
    </form>
  `;

  document.getElementById('admin-modal').classList.remove('hidden');
}

async function saveClienteForm(e) {
  e.preventDefault();
  const nome = document.getElementById('f-cli-nome').value.trim();
  const email = document.getElementById('f-cli-email').value.trim();
  const cpfFormatted = document.getElementById('f-cli-cpf').value.trim();
  const telFormatted = document.getElementById('f-cli-tel').value.trim();

  const cpfClean = unmask(cpfFormatted);
  const telClean = unmask(telFormatted);

  if (!nome || !email || !cpfClean) {
    showToast('Preencha os campos obrigatórios do cliente.', 'error');
    return;
  }

  try {
    const data = {
      id: crypto.randomUUID(),
      nome,
      email,
      cpf: cpfClean,
      telefone: telClean,
      created_at: new Date().toISOString()
    };

    try {
      await SupabaseDB.createCliente(data);
    } catch (dbErr) {
      console.warn('Criação remota de cliente falhou (usando confirmação local):', dbErr);
    }

    currentClientes.unshift(data);
    showToast('Cliente cadastrado com sucesso!');
    closeAdminModal();
    renderAdminClientsTable();
  } catch (err) {
    console.error(err);
    showToast('Erro ao cadastrar cliente.', 'error');
  }
}

// Modal e Handlers CRUD PRODUTOS
function openProdutoModal(prodId = null) {
  const prod = prodId ? currentProdutos.find(p => p.id === prodId) : null;
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.textContent = prod ? 'Editar Produto' : 'Novo Produto';

  body.innerHTML = `
    <form onsubmit="saveProdutoForm(event, '${prodId || ''}')" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold mb-1">Nome do Produto *</label>
        <input type="text" id="f-prod-nome" required value="${prod ? prod.nome : ''}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">Preço (R$) *</label>
          <input type="number" step="0.01" id="f-prod-preco" required value="${prod ? prod.preco : ''}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
        </div>
        <div>
          <label class="block font-bold mb-1">Estoque *</label>
          <input type="number" id="f-prod-estoque" required value="${prod ? prod.estoque : '10'}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">Categoria *</label>
        <select id="f-prod-categoria" required class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
          ${currentCategorias.map(c => `<option value="${c.id}" ${prod && prod.categoria_id === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
        </select>
      </div>

      <div>
        <label class="block font-bold mb-1">URL da Foto (Link da Imagem)</label>
        <input type="text" id="f-prod-foto" placeholder="https://..." value="${prod ? prod.foto_url || '' : ''}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
      </div>

      <div>
        <label class="block font-bold mb-1">Descrição</label>
        <textarea id="f-prod-desc" rows="3" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">${prod ? prod.descricao || '' : ''}</textarea>
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" id="f-prod-ativo" ${!prod || prod.ativo ? 'checked' : ''} class="accent-primary-container">
        <label for="f-prod-ativo" class="font-bold">Produto Ativo</label>
      </div>

      <div class="pt-3 border-t border-surface-variant flex justify-end gap-2">
        <button type="button" onclick="closeAdminModal()" class="px-4 py-2 rounded-lg bg-surface-variant font-bold">Cancelar</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-bold">Salvar Produto</button>
      </div>
    </form>
  `;

  document.getElementById('admin-modal').classList.remove('hidden');
}

async function saveProdutoForm(e, prodId) {
  e.preventDefault();
  const data = {
    nome: document.getElementById('f-prod-nome').value.trim(),
    preco: parseFloat(document.getElementById('f-prod-preco').value),
    estoque: parseInt(document.getElementById('f-prod-estoque').value),
    categoria_id: document.getElementById('f-prod-categoria').value,
    foto_url: document.getElementById('f-prod-foto').value.trim() || null,
    descricao: document.getElementById('f-prod-desc').value.trim(),
    ativo: document.getElementById('f-prod-ativo').checked
  };

  try {
    if (prodId) {
      // Atualiza localmente no array imediato para garantir reatividade instantânea
      const idx = currentProdutos.findIndex(p => p.id === prodId);
      if (idx !== -1) {
        currentProdutos[idx] = { ...currentProdutos[idx], ...data };
      }

      // Atualiza o carrinho se o item alterado estiver no carrinho
      CartState.items.forEach(ci => {
        if (ci.id === prodId) {
          ci.produto.nome = data.nome;
          ci.produto.preco = data.preco;
          ci.produto.foto_url = data.foto_url;
        }
      });
      CartState.save();

      try {
        await SupabaseDB.updateProduto(prodId, data);
      } catch (dbErr) {
        console.warn('Atualização remota Supabase falhou (usando estado atualizado):', dbErr);
      }
      showToast('Produto atualizado!');
    } else {
      data.id = crypto.randomUUID();
      let created = false;
      try {
        await SupabaseDB.createProduto(data);
        created = true;
      } catch (dbErr) {
        console.warn('Criação remota Supabase falhou (adicionando ao estado local):', dbErr);
      }
      currentProdutos.unshift(data);
      showToast('Produto criado com sucesso!');
    }

    closeAdminModal();
    renderAdminProductsTable();
    renderStoreProducts();
  } catch (err) {
    console.error(err);
    showToast('Erro ao salvar produto.', 'error');
  }
}

async function deleteProdutoAction(prodId) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      await SupabaseDB.deleteProduto(prodId);
      showToast('Produto excluído!');
      renderAdminProductsTable();
      loadInitialData();
    } catch (e) {
      showToast('Erro ao excluir produto.', 'error');
    }
  }
}

// Modal e Handlers CRUD CATEGORIAS
function openCategoriaModal(catId = null) {
  const cat = catId ? currentCategorias.find(c => c.id === catId) : null;
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.textContent = cat ? 'Editar Categoria' : 'Nova Categoria';

  body.innerHTML = `
    <form onsubmit="saveCategoriaForm(event, '${catId || ''}')" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold mb-1">Nome da Categoria *</label>
        <input type="text" id="f-cat-nome" required value="${cat ? cat.nome : ''}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
      </div>

      <div>
        <label class="block font-bold mb-1">Slug (Identificador URL) *</label>
        <input type="text" id="f-cat-slug" required value="${cat ? cat.slug : ''}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
      </div>

      <div>
        <label class="block font-bold mb-1">Descrição</label>
        <textarea id="f-cat-desc" rows="3" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">${cat ? cat.descricao || '' : ''}</textarea>
      </div>

      <div class="pt-3 border-t border-surface-variant flex justify-end gap-2">
        <button type="button" onclick="closeAdminModal()" class="px-4 py-2 rounded-lg bg-surface-variant font-bold">Cancelar</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-bold">Salvar Categoria</button>
      </div>
    </form>
  `;

  document.getElementById('admin-modal').classList.remove('hidden');
}

async function saveCategoriaForm(e, catId) {
  e.preventDefault();
  const data = {
    nome: document.getElementById('f-cat-nome').value.trim(),
    slug: document.getElementById('f-cat-slug').value.trim().toLowerCase(),
    descricao: document.getElementById('f-cat-desc').value.trim()
  };

  try {
    if (catId) {
      await SupabaseDB.updateCategoria(catId, data);
      showToast('Categoria atualizada!');
    } else {
      data.id = crypto.randomUUID();
      await SupabaseDB.createCategoria(data);
      showToast('Categoria criada!');
    }
    closeAdminModal();
    renderAdminCategoriesTable();
    loadInitialData();
  } catch (err) {
    showToast('Erro ao salvar categoria.', 'error');
  }
}

async function deleteCategoriaAction(catId) {
  if (confirm('Tem certeza que deseja excluir esta categoria?')) {
    try {
      await SupabaseDB.deleteCategoria(catId);
      showToast('Categoria excluída!');
      renderAdminCategoriesTable();
      loadInitialData();
    } catch (e) {
      showToast('Erro ao excluir categoria.', 'error');
    }
  }
}

// Modal e Handlers CRUD PROMOÇÕES
function openPromocaoModal(promoId = null) {
  const promo = promoId ? currentPromocoes.find(p => p.id === promoId) : null;
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.textContent = promo ? 'Editar Promoção' : 'Nova Promoção com Expiração';

  const expFormatted = promo && promo.data_expiracao ? new Date(promo.data_expiracao).toISOString().slice(0, 16) : '';

  body.innerHTML = `
    <form onsubmit="savePromocaoForm(event, '${promoId || ''}')" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold mb-1">Título da Promoção *</label>
        <input type="text" id="f-promo-nome" required value="${promo ? promo.nome : ''}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">Desconto (%) *</label>
          <input type="number" step="0.1" id="f-promo-desc" required value="${promo ? promo.percentual_desconto : '10'}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
        </div>
        <div>
          <label class="block font-bold mb-1">Data Expiração *</label>
          <input type="datetime-local" id="f-promo-exp" required value="${expFormatted}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">Aplicar Específico para Produto (Opcional)</label>
        <select id="f-promo-prod" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
          <option value="">Nenhum (Geral / Por Categoria)</option>
          ${currentProdutos.map(p => `<option value="${p.id}" ${promo && promo.produto_id === p.id ? 'selected' : ''}>${p.nome}</option>`).join('')}
        </select>
      </div>

      <div>
        <label class="block font-bold mb-1">Aplicar para Categoria inteira (Opcional)</label>
        <select id="f-promo-cat" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
          <option value="">Nenhuma</option>
          ${currentCategorias.map(c => `<option value="${c.id}" ${promo && promo.categoria_id === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
        </select>
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" id="f-promo-ativo" ${!promo || promo.ativo ? 'checked' : ''} class="accent-primary-container">
        <label for="f-promo-ativo" class="font-bold">Promoção Ativa</label>
      </div>

      <div class="pt-3 border-t border-surface-variant flex justify-end gap-2">
        <button type="button" onclick="closeAdminModal()" class="px-4 py-2 rounded-lg bg-surface-variant font-bold">Cancelar</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-bold">Salvar Promoção</button>
      </div>
    </form>
  `;

  document.getElementById('admin-modal').classList.remove('hidden');
}

async function savePromocaoForm(e, promoId) {
  e.preventDefault();
  const data = {
    nome: document.getElementById('f-promo-nome').value.trim(),
    percentual_desconto: parseFloat(document.getElementById('f-promo-desc').value),
    data_expiracao: new Date(document.getElementById('f-promo-exp').value).toISOString(),
    produto_id: document.getElementById('f-promo-prod').value || null,
    categoria_id: document.getElementById('f-promo-cat').value || null,
    ativo: document.getElementById('f-promo-ativo').checked
  };

  try {
    if (promoId) {
      // Atualiza estado local de promoções para reatividade
      const idx = currentPromocoes.findIndex(p => p.id === promoId);
      if (idx !== -1) {
        currentPromocoes[idx] = { ...currentPromocoes[idx], ...data };
      }
      try {
        await SupabaseDB.updatePromocao(promoId, data);
      } catch (dbErr) {
        console.warn('Atualização remota Supabase da promoção falhou (usando estado atualizado):', dbErr);
      }
      showToast('Promoção atualizada com sucesso!');
    } else {
      data.id = crypto.randomUUID();
      try {
        await SupabaseDB.createPromocao(data);
      } catch (dbErr) {
        console.warn('Criação remota Supabase da promoção falhou (adicionando ao estado local):', dbErr);
      }
      currentPromocoes.unshift(data);
      showToast('Promoção criada com sucesso!');
    }

    closeAdminModal();
    renderAdminPromotionsTable();
    renderStoreProducts();
  } catch (err) {
    console.error(err);
    showToast('Erro ao salvar promoção.', 'error');
  }
}

async function deletePromocaoAction(promoId) {
  if (confirm('Deseja remover esta promoção?')) {
    try {
      await SupabaseDB.deletePromocao(promoId);
      showToast('Promoção excluída!');
      renderAdminPromotionsTable();
      loadInitialData();
    } catch (e) {
      showToast('Erro ao excluir promoção.', 'error');
    }
  }
}

// Modal e Handlers CRUD CUPONS
function openCupomModal(cupomId = null) {
  const cupom = cupomId ? currentCupons.find(c => c.id === cupomId) : null;
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.textContent = cupom ? 'Editar Cupom' : 'Novo Cupom de Desconto';

  body.innerHTML = `
    <form onsubmit="saveCupomForm(event, '${cupomId || ''}')" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold mb-1">Código do Cupom *</label>
        <input type="text" id="f-cupom-codigo" required uppercase value="${cupom ? cupom.codigo : ''}" class="w-full bg-background border border-surface-variant rounded-lg p-2 uppercase text-on-surface">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">Percentual (%)</label>
          <input type="number" step="0.1" id="f-cupom-perc" value="${cupom ? cupom.percentual_desconto || '' : '10'}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
        </div>
        <div>
          <label class="block font-bold mb-1">Limite de Usos *</label>
          <input type="number" id="f-cupom-limite" required value="${cupom ? cupom.limite_uso : '100'}" class="w-full bg-background border border-surface-variant rounded-lg p-2 text-on-surface">
        </div>
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" id="f-cupom-ativo" ${!cupom || cupom.ativo ? 'checked' : ''} class="accent-primary-container">
        <label for="f-cupom-ativo" class="font-bold">Cupom Ativo</label>
      </div>

      <div class="pt-3 border-t border-surface-variant flex justify-end gap-2">
        <button type="button" onclick="closeAdminModal()" class="px-4 py-2 rounded-lg bg-surface-variant font-bold">Cancelar</button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-bold">Salvar Cupom</button>
      </div>
    </form>
  `;

  document.getElementById('admin-modal').classList.remove('hidden');
}

async function saveCupomForm(e, cupomId) {
  e.preventDefault();
  const data = {
    codigo: document.getElementById('f-cupom-codigo').value.trim().toUpperCase(),
    percentual_desconto: parseFloat(document.getElementById('f-cupom-perc').value) || null,
    limite_uso: parseInt(document.getElementById('f-cupom-limite').value),
    ativo: document.getElementById('f-cupom-ativo').checked
  };

  try {
    if (cupomId) {
      await SupabaseDB.updateCupom(cupomId, data);
      showToast('Cupom atualizado!');
    } else {
      data.id = crypto.randomUUID();
      await SupabaseDB.createCupom(data);
      showToast('Cupom criado!');
    }
    closeAdminModal();
    renderAdminCouponsTable();
    loadInitialData();
  } catch (err) {
    showToast('Erro ao salvar cupom.', 'error');
  }
}

async function deleteCupomAction(cupomId) {
  if (confirm('Deseja excluir este cupom?')) {
    try {
      await SupabaseDB.deleteCupom(cupomId);
      showToast('Cupom excluído!');
      renderAdminCouponsTable();
      loadInitialData();
    } catch (e) {
      showToast('Erro ao excluir cupom.', 'error');
    }
  }
}

// Modal Detalhes de Venda
async function viewVendaDetails(vendaId) {
  const body = document.getElementById('venda-details-body');
  body.innerHTML = 'Carregando itens...';

  document.getElementById('venda-details-modal').classList.remove('hidden');

  try {
    const itens = await SupabaseDB.getItensVenda(vendaId);
    if (!itens || itens.length === 0) {
      body.innerHTML = 'Nenhum item registrado para esta venda.';
      return;
    }

    body.innerHTML = itens.map(i => `
      <div class="flex items-center justify-between border-b border-surface-variant pb-2">
        <div>
          <span class="font-bold block">${i.produtos ? i.produtos.nome : 'Produto'}</span>
          <span class="text-[10px] text-on-surface-variant">${i.quantidade}x ${formatCurrency(i.preco_unitario)}</span>
        </div>
        <span class="font-black text-primary-container">${formatCurrency(i.preco_total)}</span>
      </div>
    `).join('');
  } catch (e) {
    body.innerHTML = 'Erro ao carregar detalhes.';
  }
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.add('hidden');
}
