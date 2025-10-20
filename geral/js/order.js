// Arquivo: geral/js/order.js

import { supabase } from './supabase.js';
import { authManager } from './auth.js';
import { cart } from './cart.js';
import { showLoader, hideLoader, showToast } from './ui.js'; // <-- Importa os loaders

class OrderManager {
    async createOrder(cartItems) {
        showLoader(); // <-- ADICIONADO
        try {
            const user = await authManager.getCurrentUser();
            if (!user) {
                console.error("Usuário não logado.");
                showToast("Você precisa estar logado para criar um pedido.", "error");
                return null;
            }

            const total = cart.getCartTotal();

            // 1. Insere o pedido principal na tabela 'orders'
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total: total,
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) {
                console.error('Erro ao criar pedido:', orderError);
                return null;
            }

            const orderId = orderData.id;

            // 2. Prepara os itens do pedido
            const itemsToInsert = cartItems.map(item => ({
                order_id: orderId,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price
            }));

            // 3. Insere todos os itens
            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) {
                console.error('Erro ao inserir itens do pedido:', itemsError);
                await supabase.from('orders').delete().eq('id', orderId); // Deleta o pedido órfão
                return null;
            }

            return orderData; // Sucesso
        } catch (err) {
            console.error("Erro inesperado em createOrder:", err);
            showToast("Ocorreu um erro inesperado ao processar seu pedido.", "error");
            return null;
        } finally {
            hideLoader(); // <-- ADICIONADO
        }
    }
}

export const orderManager = new OrderManager();