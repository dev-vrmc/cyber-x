// Arquivo: geral/js/admin.js

import { supabase } from './supabase.js';
import { authManager } from './auth.js';
import { productManager } from './products.js';
import { showToast } from './ui.js';

// ✅ Mapa de categorias para converter ID -> slug e vice-versa
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

        // Converte o slug da categoria para o ID numérico
        productData.category_id = categoryMapBySlug[productData.category];
        delete productData.category; // Remove a chave de slug que não existe na tabela

        // Converte campos numéricos
        productData.price = parseFloat(productData.price);
        productData.stock = parseInt(productData.stock, 10);

        productData.featured = formData.get('featured') === 'on';

        let error;
        if (id) {
            // ATUALIZAR produto existente
            const { error: updateError } = await supabase
                .from('products')
                .update(productData)
                .eq('id', id);
            error = updateError;
        } else {
            // CRIAR novo produto
            delete productData.id; // Garante que o ID (que está vazio) não seja enviado
            const { error: insertError } = await supabase
                .from('products')
                .insert([productData]); // Supabase v3 prefere um array para insert
            error = insertError;
        }

        if (error) {
            showToast(`Erro ao salvar produto: ${error.message}`, 'error');
        } else {
            showToast('Produto salvo com sucesso!');
            form.reset();
            hiddenIdInput.value = ''; // Limpa o ID oculto
            formTitle.textContent = '➕ Adicionar Novo Produto';
            await loadProducts(); // Recarrega a lista
        }
    });
});

async function loadProducts() {
    const container = document.getElementById('adminProducts');
    // Força a busca de novos produtos em vez de usar o cache
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
            const productId = e.target.dataset.id;
            const product = products.find(p => p.id == productId); // pega o objeto
            handleEdit(product);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDelete(e.target.dataset.id));
    });
}

// =======================================================
// NOVA SEÇÃO: LÓGICA DE PEDIDOS PARA O ADMIN
// =======================================================

async function loadOrders() {
    const container = document.getElementById('adminOrders');
    if (!container) return;

    // Busca os pedidos, informações do usuário e itens (nome + preço)
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
    id,
    created_at,
    total,
    status,
    profiles!inner(full_name),
    order_items (
      quantity,
      unit_price,
      products!inner(name, price)
    )
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

container.innerHTML = orders.map(order => `
    <div class="admin-order"> <!-- troquei admin-order-item para admin-order -->
        <div class="order-header">
            <h4>Pedido #${order.id}</h4>
            <span>${new Date(order.created_at).toLocaleString('pt-BR')}</span>
        </div>

        <div class="order-customer">
            <p><strong>Cliente:</strong> ${order.profiles?.full_name || 'Usuário Removido'}</p>
        </div>

        <div class="order-details">
            <p><strong>Total:</strong> ${Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <ul>
            ${order.order_items.map(item => `
             <li>
                ${item.quantity}x ${item.products?.name || 'Produto Removido'} 
                - ${Number(item.unit_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </li>
            `).join('')}
            </ul>
        </div>

        <div class="order-actions">
            <label for="status-${order.id}"><strong>Status:</strong></label>
            <select class="order-status-select" data-id="${order.id}">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Concluído</option>
                <option value="canceled" ${order.status === 'canceled' ? 'selected' : ''}>Cancelado</option>
            </select>
        </div>
    </div>
`).join('');

    // Atualiza status do pedido
    container.addEventListener('change', async (e) => {
        if (e.target.classList.contains('order-status-select')) {
            const orderId = e.target.dataset.id;
            const newStatus = e.target.value;
            await updateOrderStatus(orderId, newStatus);
        }
    });
}


async function updateOrderStatus(orderId, status) {
    const { error } = await supabase
        .from('orders')
        .update({ status: status })
        .eq('id', orderId);

    if (error) {
        showToast(`Erro ao atualizar status: ${error.message}`, 'error');
    } else {
        showToast(`Status do pedido #${orderId} atualizado para "${status}".`);
    }
}

function handleEdit(product) { // Modificado para receber o objeto do produto
    if (!product) return;

    const form = document.getElementById('adminAddProduct');

    // ✅ **PREENCHIMENTO COMPLETO DO FORMULÁRIO**
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


    // Converte o category_id de volta para o slug para o select
    const categorySlug = categoryMapById[product.category_id];
    form.querySelector('select[name="category"]').value = categorySlug;

    document.getElementById('product-form-title').textContent = `✏️ Editando: ${product.name}`;
    form.scrollIntoView({ behavior: 'smooth' }); // Rola a página para o formulário
}

async function handleDelete(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            showToast(`Erro ao excluir: ${error.message}`, 'error');
        } else {
            showToast('Produto excluído com sucesso!');
            await loadProducts(); // Recarrega a lista
        }
    }
}