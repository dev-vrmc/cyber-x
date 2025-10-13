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
    const subtotalContainer = document.getElementById('cart-subtotal');
    const shippingContainer = document.getElementById('cart-shipping');
    const totalContainer = document.getElementById('cart-total');

    if (!itemsContainer) return;

    // NOVO: Importa a função de renderizar endereço.
    // Adicione esta linha no topo do seu script, fora da classe Cart:
    // import { renderShippingDetails } from './path/to/cart.html/script.js'; 
    // Como está no mesmo arquivo, vamos chamar diretamente.
    if (typeof renderShippingDetails === 'function') {
        renderShippingDetails();
    }


    const savedShipping = JSON.parse(sessionStorage.getItem('shippingInfo'));
    const shippingCost = savedShipping ? savedShipping.price : 0;

    const subtotal = this.getCartTotal();
    const total = subtotal + shippingCost;

    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (this.cart.length === 0) {
        // Não esconde a confirmação se o pedido foi feito
        if(document.getElementById('order-confirmation')?.style.display !== 'flex') {
            itemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        }
    } else {
        itemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.img || 'geral/img/logo/simbolo.png'}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${formatCurrency(item.price)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-wrapper">
                            <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                            <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}"><i class="ri-delete-bin-line"></i> Remover</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Atualiza os totais
    if(subtotalContainer) subtotalContainer.textContent = formatCurrency(subtotal);
    if(shippingContainer) shippingContainer.textContent = formatCurrency(shippingCost);
    if(totalContainer) totalContainer.textContent = formatCurrency(total);
}

}

export const cart = new Cart();