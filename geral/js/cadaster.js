// Arquivo: geral/js/cadaster.js

import { authManager } from './auth.js';
import { showToast } from './ui.js'; // Importa o showToast para feedback

document.addEventListener('DOMContentLoaded', () => {
    const cadasterForm = document.getElementById('cadasterForm');
    const submitButton = document.getElementById('cadasterButton'); // Pega o botão pelo ID

    if (cadasterForm) {
        cadasterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = cadasterForm.querySelector('input[name="name"]').value;
            const email = cadasterForm.querySelector('input[name="email"]').value;
            const phone = cadasterForm.querySelector('input[name="tel"]').value;
            const password = cadasterForm.querySelector('input[name="senha"]').value;
            const confirmPassword = cadasterForm.querySelector('input[name="confirmPassword"]').value;

            // 1. Validação de senhas
            if (password !== confirmPassword) {
                showToast('As senhas não coincidem.', 'error');
                return; // Interrompe a execução
            }

            // 2. Feedback visual no botão
            submitButton.disabled = true;
            submitButton.textContent = 'Cadastrando...';

            try {
                const user = await authManager.register(name, email, password, phone);

                if (user) {
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                }
            } finally {
                 // 3. Reativa o botão, independentemente do resultado
                submitButton.disabled = false;
                submitButton.textContent = 'Cadastrar';
            }
        });
    }
});