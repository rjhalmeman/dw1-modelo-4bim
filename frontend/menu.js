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
    console.log("Resposta do servidor após logout:", data);

    if (data.status === 'ok') {
      console.log("Logout bem-sucedido.");
      // 1. Opcional: Limpar exibição do usuário (se necessário)
      document.getElementById("oUsuario").options[0].text = `Usuário`; 
      
  
      // Se o logout foi um sucesso, redirecione para a página de login.
      window.location.href = "../login/login.html"; 
      return true;
      
    } else {
      // Se o servidor retornar 'nok' ou outro status não-ok (mas o fetch foi bem)
  //    console.log("Servidor não confirmou o logout, mas a chamada foi feita.");
      // Tenta redirecionar, pois o estado pode estar inconsistente
      window.location.href = "../login/login.html"; 
      return false;
    }
    
  } catch (error) {
    // Se o fetch falhar completamente (erro de rede, CORS, etc.)
    console.error("Erro ao tentar fazer logout:", error);
    // Mesmo em erro, tente redirecionar para forçar o login
    window.location.href = "../login/login.html"; 
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

