// Configuração e Cliente REST Supabase
const SUPABASE_URL = 'https://nmpxtewhyxaepxbscaba.supabase.co/rest/v1';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3BvWUkAMtyphYr8nCJ_6MQ_78Eij1I1';

const supabaseHeaders = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_PUBLISHABLE_KEY,
  'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Prefer': 'return=representation'
};

async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}${endpoint}`;
  const headers = { ...supabaseHeaders, ...options.headers };
  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API (${response.status}): ${errorText}`);
    }
    // Se a resposta for 204 No Content, não faz parse json
    if (response.status === 204) return true;
    return await response.json();
  } catch (err) {
    console.error('Supabase REST Error:', err);
    throw err;
  }
}

// API Methods
const SupabaseDB = {
  // Categorias
  async getCategorias() {
    return await supabaseFetch('/categorias?order=nome.asc');
  },
  async createCategoria(data) {
    return await supabaseFetch('/categorias', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateCategoria(id, data) {
    return await supabaseFetch(`/categorias?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  async deleteCategoria(id) {
    return await supabaseFetch(`/categorias?id=eq.${id}`, {
      method: 'DELETE'
    });
  },

  // Produtos
  async getProdutos() {
    return await supabaseFetch('/produtos?order=created_at.desc');
  },
  async getProdutoById(id) {
    const res = await supabaseFetch(`/produtos?id=eq.${id}`);
    return res && res.length > 0 ? res[0] : null;
  },
  async createProduto(data) {
    return await supabaseFetch('/produtos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateProduto(id, data) {
    return await supabaseFetch(`/produtos?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  async deleteProduto(id) {
    return await supabaseFetch(`/produtos?id=eq.${id}`, {
      method: 'DELETE'
    });
  },

  // Cupons
  async getCupons() {
    return await supabaseFetch('/cupons?order=created_at.desc');
  },
  async getCupomByCodigo(codigo) {
    const res = await supabaseFetch(`/cupons?codigo=eq.${encodeURIComponent(codigo)}`);
    return res && res.length > 0 ? res[0] : null;
  },
  async createCupom(data) {
    return await supabaseFetch('/cupons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateCupom(id, data) {
    return await supabaseFetch(`/cupons?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  async deleteCupom(id) {
    return await supabaseFetch(`/cupons?id=eq.${id}`, {
      method: 'DELETE'
    });
  },

  // Promoções
  async getPromocoes() {
    return await supabaseFetch('/promocoes?order=created_at.desc');
  },
  async createPromocao(data) {
    return await supabaseFetch('/promocoes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updatePromocao(id, data) {
    return await supabaseFetch(`/promocoes?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  async deletePromocao(id) {
    return await supabaseFetch(`/promocoes?id=eq.${id}`, {
      method: 'DELETE'
    });
  },

  // Clientes
  async getClientes() {
    return await supabaseFetch('/clientes?order=created_at.desc');
  },
  async getClienteByEmailOuCpf(email, cpf) {
    let query = `/clientes?or=(email.eq.${encodeURIComponent(email)}`;
    if (cpf) {
      query += `,cpf.eq.${encodeURIComponent(cpf)}`;
    }
    query += ')';
    const res = await supabaseFetch(query);
    return res && res.length > 0 ? res[0] : null;
  },
  async createCliente(data) {
    return await supabaseFetch('/clientes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateCliente(id, data) {
    return await supabaseFetch(`/clientes?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Vendas
  async getVendas() {
    return await supabaseFetch('/vendas?select=*,clientes(*),cupons(*)&order=created_at.desc');
  },
  async getItensVenda(vendaId) {
    return await supabaseFetch(`/itens_venda?venda_id=eq.${vendaId}&select=*,produtos(*)`);
  },
  async createVenda(vendaData, itensData) {
    // Insere a venda
    const vendaRes = await supabaseFetch('/vendas', {
      method: 'POST',
      body: JSON.stringify(vendaData)
    });
    const venda = vendaRes[0];

    // Insere os itens
    const itensComVendaId = itensData.map(item => ({
      ...item,
      venda_id: venda.id
    }));

    await supabaseFetch('/itens_venda', {
      method: 'POST',
      body: JSON.stringify(itensComVendaId)
    });

    return venda;
  }
};
