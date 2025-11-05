const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Rotas de autenticação

router.get('/', loginController.abrirTelaLogin);

router.post('/verificarEmail', loginController.verificarEmail);
router.post('/verificarSenha', loginController.verificarSenha);
router.get('/verificaSeUsuarioEstaLogado', loginController.verificaSeUsuarioEstaLogado);
router.get('/logout', loginController.logout);

// Rotas 
router.get('/', loginController.listarPessoas);
router.post('/', loginController.criarPessoa);
router.get('/:id', loginController.obterPessoa);
// router.put('/:id', loginController.atualizarPessoa);
// router.delete('/:id', loginController.deletarPessoa);

module.exports = router;
