
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id'); // ?id=1
    
    const product = products.find(p => p.id === productId) || products[0]; // fallback
    
    if (!product) return;
    
    // elementos
    const titleEl = document.getElementById('title');
    const descEl = document.getElementById('desc');
    const priceEl = document.getElementById('price');
    const priceBadgeEl = document.getElementById('priceBadge');
    const productImgEl = document.getElementById('productImg');
    const skuEl = document.getElementById('sku');
    const brandMetaEl = document.getElementById('brandMeta');
    const installmentsEl = document.getElementById('installments');
    const stockEl = document.getElementById('stock');
    const sizesList = document.getElementById('sizesList');
    const reviewStarsEl = document.getElementById('reviewStars');
    const reviewTextEl = document.getElementById('reviewText');

    titleEl.textContent = product.name;
    descEl.textContent = product.description;
    priceEl.textContent = product.price;
    priceBadgeEl.textContent = product.price;
    productImgEl.src = product.img;
    skuEl.textContent = `SKU: ${product.sku}`;
    brandMetaEl.textContent = product.brandMeta;
    installmentsEl.textContent = product.installments;
    if (stockEl) stockEl.textContent = product.stock;
    
    // populando tamanhos
    sizesList.innerHTML = "";
    product.sizes.forEach((s, idx) => {
        const btn = document.createElement('button');
        btn.className = `size-btn ${idx===0 ? 'active':''}`;
        btn.dataset.size = s;
        btn.setAttribute('aria-selected', idx===0 ? "true" : "false");
        btn.textContent = s;
        sizesList.appendChild(btn);
    });
    
    // reviews
    if (reviewStarsEl) {
        const fullStars = '★'.repeat(Math.floor(product.rating));
        const emptyStars = '☆'.repeat(5 - Math.floor(product.rating));
        reviewStarsEl.textContent = fullStars + emptyStars;
    }
    if (reviewTextEl) reviewTextEl.textContent = product.reviewText;
});


const products = [
  {
    id: "1",
    name: "Headphone Cyber Drivers 40mm, Bluetooth, Preto",
    img: "geral/img/perifericos/headset.png",
    price: "R$ 169,99",
    sku: "HD-1234",
    brandMeta: "Produto • Linhagem Tech",
    description: "Headphone Bluetooth com drivers de 40mm...",
    installments: "ou 6x de R$ 28,33 sem juros",
    stock: "Em estoque • Envio rápido",
    sizes: ["STD", "Pro", "Ultra"],
    rating: 4.5,
    reviewText: "Produto bem avaliado por conforto e som limpo"
  },
  {
    id: "2",
    name: "Placa Mãe Gigabyte B550M, AMD AM4, Micro ATX",
    img: "geral/img/placa-giga.png",
    price: "R$ 899,99",
    sku: "MB-5678",
    brandMeta: "Produto • Linhagem Tech",
    description: "Placa mãe AMD B550M com suporte DDR4...",
    installments: "ou 12x de R$ 74,99 sem juros",
    stock: "Em estoque • Envio rápido",
    sizes: ["STD", "Pro"],
    rating: 4.8,
    reviewText: "Altamente confiável e durável"
  }
];
