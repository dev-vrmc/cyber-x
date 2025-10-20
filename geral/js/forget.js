// Arquivo: geral/js/forget.js
import { authManager } from './auth.js';
import { showToast, showLoader, hideLoader } from './ui.js'; // Importa o loader

document.addEventListener('DOMContentLoaded', () => {
    const forgetForm = document.getElementById('forgetForm');

    if (forgetForm) {
        forgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = forgetForm.querySelector('input[name="email"]').value;
            const submitButton = forgetForm.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
            showLoader();

            try {
                const success = await authManager.resetPassword(email);
                showToast('Se o e-mail estiver cadastrado, um link de recuperação será enviado.');
                
                if (success) {
                    forgetForm.reset();
                }
            } finally {
                hideLoader();
                submitButton.disabled = false;
                submitButton.textContent = 'Recuperar';
            }
        });
    }
});