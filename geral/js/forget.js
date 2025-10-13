// Arquivo: geral/js/forget.js
import { authManager } from './auth.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const forgetForm = document.getElementById('forgetForm');

    forgetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = forgetForm.querySelector('input[name="email"]').value;
        
        // Adiciona um feedback visual para o usuário
        const submitButton = forgetForm.querySelector('button');
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;

        await authManager.resetPassword(email);

        // Mesmo que a função já mostre um toast, podemos adicionar um aqui
        // para informar que o processo foi concluído e reativar o botão.
        showToast('Se o e-mail estiver cadastrado, um link de recuperação será enviado.');

        submitButton.textContent = 'Recuperar';
        submitButton.disabled = false;
        forgetForm.reset();
    });
});