// ======== Função principal ========
function carregarFinalizar() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const listaFinalizar = document.getElementById('lista-finalizar');
    const totalFinal = document.getElementById('total-final');

    listaFinalizar.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
        listaFinalizar.innerHTML = `<p>Carrinho vazio. Volte e adicione itens.</p>`;
        document.getElementById('btn-finalizar').disabled = true;
        return;
    }

    carrinho.forEach(prod => {
        const codigo = prod.codigo || prod.id || '(sem código)';
        const subtotal = prod.preco * (prod.quantidade / 1000);
        total += subtotal;

        const item = document.createElement('div');
        item.innerHTML = `
          <p>
            <strong>Código:</strong> ${codigo} <br>
            <strong>Produto:</strong> ${prod.nome} <br>
            <strong>Preço:</strong> R$ ${prod.preco.toFixed(2)} <br>
            <strong>Quantidade:</strong> ${prod.quantidade} g<br>
            <strong>Subtotal:</strong> R$ ${subtotal.toFixed(2)}
          </p>
          <hr>
        `;
        listaFinalizar.appendChild(item);
    });

    totalFinal.textContent = `Total Final: R$ ${total.toFixed(2)}`;
}

function obterCarrinhoDoStorage(idPedido, dadosStorage) {
    try {
        let carrinhoData;

        // Se for passado o objeto Storage completo, extrai o valor da chave 'carrinho'
        if (typeof dadosStorage === 'object' && dadosStorage.carrinho) {
            carrinhoData = JSON.parse(dadosStorage.carrinho);
        }
        // Se for passado diretamente a string do carrinho
        else if (typeof dadosStorage === 'string') {
            carrinhoData = JSON.parse(dadosStorage);
        }
        else {
            console.warn('Dados do carrinho não encontrados ou formato inválido');
            return [];
        }

        // Adiciona o id_pedido em cada item do carrinho
        const carrinhoComPedido = carrinhoData.map(item => {
            return {
                id_pedido: idPedido,
                id_produto: item.id,
                nome_produto: item.nome,
                preco: item.preco,
                quantidade: item.quantidade
            };
        });

        return carrinhoComPedido;

    } catch (error) {
        console.error('Erro ao processar dados do carrinho:', error);
        return [];
    }
}

// ======== Envia o pedido ao backend ========
async function enviarDadosParaBD() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    if (carrinho.length === 0) {
        alert("O carrinho está vazio.");
        return;
    }

    // Monta o pedido
    const pedido = {
        data_pedido: new Date().toISOString(),
        cliente_pessoa_cpf_pessoa: '1', // substitua pelo CPF real do cliente logado
        itens: carrinho.map(item => ({
            id_produto: item.id || item.codigo,
            peso_gramas: item.quantidade,
            preco_unitario_kg: item.preco
        }))
    };

    try {
        const resposta = await fetch('http://localhost:3001/pedido/online', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        if (!resposta.ok) throw new Error('Falha ao criar pedido na API.');

        const dados = await resposta.json();

        console.log('✅ Pedido enviado:', pedido);
        console.log('Conteúdo do localStorage antes de limpar:', localStorage);

        let dadosItensDoPedido = obterCarrinhoDoStorage(dados.id_pedido, localStorage);
        console.log('Conteúdo do carrinho obtido do localStorage:', dadosItensDoPedido);


        const rotaLote = 'http://localhost:3001/pedido_has_produto/lote'; // A rota 

        fetch(rotaLote, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosItensDoPedido),
        })
            .then(response => {
                if (!response.ok) {
                    // Lida com erros HTTP (400, 409, 500, etc.)
                    return response.json().then(errorData => {
                        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Itens inseridos com sucesso:', data);
            })
            .catch(error => {
                console.error('Falha na inserção em lote:', error.message);
            });




        //adicionar no alert os itens do pedido
        let aux = "";
        dadosItensDoPedido.forEach(item => {
            aux += `\n- ${dados.id_pedido} -  Produto: ${item.nome_produto}, Quantidade: ${item.quantidade} g, Preço: R$ ${item.preco.toFixed(2)}`;
        });

        alert(`Pedido ${dados.id_pedido} \n\n` + aux);

        //ver todo o conteudo do localStorage

        // Limpa carrinho e volta à página inicial
        localStorage.removeItem('carrinho');
        window.location.href = 'index.html';

    } catch (erro) {
        console.error('❌ Erro ao enviar pedido:', erro);
        alert('Ocorreu um erro ao finalizar o pedido. Tente novamente.');
    }
}

// ======== Evento do botão ========
document.getElementById('btn-finalizar').addEventListener('click', enviarDadosParaBD);

// ======== Ao carregar página ========
carregarFinalizar();