// Arquivo: geral/js/admin.js

import { supabase } from './supabase.js';
import { authManager } from './auth.js';
import { productManager } from './products.js';
import { showToast } from './ui.js';

// Mapa de categorias para converter ID -> slug e vice-versa
const categoryMapById = { 1: 'hardware', 2: 'perifericos', 3: 'computadores', 4: 'cadeiras', 5: 'monitores', 6: 'celulares' };
const categoryMapBySlug = { 'hardware': 1, 'perifericos': 2, 'computadores': 3, 'cadeiras': 4, 'monitores': 5, 'celulares': 6 };

document.addEventListener('DOMContentLoaded', async () => {
    // Proteção da Rota
    await authManager.getCurrentUser();
    const profile = await authManager.fetchUserProfile();

    if (!profile || profile.role !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador.');
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('adminAddProduct');
    const formTitle = document.getElementById('product-form-title');
    const hiddenIdInput = form.querySelector('input[name="id"]');

    await loadProducts();
    await loadOrders();

    const urlParams = new URLSearchParams(window.location.search);
    const productIdToEdit = urlParams.get('edit');
    if (productIdToEdit) {
        const productToEdit = await productManager.getProductById(productIdToEdit);
        if (productToEdit) {
            handleEdit(productToEdit);
        }
    }

    // Lógica do Formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());
        const id = productData.id;

        productData.category_id = categoryMapBySlug[productData.category];
        delete productData.category;

        productData.price = parseFloat(productData.price);
        productData.stock = parseInt(productData.stock, 10);
        productData.featured = formData.get('featured') === 'on';

        let error;
        if (id) {
            const { error: updateError } = await supabase.from('products').update(productData).eq('id', id);
            error = updateError;
        } else {
            delete productData.id;
            const { error: insertError } = await supabase.from('products').insert([productData]);
            error = insertError;
        }

        if (error) {
            showToast(`Erro ao salvar produto: ${error.message}`, 'error');
        } else {
            showToast('Produto salvo com sucesso!');
            form.reset();
            hiddenIdInput.value = '';
            formTitle.textContent = '➕ Adicionar Novo Produto';
            await loadProducts();
        }
    });
});

async function loadProducts() {
    const container = document.getElementById('adminProducts');
    const products = await productManager.getProducts(true);

    if (!container) return;
    container.innerHTML = products.map(p => `
        <div class="admin-product-item">
            <span>${p.name} (Estoque: ${p.stock})</span>
            <div>
                <button class="edit-btn" data-id="${p.id}">Editar</button>
                <button class="delete-btn" data-id="${p.id}">Excluir</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const product = products.find(p => p.id == e.target.dataset.id);
            handleEdit(product);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDelete(e.target.dataset.id));
    });
}

// =======================================================
// LÓGICA DE PEDIDOS PARA O ADMIN (ATUALIZADA)
// =======================================================

async function loadOrders() {
    const container = document.getElementById('adminOrders');
    if (!container) return;

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id, created_at, total, status,
            profiles!inner(full_name),
            order_items ( quantity, unit_price, products!inner(name) )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar pedidos:', error);
        container.innerHTML = '<p>Erro ao carregar pedidos.</p>';
        return;
    }
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p>Nenhum pedido encontrado.</p>';
        return;
    }

    // --- INÍCIO DA MODIFICAÇÃO NO LAYOUT ---
    container.innerHTML = orders.map(order => {
        const statusMap = {
            pending: 'Pedido pendente.',
            shipped: 'Pedido enviado.',
            completed: 'Pedido concluído.',
            canceled: 'Pedido cancelado.'
        };

        return `
        <div class="admin-order">
            <div class="order-header">
                <h2>Pedido Nº: ${order.id}</h2>
                <p><strong>Nome:</strong> ${order.profiles?.full_name || 'Usuário Removido'}</p>
            </div>

            <div class="order-details">
                <strong>Itens do Pedido:</strong>
                <ul>
                ${order.order_items.map(item => `
                    <li>
                        -- ${item.quantity}x ${item.products?.name || 'Produto Removido'} — 
                        ${Number(item.unit_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </li>
                `).join('')}
                </ul>
            </div>

            <div class="order-footer">
                <p><strong>Total:</strong> ${Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <p class="order-status-text">${statusMap[order.status]}</p>

            <div class="order-actions">
                <label for="status-${order.id}" style="margin-top:5px"><strong>Alterar Status:</strong></label>
                <select class="order-status-select" data-id="${order.id}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Concluído</option>
                    <option value="canceled" ${order.status === 'canceled' ? 'selected' : ''}>Cancelado</option>
                </select>
                <button class="delete-order-btn" data-id="${order.id}">Excluir Pedido</button>
            </div>
        </div>
    `}).join('');
    // --- FIM DA MODIFICAÇÃO NO LAYOUT ---

    // Adiciona listener para o select de status
    container.querySelectorAll('.order-status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const orderId = e.target.dataset.id;
            const newStatus = e.target.value;
            await updateOrderStatus(orderId, newStatus);
            await loadOrders(); // Recarrega para atualizar o texto do status
        });
    });

    // --- NOVO: Adiciona listener para os botões de excluir pedido ---
    container.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleDeleteOrder(e.target.dataset.id);
        });
    });
}

async function updateOrderStatus(orderId, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
        showToast(`Erro ao atualizar status: ${error.message}`, 'error');
    } else {
        showToast(`Status do pedido #${orderId} atualizado.`);
    }
}

// --- NOVA FUNÇÃO PARA EXCLUIR PEDIDOS ---
async function handleDeleteOrder(orderId) {
    if (confirm(`Tem certeza que deseja excluir o pedido #${orderId}? Esta ação não pode ser desfeita.`)) {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) {
            showToast(`Erro ao excluir pedido: ${error.message}`, 'error');
        } else {
            showToast('Pedido excluído com sucesso!');
            await loadOrders(); // Recarrega a lista de pedidos
        }
    }
}


function handleEdit(product) {
    if (!product) return;
    const form = document.getElementById('adminAddProduct');
    form.querySelector('input[name="id"]').value = product.id;
    form.querySelector('input[name="name"]').value = product.name;
    form.querySelector('input[name="img"]').value = product.img;
    form.querySelector('input[name="price"]').value = product.price;
    form.querySelector('input[name="sku"]').value = product.sku || '';
    form.querySelector('input[name="brand_meta"]').value = product.brand_meta || '';
    form.querySelector('textarea[name="description"]').value = product.description || '';
    form.querySelector('input[name="installments"]').value = product.installments || '';
    form.querySelector('input[name="stock"]').value = product.stock || 0;
    form.querySelector('input[name="featured"]').checked = !!product.featured;
    const categorySlug = categoryMapById[product.category_id];
    form.querySelector('select[name="category"]').value = categorySlug;
    document.getElementById('product-form-title').textContent = `✏️ Editando: ${product.name}`;
    form.scrollIntoView({ behavior: 'smooth' });
}

async function handleDelete(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            showToast(`Erro ao excluir: ${error.message}`, 'error');
        } else {
            showToast('Produto excluído com sucesso!');
            await loadProducts();
        }
    }
}