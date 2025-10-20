// Arquivo: geral/js/wishlist.js

import { supabase } from './supabase.js';
import { authManager } from './auth.js';
// ADICIONADO showLoader e hideLoader
import { showToast, showLoader, hideLoader } from './ui.js';

class WishlistManager {
    async getWishlist() {
        showLoader(); // ADICIONADO
        try {
            const user = await authManager.getCurrentUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('wishlist_items')
                .select('products(*, category:categories(*))')
                .eq('user_id', user.id);

            if (error) {
                console.error('Erro ao buscar wishlist:', error);
                return [];
            }
            return data.map(item => item.products);
        } catch (err) {
            console.error("Erro inesperado em getWishlist:", err);
            return [];
        } finally {
            hideLoader(); // ADICIONADO
        }
    }

    async isWishlisted(productId) {
        // Esta função é uma verificação silenciosa, geralmente não precisa de loader global
        const user = await authManager.getCurrentUser();
        if (!user || !productId) return false;

        const { data, error } = await supabase
            .from('wishlist_items')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();
            
        return !error && data;
    }

    async addToWishlist(productId) {
        showLoader(); // ADICIONADO
        try {
            const user = await authManager.getCurrentUser();
            if (!user) {
                showToast("Você precisa estar logado.", "error");
                return false;
            }

            const { error } = await supabase
                .from('wishlist_items')
                .insert({ user_id: user.id, product_id: productId });

            if (error) {
                showToast('Erro ao adicionar à wishlist.', 'error');
                return false;
            }
            showToast('Adicionado à Lista de Desejos!');
            return true;
        } catch (err) {
            console.error("Erro inesperado em addToWishlist:", err);
            showToast('Erro inesperado.', 'error');
            return false;
        } finally {
            hideLoader(); // ADICIONADO
        }
    }

    async removeFromWishlist(productId) {
        showLoader(); // ADICIONADO
        try {
            const user = await authManager.getCurrentUser();
            if (!user) {
                showToast("Você precisa estar logado.", "error");
                return false;
            }

            const { error } = await supabase
                .from('wishlist_items')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);
            
            if (error) {
                showToast('Erro ao remover da wishlist.', 'error');
                return false;
            }
            showToast('Removido da Lista de Desejos.');
            return true;
        } catch (err) {
            console.error("Erro inesperado em removeFromWishlist:", err);
            showToast('Erro inesperado.', 'error');
            return false;
        } finally {
            hideLoader(); // ADICIONADO
        }
    }
}

export const wishlistManager = new WishlistManager();