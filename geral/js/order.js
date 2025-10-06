// Arquivo: geral/js/order.js

import { supabase } from './supabase.js';
import { authManager } from './auth.js';
import { cart } from './cart.js'; // Importa o carrinho para pegar o total

class OrderManager {
    async createOrder(cartItems) {
        const user = await authManager.getCurrentUser();
        if (!user) {
            console.error("Usuário não logado.");
            return null;
        }

        const total = cart.getCartTotal();

        // 1. Insere o pedido principal na tabela 'orders'
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total: total,
                status: 'pending' // ou 'processando'
            })
            .select()
            .single(); // .single() para retornar o objeto inserido

        if (orderError) {
            console.error('Erro ao criar pedido:', orderError);
            return null;
        }

        const orderId = orderData.id;

        // 2. Prepara os itens do pedido para a tabela 'order_items'
        const itemsToInsert = cartItems.map(item => ({
            order_id: orderId,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price
        }));

        // 3. Insere todos os itens de uma vez
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) {
            console.error('Erro ao inserir itens do pedido:', itemsError);
            // Opcional: deletar o pedido criado se os itens falharem
            await supabase.from('orders').delete().eq('id', orderId);
            return null;
        }

        return orderData; // Retorna o pedido criado com sucesso
    }
}

export const orderManager = new OrderManager();