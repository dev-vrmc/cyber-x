// Arquivo: geral/js/auth.js

import { supabase } from './supabase.js';
import { showToast } from './ui.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.profile = null;
        this.authCheckCompleted = false; // Flag para saber se a checagem inicial foi feita
        this._initialize();
    }

    async _initialize() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.fetchUserProfile();
        }
        this.authCheckCompleted = true;
        document.dispatchEvent(new Event('authChecked')); // Dispara um evento quando a checagem terminar

        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.fetchUserProfile();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.profile = null;
            }
        });
    }
    
    // NOVO: Função para verificar se o usuário é admin
    async isAdmin() {
        if (!this.authCheckCompleted) {
            // Se a checagem inicial não terminou, espera pelo evento
            await new Promise(resolve => document.addEventListener('authChecked', resolve, { once: true }));
        }
        return this.profile && this.profile.role === 'admin';
    }

    async getCurrentUser() {
        if (!this.authCheckCompleted) {
            await new Promise(resolve => document.addEventListener('authChecked', resolve, { once: true }));
        }
        return this.currentUser;
    }

    async fetchUserProfile() {
        const user = this.currentUser; // Usa o usuário já carregado
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            this.profile = null;
            return null;
        }
        this.profile = data;
        return data;
    }

    async register(name, email, password, phone) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    phone: phone,
                },
            },
        });
        if (error) {
            showToast(error.message, 'error');
            return null;
        }
        showToast('Cadastro realizado com sucesso! Verifique seu e-mail para confirmação.');
        return data.user;
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            showToast(error.message, 'error');
            return null;
        }

        // ✅ **LÓGICA ADICIONADA**
        // Após o login, busca o perfil para obter a 'role'.
        this.currentUser = data.user;
        const profile = await this.fetchUserProfile();

        showToast('Login efetuado com sucesso!');
        // Retorna um objeto contendo o usuário e seu perfil.
        return { user: data.user, profile: profile };
    }

    async logout() {
        await supabase.auth.signOut();
        showToast('Você foi desconectado.');
        window.location.href = 'index.html';
    }

    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // ✅ A URL deve apontar para a sua página de redefinição de senha
            redirectTo: `https://cyber-x-eccomerce.netlify.app/password-reset.html`,
        });

        if (error) {
            showToast(error.message, 'error');
            return;
        }
        showToast('Link de recuperação enviado para o seu e-mail.');
    }
    // Add this method inside the AuthManager class
// Em geral/js/auth.js

// SUBSTITUA ESTA FUNÇÃO
async uploadAvatar(file) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const fileExt = file.name.split('.').pop();
    // CRIA UM NOME DE ARQUIVO ÚNICO COM UM TIMESTAMP PARA EVITAR PROBLEMAS DE CACHE
    const fileName = `avatar-${Date.now()}.${fileExt}`; 
    // CORREÇÃO: O CAMINHO AGORA INCLUI UMA PASTA COM O ID DO USUÁRIO
    const filePath = `${user.id}/${fileName}`; 

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true }); // 'upsert' permite substituir se já existir

    if (uploadError) {
        throw uploadError;
    }

    // Get public URL of the uploaded file
    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Update user's profile with the new avatar URL
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

    if (updateError) {
        throw updateError;
    }

    return data.publicUrl;
}
}

export const authManager = new AuthManager();