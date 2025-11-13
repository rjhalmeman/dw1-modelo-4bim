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
        alert('Pedido realizado com sucesso! ID: ' + dados.id_pedido);

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