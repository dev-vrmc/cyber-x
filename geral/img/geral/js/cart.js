import { showToast, updateCartBadge } from './ui.js';

class Cart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    }

    getCart() {
        return this.cart;
    }

    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
        updateCartBadge();
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ ...product, quantity });
        }

        showToast(`${product.name} adicionado ao carrinho!`);
        this.saveCart();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        showToast('Item removido do carrinho.');
        this.saveCart();
        // If on cart page, re-render
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartPage();
        }
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartPage();
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

renderCartPage() {
    const itemsContainer = document.getElementById('cart-items');
    const totalContainer = document.getElementById('cart-total');

    if (!itemsContainer || !totalContainer) return;

    // Se o carrinho estiver vazio
    if (this.cart.length === 0) {
        itemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        totalContainer.textContent = 'R$ 0,00';
        return;
    }

    // Renderiza cada item do carrinho
    itemsContainer.innerHTML = this.cart.map(item => `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">R$ ${Number(item.price).toFixed(2).replace('.', ',')}</p>
                <div class="cart-item-actions">
                    <div class="quantity-wrapper">
                        <button class="qty-btn decrease" data-id="${item.id}">-</button>
                        <input type="number" id="quantity-${item.id}" class="cart-item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="qty-btn increase" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">Remover</button>
                </div>
            </div>
        </div>
    `).join('');

    // Atualiza o total do carrinho
    totalContainer.textContent = this.getCartTotal().toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // === Inicializa eventos dos botões e inputs ===
    // Botões + e -
    itemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = parseInt(btn.dataset.id);
            const input = document.getElementById(`quantity-${id}`);
            let value = parseInt(input.value);

            if (btn.classList.contains('increase')) value += 1;
            if (btn.classList.contains('decrease')) value = Math.max(1, value - 1);

            input.value = value;
            this.updateQuantity(id, value);
        });
    });

    // Input manual
    itemsContainer.querySelectorAll('.cart-item-quantity').forEach(input => {
        input.addEventListener('change', e => {
            const id = parseInt(input.dataset.id);
            let value = parseInt(input.value);
            if (isNaN(value) || value < 1) value = 1;
            input.value = value;
            this.updateQuantity(id, value);
        });
    });

    // Botão remover
    itemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = parseInt(btn.dataset.id);
            this.removeFromCart(id);
        });
    });
}

}

export const cart = new Cart();