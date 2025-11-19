/*
troquei de localStorage para sessionStorage para que o carrinho seja resetado ao fechar o navegador

*/


const URL_API = 'http://localhost:3001/produto/';
const carrosselWrapper = document.getElementById('carrossel-wrapper');
const contadorCarrinho = document.getElementById('contadorCarrinho');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Atualiza contador do carrinho
function atualizarContadorCarrinho() {
    // MUDANÇA: Troca de localStorage para sessionStorage
    const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
    contadorCarrinho.textContent = carrinho.length;
}

// Criação dos cards
function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.classList.add('produto-card');
    const caminhoImagem = `http://localhost:5500/imagens/produto/${produto.id_produto}.png`;
    const precoFormatado = produto.preco_unitario_produto.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    card.innerHTML = `
    <img src="${caminhoImagem}" alt="${produto.nome_produto}" class="card-imagem">
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

    fetch(`${URL_API}${produtoId}`)
        .then(res => res.json())
        .then(produtoAPI => {
            const item = {
                id: produtoAPI.id_produto,
                nome: produtoAPI.nome_produto,
                preco: produtoAPI.preco_unitario_produto,
                quantidade: quantidadeGramas
            };

            // MUDANÇA: Troca de localStorage para sessionStorage
            let carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
            const existente = carrinho.find(i => i.id === item.id);

            if (existente) {
                existente.quantidade += quantidadeGramas;
            } else {
                carrinho.push(item);
            }

            // MUDANÇA: Troca de localStorage para sessionStorage
            sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarContadorCarrinho();
        })
        .catch(() => alert("Erro ao adicionar ao carrinho."));
}

// Renderizar os produtos
function renderizarProdutos(dados) {
    carrosselWrapper.innerHTML = '';
    dados.forEach(p => {
        const card = criarCardProduto(p);
        carrosselWrapper.appendChild(card);
    });

    document.querySelectorAll('.btn-carrinho').forEach(btn => {
        btn.addEventListener('click', e => adicionarAoCarrinho(e.target.dataset.produtoId));
    });
}

// Buscar produtos na API
async function buscarProdutos() {
    try {
        const resposta = await fetch(URL_API);
        const dados = await resposta.json();
        renderizarProdutos(dados);
    } catch {
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
};