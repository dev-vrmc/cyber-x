// Arquivo: geral/js/cadaster.js

import { authManager } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const cadasterForm = document.getElementById('cadasterForm');

    if (cadasterForm) {
        cadasterForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o recarregamento da página

            const name = cadasterForm.querySelector('input[name="name"]').value;
            const email = cadasterForm.querySelector('input[name="email"]').value;
            const phone = cadasterForm.querySelector('input[name="tel"]').value;
            const password = cadasterForm.querySelector('input[name="senha"]').value;

            // Chama a função de registro do authManager
            const user = await authManager.register(name, email, password, phone);

            if (user) {
                // Opcional: redirecionar para a tela de login ou uma página de "verifique seu email"
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000); // Espera 3 segundos para o usuário ler o toast
            }
        });
    }
});