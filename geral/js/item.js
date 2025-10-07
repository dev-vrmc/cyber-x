// Arquivo: geral/js/item.js

import { supabase } from './supabase.js';
import { productManager } from './products.js';
import { cart } from './cart.js';
import { renderProducts, showToast } from './ui.js';
import { authManager } from './auth.js';
import { wishlistManager } from './wishlist.js'; // Importa o wishlistManager

// ===============================================
// INÍCIO DAS MODIFICAÇÕES
// ===============================================

// NOVA FUNÇÃO para renderizar as estrelas e a nota
function renderRating(product) {
    const container = document.getElementById('product-rating-container');
    if (!container) return;

    // Se não houver avaliações, exibe uma mensagem
    if (!product.review_count || product.review_count === 0) {
        container.innerHTML = `<p class="no-reviews">Este produto ainda não foi avaliado.</p>`;
        return;
    }

    const rating = product.average_rating || 0;
    const count = product.review_count;

    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.4 ? 1 : 0; // Arredonda .5 para cima
    const emptyStars = 5 - fullStars - halfStar;

    // Adiciona estrelas cheias
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="ri-star-fill"></i>';
    }
    // Adiciona meia estrela se necessário
    if (halfStar) {
        starsHTML += '<i class="ri-star-half-fill"></i>';
    }
    // Adiciona estrelas vazias
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="ri-star-line"></i>';
    }

    const ratingText = parseFloat(rating).toFixed(1).replace('.', ',');
    const reviewText = count === 1 ? 'avaliação' : 'avaliações';

    container.innerHTML = `
        <div class="stars">${starsHTML}</div>
        <span class="rating-value">${ratingText}</span>
        <span class="review-count">(${count} ${reviewText})</span>
    `;
}

// ===============================================
// FIM DAS MODIFICAÇÕES
// ===============================================


// Função para buscar e renderizar as avaliações de um produto
async function fetchAndRenderReviews(productId) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    // Busca reviews e o nome do autor (full_name) da tabela 'profiles'
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*, profile:profiles(full_name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar avaliações:", error);
        return;
    }

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>Este produto ainda não tem avaliações. Seja o primeiro!</p>';
    } else {
        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <p>${review.comment}</p>
                <footer>- ${review.profile?.full_name || 'Anônimo'}, ${new Date(review.created_at).toLocaleDateString()}</footer>
            </div>
        `).join('');
    }
}

// Função para simular o cálculo de frete
async function calculateShipping() {
    const cepInput = document.getElementById('cepInput');
    const resultDiv = document.getElementById('shippingResult');
    const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cep.length !== 8) {
        showToast('Por favor, insira um CEP válido.', 'error');
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            showToast('CEP não encontrado.', 'error');
            return;
        }

        // Lógica de cálculo SIMULADA
        let price = 25.50;
        let days = 7;
        if (data.uf === 'DF') {
            price = 12.00;
            days = 2;
        }

        resultDiv.innerHTML = `
            <p>Entrega para ${data.localidade} - ${data.uf}: <strong>R$ ${price.toFixed(2).replace('.', ',')}</strong></p>
            <p>Prazo estimado: ${days} dias úteis.</p>
        `;
        resultDiv.style.display = 'block';

    } catch (error) {
        showToast('Não foi possível calcular o frete.', 'error');
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.querySelector('.product-detail').innerHTML = '<h1>Produto não encontrado.</h1>';
        return;
    }

    const product = await productManager.getProductById(productId);

    if (!product) {
        document.querySelector('.product-detail').innerHTML = '<h1>Produto não encontrado.</h1>';
        return;
    }
    
    // ===============================================
    // INÍCIO DA MODIFICAÇÃO
    // ===============================================
    // Chama a função para renderizar a nota e as estrelas
    renderRating(product);
    // ===============================================
    // FIM DA MODIFICAÇÃO
    // ===============================================

    // Preenche a página com as informações do produto
    document.title = `${product.name} • Cyber X`;
    document.getElementById('productImg').src = product.img || 'geral/img/placeholder.png';
    document.getElementById('brandMeta').textContent = product.brand_meta || 'Marca não informada';
    document.getElementById('sku').textContent = `SKU: ${product.sku || 'N/A'}`;
    document.getElementById('title').textContent = product.name;
    document.getElementById('desc').textContent = product.description;
    document.getElementById('price').textContent =
        `R$ ${Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('installments').textContent = product.installments || '';
    document.getElementById('stock').textContent = `Estoque: ${product.stock || 0}`;
    buyBtn.addEventListener('click', () => cart.addToCart(product));
    document.getElementById('cepBtn').addEventListener('click', calculateShipping);

    // MODIFICADO: Lógica para produtos relacionados (aleatórios da mesma categoria)
    if (product.category && product.category.slug) {
        const relatedProducts = await productManager.getProducts({
            categorySlug: product.category.slug,
            random: true, // Pede resultados aleatórios
            limit: 6 // Pede 6 resultados
        });
        const filteredRelated = relatedProducts.filter(p => p.id != productId);
        renderProducts(filteredRelated, 'relatedProducts');
    }

    // --- LÓGICA DE AVALIAÇÕES E WISHLIST ---
    await fetchAndRenderReviews(productId);
    const user = await authManager.getCurrentUser();
    const reviewForm = document.getElementById('review-form');
    const reviewNotice = document.getElementById('review-login-notice');
    const wishlistBtn = document.getElementById('wishlist-btn');

    if (user) {
        reviewForm.style.display = 'flex';
        reviewNotice.style.display = 'none';

        // Checa se o item já está na wishlist e atualiza o ícone
        const isWishlisted = await wishlistManager.isWishlisted(productId);
        if (isWishlisted) {
            wishlistBtn.classList.add('active', 'ri-heart-fill');
            wishlistBtn.classList.remove('ri-heart-line');
        }

        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
            if (!ratingInput) {
                showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
                return;
            }
            const rating = ratingInput.value;
            const comment = document.getElementById('review-comment').value;

            const { error } = await supabase.from('reviews').insert({
                product_id: productId,
                user_id: user.id,
                rating,
                comment
            });
            if (error) {
                showToast(`Erro: ${error.message}`, 'error');
            } else {
                showToast('Avaliação enviada com sucesso!');
                reviewForm.reset();
                // Recarrega as avaliações e a nota principal após o envio
                await fetchAndRenderReviews(productId);
                const updatedProduct = await productManager.getProductById(productId);
                renderRating(updatedProduct);
            }
        });

        wishlistBtn.addEventListener('click', async () => {
            const isCurrentlyWishlisted = wishlistBtn.classList.contains('active');
            const success = isCurrentlyWishlisted
                ? await wishlistManager.removeFromWishlist(productId)
                : await wishlistManager.addToWishlist(productId);

            if (success) {
                wishlistBtn.classList.toggle('active');
                wishlistBtn.classList.toggle('ri-heart-fill');
                wishlistBtn.classList.toggle('ri-heart-line');
            }
        });

    } else {
        reviewForm.style.display = 'none';
        reviewNotice.style.display = 'block';
        wishlistBtn.addEventListener('click', () => {
            showToast('Você precisa estar logado para adicionar à wishlist.', 'error');
            window.location.href = 'login.html';
        });
    }
});