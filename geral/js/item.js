// Arquivo: geral/js/item.js

import { supabase } from './supabase.js';
import { productManager } from './products.js';
import { cart } from './cart.js';
import { renderProducts, showToast, showLoader, hideLoader } from './ui.js';
import { authManager } from './auth.js';
import { wishlistManager } from './wishlist.js';

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

// MODIFICADO: Aceita o ID do usuário logado
async function fetchAndRenderReviews(productId, loggedInUserId) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

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

            // ===============================================
            // INÍCIO DA MODIFICAÇÃO: Botão de Excluir
            // ===============================================
            // Verifica se o usuário logado é o autor da avaliação
            const isAuthor = loggedInUserId && review.user_id === loggedInUserId;
            const deleteButtonHTML = isAuthor
                ? `<button class"delete-my-review-btn" data-id="${review.id}">
                     <i class="ri-delete-bin-line"></i> Excluir
                   </button>`
                : '';
            // ===============================================
            // FIM DA MODIFICAÇÃO
            // ===============================================

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
                
                <footer>
                    <span>${new Date(review.created_at).toLocaleDateString()}</span>
                    ${deleteButtonHTML}
                </footer>
            </div>
            `;
        }).join('');
    }
}
// Função para simular o cálculo de frete
// ... (se houver, mantenha)


document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.querySelector('.product-detail').innerHTML = '<h1>Produto não encontrado.</h1>';
        return;
    }

    showLoader(); // <-- Loader principal da página

    try {
        const product = await productManager.getProductById(productId);

        if (!product) {
            document.querySelector('.product-detail').innerHTML = '<h1>Produto não encontrado.</h1>';
            return;
        }
        
        renderRating(product); // Renderiza a nota

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
        
        // Pega o botão de comprar
        const buyBtn = document.getElementById('buyBtn');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => cart.addToCart(product));
        }

        // --- LÓGICA DE AVALIAÇÕES E WISHLIST ---
        
        // MODIFICADO: Pega o usuário ANTES de renderizar as avaliações
        const user = await authManager.getCurrentUser();
        await fetchAndRenderReviews(productId, user ? user.id : null); // Passa o ID do usuário
        
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

            // Listener para o preview de imagens
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

            // Listener para ENVIAR avaliação
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // O 'user' já foi pego lá em cima, não precisa de 'await' aqui
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
                    // Upload de imagens...
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
                    await fetchAndRenderReviews(productId, user.id); // Re-renderiza as avaliações

                    // Re-busca o produto para atualizar a nota média na tela
                    const updatedProduct = await productManager.getProductById(productId);
                    if (updatedProduct) renderRating(updatedProduct);

                } catch (error) {
                    showToast(`Erro: ${error.message}`, 'error');
                } finally {
                    hideLoader();
                }
            });
            
            // Listener para o botão de Wishlist
            wishlistBtn.addEventListener('click', async () => {
                showLoader();
                try {
                    const isCurrentlyWishlisted = wishlistBtn.classList.contains('active');
                    const success = isCurrentlyWishlisted
                        ? await wishlistManager.removeFromWishlist(productId)
                        : await wishlistManager.addToWishlist(productId);

                    if (success) {
                        wishlistBtn.classList.toggle('active');
                        wishlistBtn.classList.toggle('ri-heart-fill');
                        wishlistBtn.classList.toggle('ri-heart-line');
                        
                        const message = isCurrentlyWishlisted
                            ? 'Produto removido da lista de desejos.'
                            : 'Produto adicionado à lista de desejos!';
                        showToast(message, 'success');
                    }
                } catch (error) {
                    showToast('Erro ao atualizar wishlist.', 'error');
                } finally {
                    hideLoader();
                }
            });

            // ===============================================
            // INÍCIO DA MODIFICAÇÃO: Listener para Excluir Avaliação
            // ===============================================
            const reviewsList = document.getElementById('reviews-list');
            reviewsList.addEventListener('click', async (e) => {
                const deleteBtn = e.target.closest('.delete-my-review-btn');
                if (!deleteBtn) return; // Sai se o clique não foi no botão

                const reviewId = deleteBtn.dataset.id;

                if (confirm('Tem certeza que deseja excluir sua avaliação? Esta ação não pode ser desfeita.')) {
                    showLoader();
                    try {
                        const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
                        
                        if (error) throw error;
                        
                        showToast('Avaliação excluída com sucesso!', 'success');
                        // Recarrega as avaliações e a nota do produto
                        await fetchAndRenderReviews(productId, user.id);
                        const updatedProduct = await productManager.getProductById(productId);
                        if (updatedProduct) renderRating(updatedProduct);

                    } catch (error) {
                        showToast(`Erro ao excluir avaliação: ${error.message}`, 'error');
                    } finally {
                        hideLoader();
                    }
                }
            });
            // ===============================================
            // FIM DA MODIFICAÇÃO
            // ===============================================

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
        hideLoader(); // <-- Loader principal da página
    }
});