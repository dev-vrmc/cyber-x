// Arquivo: geral/js/forget.js

// CORREÇÃO: O 'import' agora funcionará corretamente com o type="module" no HTML.
import { authManager } from './auth.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const forgetForm = document.getElementById('forgetForm');

    if (forgetForm) {
        forgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = forgetForm.querySelector('input[name="email"]');
            const email = emailInput.value;

            // Chama a função do authManager para resetar a senha
            await authManager.resetPassword(email);
            
            // Limpa o campo após o envio
            emailInput.value = ''; 
        });
    }
});