// geral/js/search.js
(function () {
  'use strict';

  const STORAGE_KEY = 'products';

  function getAllProducts() {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      if (!Array.isArray(saved)) saved = [];
    } catch {
      saved = [];
    }
    return saved;
  }

  function renderSearchResults(term) {
    const container = document.getElementById('products-container');
    if (!container) return;

    const products = getAllProducts();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));

    if (!filtered.length) {
      container.innerHTML = '<p style="padding:12px;">Nenhum produto encontrado.</p>';
      return;
    }

    container.innerHTML = '';
    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = p.id;
      card.dataset.name = p.name;
      card.dataset.price = p.price;

      card.innerHTML = `
        <div class="product-image">
          <img src="${p.img}" alt="${p.name}">
        </div>
        <h3 class="product-title">${p.name}</h3>
        <p class="product-price">R$ ${p.price}</p>
        <a href="item.html?id=${p.id}" class="btn__product">Ver Item</a>
      `;
      container.appendChild(card);
    });
  }

  function bindSearch() {
    const input = document.getElementById('input-search');
    if (!input) return;

    input.addEventListener('input', () => {
      const term = input.value.trim();
      renderSearchResults(term);
    });
  }

  document.addEventListener('DOMContentLoaded', bindSearch);
})();
