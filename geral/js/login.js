// Arquivo: geral/js/login.js

// CORREÇÃO: Importa o authManager para usar a funcionalidade de autenticação.
import { authManager } from './auth.js';

// CORREÇÃO: O ID do formulário no HTML é 'loginForm', não 'login-form'.
const loginForm = document.getElementById('loginForm'); 

// Adiciona uma verificação para garantir que o formulário existe antes de adicionar o listener.
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[name="email"]').value;
        // CORREÇÃO: O nome do campo no HTML é 'senha', não 'password'.
        const password = loginForm.querySelector('input[name="senha"]').value;
    
        const result = await authManager.login(email, password);
    
        if (result && result.profile) {
            // Verifica a 'role' do perfil
            if (result.profile.role === 'admin') {
                window.location.href = 'admin.html'; // 🚀 Redireciona admin
            } else {
                window.location.href = 'account.html'; // 🧑‍💻 Redireciona usuário padrão
            }
        }
    });
}