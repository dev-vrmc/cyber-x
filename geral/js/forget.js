// Arquivo: geral/js/forget.js
import { authManager } from './auth.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const forgetForm = document.getElementById('forgetForm');

    if (forgetForm) { // Adiciona verificação de segurança
        forgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = forgetForm.querySelector('input[name="email"]').value;

            const submitButton = forgetForm.querySelector('button[type="submit"]');

            // 1. Feedback visual e desabilitação do botão
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            try {
                await authManager.resetPassword(email);
                showToast('Se o e-mail estiver cadastrado, um link de recuperação será enviado.');
                forgetForm.reset(); // Limpa o formulário após o sucesso
            } finally {
                // 2. Reativa o botão e restaura o texto
                submitButton.disabled = false;
                submitButton.textContent = 'Recuperar';
            }
        });
    }
});