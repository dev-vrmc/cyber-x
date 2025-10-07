// Arquivo: geral/js/account.js

import { supabase } from './supabase.js';
import { authManager } from './auth.js';
import { showToast, renderProducts } from './ui.js'; // renderProducts importado
import { wishlistManager } from './wishlist.js'; // wishlistManager importado

document.addEventListener('DOMContentLoaded', async () => {
    const user = await authManager.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const accountForm = document.getElementById('accountForm');
    const nameInput = document.getElementById('accountName');
    const phoneInput = document.getElementById('accountPhone');
    const emailInput = document.getElementById('accountEmail');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const ordersContainer = document.getElementById('ordersContainer');
    const wishlistContainer = document.getElementById('wishlistContainer'); // Container da wishlist

    emailInput.value = user.email;
    const profile = await authManager.fetchUserProfile();
    if (profile) {
        nameInput.value = profile.full_name || '';
        phoneInput.value = profile.phone || '';
    }

    const toggleEditMode = (isEditing) => {
        nameInput.readOnly = !isEditing;
        phoneInput.readOnly = !isEditing;
        saveBtn.style.display = isEditing ? 'inline-block' : 'none';
        editBtn.style.display = isEditing ? 'none' : 'inline-block';
    };

    toggleEditMode(false);

    editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleEditMode(true);
    });

    accountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: nameInput.value, phone: phoneInput.value })
            .eq('id', user.id);

        if (error) {
            showToast(`Erro ao atualizar perfil: ${error.message}`, 'error');
        } else {
            showToast('Perfil atualizado com sucesso!');
            toggleEditMode(false);
        }
    });

    // Carregar histórico de pedidos do usuário
    if (ordersContainer) {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total,
                status,
                order_items (
                    quantity,
                    unit_price,
                    products ( name, img )
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar pedidos:', error);
            ordersContainer.innerHTML = '<p>Não foi possível carregar o histórico de pedidos.</p>';
        } else if (orders.length === 0) {
            ordersContainer.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
    } else {
        // --- INÍCIO DA MODIFICAÇÃO ---

        // 1. Adicione este objeto de tradução
        const statusTranslations = {
            pending: 'Pendente',
            shipped: 'Enviado',
            completed: 'Concluído',
            canceled: 'Cancelado'
        };

        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-history-item">
                <h2>Pedido #${order.id} - ${new Date(order.created_at).toLocaleDateString()}</h2>
                
                <p>Status: <span class="order-status--${order.status}">${statusTranslations[order.status] || order.status}</span></p>

                <p>Total: ${Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <ul>
                ${order.order_items.map(item => `
                    <li>
                        • ${item.quantity}x ${item.products?.name || 'Produto Removido'} — 
                        ${Number(item.unit_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </li>
                `).join('')}
                </ul>
            </div>
        `).join('');
        // --- FIM DA MODIFICAÇÃO ---
    }
}
    if (wishlistContainer) {
        const wishlistProducts = await wishlistManager.getWishlist();
        if (!wishlistProducts || wishlistProducts.length === 0) {
            wishlistContainer.innerHTML = '<p>Sua lista de desejos está vazia.</p>';
        } else {
            renderProducts(wishlistProducts, 'wishlistContainer');
            // Adiciona listener para cliques nos cards da wishlist
            wishlistContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                if (card && card.dataset.id) {
                    window.location.href = `item.html?id=${card.dataset.id}`;
                }
            });
        }
    }
});