/* ==============================================
   NOVO ARQUIVO: geral/js/gsap.js
   Animações específicas e seguras para cada página
==============================================
*/

// Registra o plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- 1. ANIMAÇÕES GLOBAIS (Toda Página) ---

// Animação de entrada do Header
gsap.rom(".header", {
  y: -60, // Começa 60px acima
  opacity: 0,
  duration: 0.8,
  delay: 0.1, // Um pequeno delay para garantir que o DOM carregou
  ease: "power2.out"
});

// Animação escalonada (stagger) dos links da navegação
gsap.from(".nav_container .nav__item", {
  y: -20,
  opacity: 0,
  duration: 0.6,
  stagger: 0.1, // Anima um de cada vez
  delay: 0.3, // Começa logo após o header
  ease: "power2.out"
});

// Animação do Footer (só quando ele aparece na tela)
gsap.from(".footer__container", {
  y: 50,
  opacity: 0,
  duration: 1.0,
  ease: "power2.out",
});


// --- 2. ANIMAÇÕES DA PÁGINA INICIAL (index.html) ---
if (document.querySelector(".home__index")) {
  // Animação do carrossel (swiper)
  gsap.from(".home__index", {
    opacity: 0,
    duration: 1.2,
    delay: 0.5,
    ease: "power1.inOut"
  });

  // Animação dos ícones de "Identidade"
  gsap.from(".identity__item", {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".identity__grid",
      start: "top 85%"
    }
  });

  // Animação dos cards de "Produtos em Destaque"
  gsap.from("#featured-products-container .product-card", {
    opacity: 0,
    scale: 0.9,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#featured-products-container",
      start: "top 85%"
    }
  });

  // Animação dos cards de "Público-Alvo"
  gsap.from(".audience__card", {
    opacity: 0,
    y: 40,
    stagger: 0.15,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".audience__grid",
      start: "top 85%"
    }
  });

  // Animação da seção de "Feedback/Contato"
  gsap.from(".contact__me", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".contact__me",
      start: "top 85%"
    }
  });
}

// --- 3. ANIMAÇÕES DE PÁGINAS DE CATEGORIA (cellphones.html, etc.) ---
if (document.querySelector(".category-main")) {
  // Animação do Título da Categoria
  gsap.from(".category-title", {
    opacity: 0,
    y: -30,
    duration: 0.8,
    delay: 0.5,
    ease: "power2.out"
  });

  // Animação da Sidebar de Filtros
  gsap.from(".filters-sidebar", {
    opacity: 0,
    x: -50, // Vem da esquerda
    duration: 1,
    delay: 0.7,
    ease: "power2.out"
  });

  // Animação da Grade de Produtos
  gsap.from(".products-grid .product-card", {
    opacity: 0,
    scale: 0.9,
    stagger: 0.05, // Stagger bem rápido
    duration: 0.5,
    delay: 0.8, // Espera o título e sidebar
    ease: "power2.out"
    // Não precisa de ScrollTrigger aqui, pois eles aparecem junto com a sidebar
  });
}

// --- 4. ANIMAÇÕES DA PÁGINA DE ITEM (item.html) ---
if (document.querySelector(".product-detail")) {
  // Animação da imagem do produto
  gsap.from(".product-detail .preview", {
    opacity: 0,
    x: -80,
    duration: 0.9,
    delay: 0.5,
    ease: "power2.out"
  });

  // Animação das informações do produto
  gsap.from(".product-detail .info", {
    opacity: 0,
    x: 80,
    duration: 0.9,
    delay: 0.7, // Um pouco depois da imagem
    ease: "power2.out"
  });

  // Animação da Seção de Avaliações
  gsap.from(".reviews-section", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".reviews-section",
      start: "top 85%"
    }
  });

  // Animação dos Produtos Relacionados
  gsap.from(".related-products .product-card", {
    opacity: 0,
    scale: 0.9,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".related-products",
      start: "top 90%"
    }
  });
}

// --- 5. ANIMAÇÕES DA PÁGINA DO CARRINHO (cart.html) ---
if (document.querySelector(".cart__main")) {
  // Animação do Título
  gsap.from("#cart-content h1", {
    opacity: 0,
    y: -30,
    duration: 0.8,
    delay: 0.5,
    ease: "power2.out"
  });

  // Animação dos Itens do Carrinho
  gsap.from(".cart-item", {
    opacity: 0,
    x: -40,
    stagger: 0.1,
    duration: 0.6,
    delay: 0.7, // Depois do título
    ease: "power2.out"
  });

  // Animação do Resumo
  gsap.from(".cart-summary", {
    opacity: 0,
    x: 40,
    duration: 0.8,
    delay: 0.8,
    ease: "power2.out"
  });
}

// --- 6. ANIMAÇÕES DA PÁGINA DA CONTA (account.html) ---
if (document.querySelector(".account__main")) {
  // Animação do Formulário da Conta
  gsap.from(".account-container", {
    opacity: 0,
    y: 40,
    duration: 1,
    delay: 0.5,
    ease: "power2.out"
  });

  // Animação da Lista de Desejos (com ScrollTrigger)
  gsap.from(".wishlist-container", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".wishlist-container",
      start: "top 90%"
    }
  });

  // Animação do Histórico de Pedidos (com ScrollTrigger)
  gsap.from(".orders-container", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".orders-container",
      start: "top 90%"
    }
  });
}

// --- 7. ANIMAÇÕES DE PÁGINAS DE TEXTO (howpay.html, segurity.html) ---
// Usamos .main-content como gatilho
if (document.querySelector(".main-content")) {
  // Animação da seção de texto principal
  gsap.from(".text-section", {
    opacity: 0,
    y: 40,
    duration: 1,
    delay: 0.5,
    ease: "power2.out"
  });

  // Animação específica para a lista de "Como Comprar"
  gsap.from(".step-item", {
    opacity: 0,
    x: -30, // Vem da esquerda
    stagger: 0.15,
    duration: 0.7,
    delay: 0.8, // Depois que o container aparecer
    ease: "power2.out"
  });
}

// --- 8. ANIMAÇÕES DO PAINEL ADMIN (admin.html) ---
if (document.querySelector(".admin-dashboard-layout")) {
  // Animação da Sidebar Admin
  gsap.from(".admin-sidebar", {
    opacity: 0,
    x: -100, // Vem da esquerda
    duration: 0.9,
    delay: 0.5,
    ease: "power2.out"
  });

  // Animação do Conteúdo Admin (o painel da direita)
  gsap.from(".admin-content", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.7,
    ease: "power2.out"
  });

  // Animação dos Cards de Estatística (só no admin)
  gsap.from(".stat-card", {
    opacity: 0,
    scale: 0.8,
    stagger: 0.1,
    duration: 0.6,
    delay: 1.0, // Depois que o painel de conteúdo carregar
    ease: "back.out(1.7)" // Efeito "elástico"
  });
}

// --- 9. ANIMAÇÕES DE LOGIN/CADASTRO (Suas originais, estão seguras) ---
if (document.querySelector(".section__login")) {
  gsap.fromTo(".information__login",
    { x: 100, opacity: 0 },
    { x: 0, duration: 2, opacity: 1, delay: 0, ease: "power2.out" }
  );

  gsap.fromTo(".hr__login",
    { opacity: 0 },
    { duration: 3, opacity: 1, delay: 0.2 }
  );

  gsap.fromTo(".textfield",
    { opacity: 0, scale: 0.9 },
    { scale: 1, duration: 1.5, opacity: 1, delay: 0.5, ease: "power2.out" }
  );

  gsap.fromTo(".button__login",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1.5, delay: 1.0, ease: "power2.out" }
  );

  gsap.fromTo(".other-user",
    { opacity: 0 },
    { duration: 2, opacity: 1, delay: 1.2 }
  );

  gsap.from(".logo-holograma", {
    opacity: 0,
    scale: 0.5,
    duration: 1.5,
    delay: 0.2,
    ease: "elastic.out(1, 0.5)"
  });
}