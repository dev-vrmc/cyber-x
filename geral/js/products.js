import { supabase } from './supabase.js';
import { showLoader, hideLoader, showToast } from './ui.js'; // <-- Importa os loaders e showToast

// Função para embaralhar um array (usada para produtos aleatórios)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class ProductManager {
    async getProducts(options = {}) {
        showLoader(); // <-- ADICIONADO
        try {
            let query = supabase.from('products').select(`*, category:categories(*)`);

            if (options.categorySlug) {
                const { data: categoryData } = await supabase.from('categories').select('id').eq('slug', options.categorySlug).single();
                if (categoryData) query = query.eq('category_id', categoryData.id);
            }

            if (options.minPrice) query = query.gte('price', options.minPrice);
            if (options.maxPrice) query = query.lte('price', options.maxPrice);
            
            if (options.featured !== undefined) {
                query = query.eq('featured', options.featured);
            }

            if (options.sortBy) {
                const [column, order] = options.sortBy.split('-');
                query = query.order(column, { ascending: order === 'asc' });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;
            if (error) {
                console.error('Error fetching products:', error);
                return [];
            }

            if (options.random) {
                return shuffleArray(data).slice(0, options.limit || 6);
            }
            return data;
        } catch (err) {
            console.error('Error in getProducts:', err);
            return [];
        } finally {
            hideLoader(); // <-- ADICIONADO
        }
    }

    async getProductById(id) {
        showLoader(); // <-- ADICIONADO
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching product:', error);
                return null;
            }
            return data;
        } catch (err) {
            console.error('Error in getProductById:', err);
            return null;
        } finally {
            hideLoader(); // <-- ADICIONADO
        }
    }
    
    async deleteProduct(productId) {
        showLoader(); // <-- ADICIONADO
        try {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) {
                showToast(`Erro ao remover produto: ${error.message}`, 'error');
                return false;
            }
            showToast('Produto removido com sucesso!');
            return true;
        } catch (err) {
            showToast(`Erro: ${err.message}`, 'error');
            return false;
        } finally {
            hideLoader(); // <-- ADICIONADO
        }
    }

    async searchProducts(searchTerm) {
        showLoader(); // <-- ADICIONADO
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .ilike('name', `%${searchTerm}%`); // Case-insensitive search

            if (error) {
                console.error('Error searching products:', error);
                return [];
            }
            return data;
        } catch (err) {
            console.error('Error in searchProducts:', err);
            return [];
        } finally {
            hideLoader(); // <-- ADICIONADO
        }
    }
}

export function formatPrice(value) {
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export const productManager = new ProductManager();