function handleUserAction(action) {
  if (action === "gerenciar-conta") {
    alert("Redirecionando para a página de Gerenciar Conta...");
    // window.location.href = "/gerenciar-conta";
  } else if (action === "sair") {
    alert("Desconectando...");
    // logout();
  }
}

// A função 'logout' original
function logout() {
  alert("Desconectando...");
  // window.location.href = "/login";
}

const API_BASE_URL = 'http://localhost:3001';

async function verificarAutorizacao() {
  try {
    const res = await fetch(API_BASE_URL + '/login/verificaSeUsuarioEstaLogado', {
      credentials: 'include' // importante para enviar cookies!
    });

    const data = await res.json();
    console.log("Resposta do servidor:", data);

    if (data.status === 'ok') {
      console.log("Usuário logado:", data.usuario);
      // Exemplo: mostra o nome na tela
      document.getElementById("oUsuario").options[0].text = `${data.usuario}!`;
      return true;
    } else {
      console.log("Usuário não logado, redirecionando...");
      window.location.href = "/login.html";
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar login:", error);
    return false;
  }
}



// Chame a função quando a página carregar
window.onload = verificarAutorizacao();



async function logout2() {
  await fetch('http://localhost:3005/logout', {
    method: 'POST',
    credentials: 'include'
  });
  window.location.href = "http://localhost:3005/inicio";
}

// usuarioAutorizado();