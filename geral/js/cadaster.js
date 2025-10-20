// Arquivo: geral/js/cadaster.js

import { authManager } from './auth.js';
import { showToast, showLoader, hideLoader } from './ui.js';
import { supabase } from './supabase.js'; // ✅ **NOVO: Importa o supabase client**

document.addEventListener('DOMContentLoaded', () => {
    const cadasterForm = document.getElementById('cadasterForm');
    const submitButton = document.getElementById('cadasterButton');

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
                return;
            }

            // 2. Feedback visual
            submitButton.disabled = true;
            submitButton.textContent = 'Verificando...';
            showLoader();

            try {
                // ✅ **PASSO 1: VERIFICAR E-MAIL ANTES DE TENTAR CADASTRAR**
                // Chamamos a função SQL que criamos no Supabase
                const { data: emailExists, error: checkError } = await supabase
                    .rpc('check_email_exists', { email_to_check: email });

                if (checkError) {
                    // Erro na própria função RPC
                    throw new Error("Erro ao verificar e-mail. Tente novamente.");
                }

                if (emailExists) {
                    // ✅ **RESOLVIDO:** Este é o comportamento que você queria.
                    // O e-mail (confirmado ou não) já existe.
                    showToast('Este e-mail já está cadastrado. Tente fazer o login.', 'error');
                    hideLoader();
                    submitButton.disabled = false;
                    submitButton.textContent = 'Cadastrar';
                    return; // Interrompe a execução
                }

                // ✅ **PASSO 2: SE NÃO EXISTE, TENTA O CADASTRO**
                submitButton.textContent = 'Cadastrando...';
                // Agora, o authManager.register só será chamado para e-mails novos.
                const user = await authManager.register(name, email, password, phone);

                if (user) {
                    // Sucesso: O loader continua até o redirect
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                } else {
                    // Falha (ex: erro de validação do Supabase, o auth.js já mostrou o toast)
                    hideLoader();
                    submitButton.disabled = false;
                    submitButton.textContent = 'Cadastrar';
                }
            } catch (error) {
                // Falha inesperada (na verificação ou no cadastro)
                console.error("Erro no cadastro:", error);
                showToast(error.message, 'error');
                hideLoader();
                submitButton.disabled = false;
                submitButton.textContent = 'Cadastrar';
            }
        });
    }
});