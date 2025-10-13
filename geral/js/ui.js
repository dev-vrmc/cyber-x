// Arquivo: geral/js/ui.js

import { cart } from './cart.js';
import { authManager } from './auth.js'; // Importa o authManager
import { productManager } from './products.js'; // Importa para a função de delete

export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
}

export function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = cart.getCartItemCount();
    }
}

// MODIFICADO: A função agora é async para poder checar o status de admin
export async function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Checa se o usuário é admin ANTES de renderizar
    const isAdmin = await authManager.isAdmin();

    if (products.length === 0) {
        container.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }

    container.innerHTML = products.map(product => {
        // NOVO: Bloco de botões de admin
        const adminButtons = isAdmin ? `
            <div class="product-card-admin-actions">
                <button class="admin-btn edit" data-id="${product.id}">Editar</button>
                <button class="admin-btn remove" data-id="${product.id}">Remover</button>
            </div>
        ` : '';

        return `
            <div class="product-card" data-id="${product.id}">
                ${adminButtons}
                <div class="product-image">
                    <img src="${product.img || 'geral/img/placeholder.png'}" alt="${product.name}">
                </div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">
  ${Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
</p>
                <button class="btn__product" data-id="${product.id}">Ver Detalhes</button>
            </div>
        `;
    }).join('');

    // NOVO: Adiciona event listeners para os botões de admin, se houver
    if (isAdmin) {
        container.querySelectorAll('.admin-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique no botão também abra a página do produto
                const productId = e.target.dataset.id;
                window.location.href = `admin.html?edit=${productId}`;
            });
        });

        container.querySelectorAll('.admin-btn.remove').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const productId = e.target.dataset.id;
                if (confirm('Tem certeza que deseja remover este produto?')) {
                    const success = await productManager.deleteProduct(productId);
                    if (success) {
                        // Remove o card do produto da tela sem recarregar a página
                        e.target.closest('.product-card').remove();
                    }
                }
            });
        });
    }
}

/*=============== LOADER ===============*/
export function showLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.add('show');
}

export function hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.remove('show');
}