// Arquivo: geral/js/item.js

import { supabase } from './supabase.js';
import { productManager } from './products.js';
import { cart } from './cart.js';
import { renderProducts, showToast, showLoader, hideLoader } from './ui.js';
import { authManager } from './auth.js';
import { wishlistManager } from './wishlist.js';

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
// ===============================================
async function fetchAndRenderReviews(productId) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    // MODIFICADO: Seleciona também a 'avatar_url' do perfil
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*, profile:profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar avaliações:", error);
        return;
    }

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>Este produto ainda não tem avaliações. Seja o primeiro!</p>';
    } else {
        reviewsList.innerHTML = reviews.map(review => {
            const avatarSrc = review.profile?.avatar_url || 'geral/img/logo/simbolo.png';
            const authorName = review.profile?.full_name || 'Usuário Anônimo';

            const imagesHTML = (review.image_urls || []).map(url =>
                `<img src="${url}" alt="Imagem da avaliação" class="review-card-image">`
            ).join('');

            return `
            <div class="review-card">
                <header>
                    <img src="${avatarSrc}" alt="Avatar de ${authorName}" class="review-avatar">
                    <div class="review-author-info">
                        <span class="review-author-name">${authorName}</span>
                        <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    </div>
                </header>
                <p>${review.comment}</p>
                <div class="review-card-images">${imagesHTML}</div>
                <footer>${new Date(review.created_at).toLocaleDateString()}</footer>
            </div>
            `;
        }).join('');
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

    showLoader(); // <-- ADICIONADO
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
    } finally {
        hideLoader(); // <-- ADICIONADO
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.querySelector('.product-detail').innerHTML = '<h1>Produto não encontrado.</h1>';
        return;
    }

    showLoader(); // <-- ADICIONADO (Loader principal da página)

    try {
        const product = await productManager.getProductById(productId);

        if (!product) {
            document.querySelector('.product-detail').innerHTML = '<h1>Produto não encontrado.</h1>';
            return;
        }
        
        renderRating(product); //

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
            const relatedProducts = await productManager.getProducts({ //
                categorySlug: product.category.slug,
                random: true, // Pede resultados aleatórios
                limit: 6 // Pede 6 resultados
            });
            const filteredRelated = relatedProducts.filter(p => p.id != productId);
            renderProducts(filteredRelated, 'relatedProducts');
        }

        // --- LÓGICA DE AVALIAÇÕES E WISHLIST ---
        await fetchAndRenderReviews(productId); //
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

            // Adicione um listener para o input de arquivos para mostrar o preview
            const imageUploadInput = document.getElementById('review-images-upload');
            const imagePreviewContainer = document.getElementById('review-images-preview');

            imageUploadInput.addEventListener('change', () => {
                imagePreviewContainer.innerHTML = ''; // Limpa previews antigos
                const files = Array.from(imageUploadInput.files);
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const img = document.createElement('img');
                        img.src = reader.result;
                        img.classList.add('review-image-preview');
                        imagePreviewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
            });

            // ESTE BLOCO JÁ ESTAVA CORRETO!
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const user = await authManager.getCurrentUser();
                if (!user) return;

                showLoader();

                const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
                if (!ratingInput) {
                    showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
                    hideLoader();
                    return;
                }

                const rating = ratingInput.value;
                const comment = document.getElementById('review-comment').value;
                const files = document.getElementById('review-images-upload').files;
                const imageUrls = [];

                try {
                    // Faz o upload de todas as imagens em paralelo
                    const uploadPromises = Array.from(files).map(async (file) => {
                        const fileName = `${user.id}/${productId}/${Date.now()}-${file.name}`;
                        const { error: uploadError } = await supabase.storage
                            .from('review-images')
                            .upload(fileName, file);

                        if (uploadError) {
                            throw new Error(`Falha no upload de ${file.name}: ${uploadError.message}`);
                        }

                        const { data } = supabase.storage.from('review-images').getPublicUrl(fileName);
                        return data.publicUrl;
                    });

                    // Espera todas as promessas de upload terminarem
                    const uploadedUrls = await Promise.all(uploadPromises);
                    imageUrls.push(...uploadedUrls);

                    // Insere a avaliação no banco de dados
                    const { error: insertError } = await supabase.from('reviews').insert({
                        product_id: productId,
                        user_id: user.id,
                        rating,
                        comment,
                        image_urls: imageUrls.length > 0 ? imageUrls : null,
                    });

                    if (insertError) throw insertError;

                    showToast('Avaliação enviada com sucesso!');
                    reviewForm.reset();
                    document.getElementById('review-images-preview').innerHTML = '';
                    await fetchAndRenderReviews(productId); // Re-renderiza as avaliações

                    // Re-busca o produto para atualizar a nota média na tela
                    const updatedProduct = await productManager.getProductById(productId);
                    if (updatedProduct) renderRating(updatedProduct);

                } catch (error) {
                    showToast(`Erro: ${error.message}`, 'error');
                } finally {
                    hideLoader();
                }
            });
            
            // Loader para o botão de Wishlist
            wishlistBtn.addEventListener('click', async () => {
                showLoader(); // <-- ADICIONADO
                try {
                    const isCurrentlyWishlisted = wishlistBtn.classList.contains('active');
                    const success = isCurrentlyWishlisted
                        ? await wishlistManager.removeFromWishlist(productId)
                        : await wishlistManager.addToWishlist(productId);

                    if (success) {
                        wishlistBtn.classList.toggle('active');
                        wishlistBtn.classList.toggle('ri-heart-fill');
                        wishlistBtn.classList.toggle('ri-heart-line');
                    }
                } catch (error) {
                    showToast('Erro ao atualizar wishlist.', 'error');
                } finally {
                    hideLoader(); // <-- ADICIONADO
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
    } catch (error) {
        console.error("Erro ao carregar a página do produto:", error);
        document.querySelector('.product-detail').innerHTML = '<h1>Erro ao carregar produto.</h1>';
    } finally {
        hideLoader(); // <-- ADICIONADO (Loader principal da página)
    }
});