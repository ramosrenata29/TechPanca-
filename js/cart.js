// Módulo do Carrinho e Estado do Cliente
const CartState = {
  items: [], // [{ id, produto, quantidade, precoCalculado, descontoPercentual }]
  cupom: null, // { id, codigo, percentual_desconto, valor_desconto }

  init() {
    try {
      const saved = localStorage.getItem('techpanca_cart');
      if (saved) {
        this.items = JSON.parse(saved);
      }
      const savedCupom = localStorage.getItem('techpanca_cupom');
      if (savedCupom) {
        this.cupom = JSON.parse(savedCupom);
      }
    } catch (e) {
      console.error('Erro ao ler carrinho do localStorage:', e);
      this.items = [];
    }
    this.updateCartCountUI();
  },

  save() {
    localStorage.setItem('techpanca_cart', JSON.stringify(this.items));
    if (this.cupom) {
      localStorage.setItem('techpanca_cupom', JSON.stringify(this.cupom));
    } else {
      localStorage.removeItem('techpanca_cupom');
    }
    this.updateCartCountUI();
  },

  addItem(produto, precoCalculado, promocao = null, qty = 1) {
    const existingIndex = this.items.findIndex(i => i.id === produto.id);
    if (existingIndex > -1) {
      this.items[existingIndex].quantidade += qty;
    } else {
      this.items.push({
        id: produto.id,
        produto: produto,
        quantidade: qty,
        precoOriginal: Number(produto.preco),
        precoCalculado: Number(precoCalculado),
        promocao: promocao
      });
    }
    this.save();
  },

  updateQuantity(produtoId, delta) {
    const item = this.items.find(i => i.id === produtoId);
    if (item) {
      item.quantidade += delta;
      if (item.quantidade <= 0) {
        this.removeItem(produtoId);
      } else {
        this.save();
      }
    }
  },

  removeItem(produtoId) {
    this.items = this.items.filter(i => i.id !== produtoId);
    this.save();
  },

  clear() {
    this.items = [];
    this.cupom = null;
    localStorage.removeItem('techpanca_cart');
    localStorage.removeItem('techpanca_cupom');
    this.updateCartCountUI();
  },

  getSubtotal() {
    return this.items.reduce((acc, i) => acc + (i.precoCalculado * i.quantidade), 0);
  },

  getDescontoCupom() {
    if (!this.cupom) return 0;
    const subtotal = this.getSubtotal();
    if (this.cupom.percentual_desconto) {
      return (subtotal * Number(this.cupom.percentual_desconto)) / 100;
    }
    if (this.cupom.valor_desconto) {
      return Math.min(subtotal, Number(this.cupom.valor_desconto));
    }
    return 0;
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    const desc = this.getDescontoCupom();
    return Math.max(0, subtotal - desc);
  },

  updateCartCountUI() {
    const totalQty = this.items.reduce((acc, i) => acc + i.quantidade, 0);
    const badges = document.querySelectorAll('.cart-badge-count');
    badges.forEach(b => {
      b.textContent = totalQty;
    });
    const cartLabels = document.querySelectorAll('.cart-label-qty');
    cartLabels.forEach(l => {
      l.textContent = `${totalQty} ITEM${totalQty === 1 ? '' : 'S'}`;
    });
  }
};

// Formatação de Dinheiro
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Resolução de Foto de Produto
function getProductImageUrl(foto_url) {
  if (!foto_url) return 'https://placehold.co/400x400/121c2a/ff6500?text=TechPanca';
  if (foto_url.startsWith('http://') || foto_url.startsWith('https://') || foto_url.startsWith('data:')) {
    return foto_url;
  }
  // Mapeamento de imagens de amostra caso venha nome relativo
  const sampleMap = {
    'rtx-4060.jpg': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    'ryzen-7-5700x.jpg': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
    'teclado-kumara.jpg': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    'rato-g203.jpg': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    'monitor-lg.jpg': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'
  };
  return sampleMap[foto_url] || 'https://placehold.co/400x400/121c2a/ff6500?text=TechPanca';
}

// Cálculo de Preço com Promoção Ativa
function calculateProductPrice(produto, promocoes = []) {
  const now = new Date();
  const precoOriginal = Number(produto.preco);

  // Procura promoção específica do produto ou da categoria
  const promo = promocoes.find(p => {
    if (!p.ativo) return false;
    if (p.data_expiracao && new Date(p.data_expiracao) < now) return false;
    if (p.produto_id && p.produto_id === produto.id) return true;
    if (p.categoria_id && p.categoria_id === produto.categoria_id && !p.produto_id) return true;
    return false;
  });

  if (promo) {
    const descPercent = Number(promo.percentual_desconto || 0);
    const precoComDesconto = precoOriginal * (1 - descPercent / 100);
    return {
      precoOriginal,
      precoFinal: precoComDesconto,
      temPromocao: true,
      descontoPercentual: descPercent,
      promocao: promo
    };
  }

  return {
    precoOriginal,
    precoFinal: precoOriginal,
    temPromocao: false,
    descontoPercentual: 0,
    promocao: null
  };
}

// Sistema de Notificações Toast
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'error' ? 'bg-error text-on-error' : 'bg-tertiary-container text-on-tertiary-container';
  toast.className = `${bgColor} px-4 py-3 rounded-lg shadow-xl font-headline-sm text-body-md flex items-center gap-2 transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto`;
  toast.innerHTML = `
    <span class="material-symbols-outlined">${type === 'error' ? 'error' : 'check_circle'}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
