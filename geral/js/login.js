// Arquivo: geral/js/login.js

import { authManager } from './auth.js';
import { showLoader, hideLoader } from './ui.js'; // <-- Importa os loaders

const loginForm = document.getElementById('loginForm'); 

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        showLoader(); // <-- ADICIONADO
        
        const email = loginForm.querySelector('input[name="email"]').value;
        const password = loginForm.querySelector('input[name="senha"]').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = 'Verificando...';

        try {
            const result = await authManager.login(email, password);
    
            if (result && result.profile) {
                // Sucesso! O loader será escondido pela navegação da página
                if (result.profile.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'account.html';
                }
            } else {
                // Se authManager.login falhar (e mostrar um toast),
                // precisamos reabilitar o botão e esconder o loader
                submitButton.disabled = false;
                submitButton.textContent = 'Acessar';
                hideLoader(); // <-- ADICIONADO
            }
        } catch (error) {
            // Erro inesperado
            console.error("Erro no login:", error);
            submitButton.disabled = false;
            submitButton.textContent = 'Acessar';
            hideLoader(); // <-- ADICIONADO
        }
    });
}