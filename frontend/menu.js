const API_BASE_URL = 'http://localhost:3001';


function handleUserAction(action) {
  if (action === "sair") {
    //alert("Desconectando...");
    logout();
  }
}

// A função 'logout' original
async function logout() {
  try {
    const res = await fetch(API_BASE_URL + '/login/logout', {
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
      console.log("Usuário não logado, redirecionando para login...");
      const res = await fetch(API_BASE_URL + '/login', {
        credentials: 'include' // importante para enviar cookies!
      });

    }
  } catch (error) {
    console.error("Erro ao verificar login:", error);
    return false;
  }
}


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
      document.getElementById("oUsuario").options[0].text = `${data.usuario}`;
      return true;
    } else {
      console.log("Usuário não logado, redirecionando...");
       window.location.href = "../login/login.html"; 
      // return false;
      // window.location.reload(true);
    }
  } catch (error) {
    console.error("Erro ao verificar login:", error);
    return false;
  }
}



// Chame a função quando a página carregar
window.onload = verificarAutorizacao();

