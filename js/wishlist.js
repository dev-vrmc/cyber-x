// Arquivo: geral/js/wishlist.js

import { supabase } from './supabase.js';
import { authManager } from './auth.js';
import { showToast } from './ui.js';

class WishlistManager {
    async getWishlist() {
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
        // A query retorna [{ products: {...} }]. Precisamos extrair o objeto 'products'.
        return data.map(item => item.products);
    }

    async isWishlisted(productId) {
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
        const user = await authManager.getCurrentUser();
        if (!user) return false;

        const { error } = await supabase
            .from('wishlist_items')
            .insert({ user_id: user.id, product_id: productId });

        if (error) {
            showToast('Erro ao adicionar à wishlist.', 'error');
            return false;
        }
        showToast('Adicionado à Lista de Desejos!');
        return true;
    }

    async removeFromWishlist(productId) {
        const user = await authManager.getCurrentUser();
        if (!user) return false;

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
    }
}

export const wishlistManager = new WishlistManager();