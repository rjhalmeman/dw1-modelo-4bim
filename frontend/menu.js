const API_BASE_URL = 'http://localhost:3001';
// DICA: Se no seu app.js você definiu as rotas de imagem com um prefixo (ex: app.use('/imagem', imageRoutes)),
// você deve ajustar aqui. Vou assumir que está na raiz ou precisamos ajustar o prefixo abaixo.
const API_IMAGEM_PREFIX = '/view-image';

const carrosselWrapper = document.getElementById('carrossel-wrapper');
const contadorCarrinho = document.getElementById('contadorCarrinho');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function handleUserAction(action) {
  if (action === "sair") {
    logout();
  }
}

// A função 'logout' original
async function logout() {
  try {
    const res = await fetch(API_BASE_URL + '/login/logout', {
      credentials: 'include'
    });

    const data = await res.json();
    console.log("Resposta do servidor após logout:", data);

    if (data.status === 'ok') {
      console.log("Logout bem-sucedido.");
      document.getElementById("oUsuario").options[0].text = `Usuário`;
      window.location.href = "../login/login.html";
      return true;

    } else {
      window.location.href = "../login/login.html";
      return false;
    }

  } catch (error) {
    console.error("Erro ao tentar fazer logout:", error);
    window.location.href = "../login/login.html";
    return false;
  }
}

async function verificarAutorizacao() {
  try {
    const res = await fetch(API_BASE_URL + '/login/verificaSeUsuarioEstaLogado', {
      credentials: 'include'
    });

    const data = await res.json();

    if (data.status === 'ok') {
      document.getElementById("oUsuario").options[0].text = `${data.usuario}`;
      return true;
    } else {
      console.log("Usuário não logado, redirecionando...");
      window.location.href = "../login/login.html";
    }
  } catch (error) {
    console.error("Erro ao verificar login:", error);
    return false;
  }
}

// Atualiza contador do carrinho
function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
  contadorCarrinho.textContent = carrinho.length;
}

// Criação dos cards
function criarCardProduto(produto) {
  const card = document.createElement('div');
  card.classList.add('produto-card');

  // --- CORREÇÃO AQUI ---
  // Usamos a rota criada no Node.js (router.get('/view-image/:produtoId'))
  // Adiciona um timestamp (?v=...) para evitar cache se a imagem mudar
  const caminhoImagem = `${API_BASE_URL}${API_IMAGEM_PREFIX}/${produto.id_produto}`;

  // Imagem padrão caso falhe o carregamento ou não exista
  const imagemPlaceholder = 'https://via.placeholder.com/200?text=Sem+Imagem';

  const precoFormatado = parseFloat(produto.preco_unitario_produto).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  // Adicionado onerror na tag img para lidar com produtos sem foto
  card.innerHTML = `
    <img src="${caminhoImagem}" 
         alt="${produto.nome_produto}" 
         class="card-imagem"
         onerror="this.onerror=null; this.src='${imagemPlaceholder}';">
         
    <div class="card-titulo">${produto.nome_produto}</div>
    <div class="card-detalhe">ID: ${produto.id_produto}</div>
    <div class="card-detalhe">Estoque: ${produto.quantidade_estoque_produto}</div>
    <div class="card-preco">${precoFormatado} / Kg</div>
    <div class="card-selecao-quantidade">
      <label for="qtd-${produto.id_produto}">Peso (g):</label>
      <input type="number" id="qtd-${produto.id_produto}" class="input-quantidade" value="100" min="10" step="10" data-produto-id="${produto.id_produto}">
    </div>
    <button class="btn-carrinho" data-produto-id="${produto.id_produto}">Adicionar ao Carrinho</button>
  `;
  return card;
}

// Adicionar ao carrinho
function adicionarAoCarrinho(produtoId) {
  const inputQtd = document.querySelector(`.input-quantidade[data-produto-id="${produtoId}"]`);
  const quantidadeGramas = parseInt(inputQtd.value);

  if (isNaN(quantidadeGramas) || quantidadeGramas < 10) {
    alert('Por favor, insira uma quantidade válida (mínimo 10g).');
    return;
  }

  // --- CORREÇÃO DA URL DE FETCH ---
  // Antes estava: API_BASE_URL + produtoId (ex: localhost:30011)
  // Agora está: localhost:3001/produto/1
  fetch(`${API_BASE_URL}/produto/${produtoId}`)
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar produto");
      return res.json();
    })
    .then(produtoAPI => {
      const item = {
        id: produtoAPI.id_produto,
        nome: produtoAPI.nome_produto,
        preco: produtoAPI.preco_unitario_produto,
        quantidade: quantidadeGramas
      };

      let carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
      const existente = carrinho.find(i => i.id === item.id);

      if (existente) {
        existente.quantidade += quantidadeGramas;
      } else {
        carrinho.push(item);
      }

      sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
      atualizarContadorCarrinho();
      //alert("Produto adicionado ao carrinho!"); // Feedback visual
    })
    .catch((erro) => {
      console.error(erro);
      alert("Erro ao adicionar ao carrinho.");
    });
}

// Renderizar os produtos
function renderizarProdutos(dados) {
  carrosselWrapper.innerHTML = '';

  // Verifica se dados é um array antes de tentar fazer forEach
  if (Array.isArray(dados)) {
    dados.forEach(p => {
      const card = criarCardProduto(p);
      carrosselWrapper.appendChild(card);
    });
  } else if (dados.products && Array.isArray(dados.products)) {
    // Caso sua API retorne { products: [...] }
    dados.products.forEach(p => {
      const card = criarCardProduto(p);
      carrosselWrapper.appendChild(card);
    });
  } else {
    console.error("Formato de dados inválido:", dados);
    carrosselWrapper.innerHTML = `<div class="mensagem-info">Nenhum produto encontrado.</div>`;
    return;
  }

  document.querySelectorAll('.btn-carrinho').forEach(btn => {
    btn.addEventListener('click', e => adicionarAoCarrinho(e.target.dataset.produtoId));
  });
}

async function buscarProdutos() {
  try {
    console.log("Entrou na funcao buscarProdutos");

    const resposta = await fetch(API_BASE_URL + "/produto");

    if (!resposta.ok) {
      throw new Error("Erro na resposta da API");
    }

    const dados = await resposta.json();
    console.log("Dados Recebidos da API:", dados);

    renderizarProdutos(dados);

  } catch (erro) {
    console.error("Erro no catch:", erro);
    carrosselWrapper.innerHTML = `<div class="mensagem-info" style="color:red;">Erro ao carregar os produtos.</div>`;
  }
}

// ====== Controles do carrossel ======
prevBtn.addEventListener('click', () => {
  carrosselWrapper.scrollBy({ left: -300, behavior: 'smooth' });
});

nextBtn.addEventListener('click', () => {
  carrosselWrapper.scrollBy({ left: 300, behavior: 'smooth' });
});

// ====== Inicialização ======
window.onload = () => {
  buscarProdutos();
  atualizarContadorCarrinho();
  verificarAutorizacao();
};