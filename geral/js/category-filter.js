// Arquivo: geral/js/category-filter.js

import { productManager } from './products.js';
import { renderProducts, showLoader, hideLoader } from './ui.js'; // <-- Importa os loaders

// Função principal para carregar produtos com base nos filtros da página
async function loadCategoryProducts() {
    const container = document.getElementById('products-list-container');
    const filtersForm = document.getElementById('filters-form');
    
    if (!container || !filtersForm) return;

    showLoader(); // <-- ADICIONADO
    
    try {
        // Pega a categoria principal da página
        const mainCategorySlug = container.dataset.category;

        // Pega valores dos filtros
        const minPrice = filtersForm.querySelector('#min-price').value;
        const maxPrice = filtersForm.querySelector('#max-price').value;
        const sortBy = filtersForm.querySelector('#sort-by').value;

        const options = {
            categorySlug: mainCategorySlug,
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            sortBy: sortBy,
        };
        
        const products = await productManager.getProducts(options); //
        renderProducts(products, container.id);

    } catch (error) {
        console.error("Erro ao carregar produtos da categoria:", error);
    } finally {
        hideLoader(); // <-- ADICIONADO
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Carrega os produtos assim que a página é aberta
    loadCategoryProducts();

    const filtersForm = document.getElementById('filters-form');
    if (filtersForm) {
        // Recarrega os produtos sempre que o formulário de filtro é enviado
        filtersForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loadCategoryProducts();
        });
    }

    const container = document.getElementById('products-list-container');
    if (container) {
        // Adiciona o listener de clique para os cards
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card && card.dataset.id) {
                window.location.href = `item.html?id=${card.dataset.id}`;
            }
        });
    }
});