/* ==============================================
   ARQUIVO: geral/js/gsap.js (VERSÃO CORRIGIDA COM fromTo)
   Animações seguras, sem "saltos" e sem alterar CSS
==============================================
*/

// Registra o plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/* ==============================================
   1. ANIMAÇÕES GLOBAIS (Toda Página)
==============================================
*/

// Animação de entrada do Header
gsap.fromTo(".header",
  { y: -60, autoAlpha: 0 }, // Estado INICIAL
  { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.1, ease: "power2.out" } // Estado FINAL
);

// Animação escalonada (stagger) dos links da navegação
gsap.fromTo(".nav_container .nav__item",
  { y: -20, autoAlpha: 0 }, // INICIAL
  { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "power2.out" } // FINAL
);

/* ==============================================
   2. ANIMAÇÕES DA PÁGINA INICIAL (index.html)
==============================================
*/
if (document.querySelector(".home__index")) {
  // Animação do carrossel (swiper)
  gsap.fromTo(".home__index",
    { autoAlpha: 0 }, // INICIAL
    { autoAlpha: 1, duration: 1.2, delay: 0.5, ease: "power1.inOut" } // FINAL
  );

  // Animação dos ícones de "Identidade"
  gsap.fromTo(".identity__item",
    { autoAlpha: 0, y: 30 }, // INICIAL
    { // FINAL
      autoAlpha: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".identity__grid",
        start: "top 85%"
      }
    }
  );

  // Animação dos cards de "Produtos em Destaque"
  gsap.fromTo("#featured-products-container .product-card",
    { autoAlpha: 0, scale: 0.9 }, // INICIAL
    { // FINAL
      autoAlpha: 1,
      scale: 1,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#featured-products-container",
        start: "top 85%"
      }
    }
  );

  // Animação dos cards de "Público-Alvo"
  gsap.fromTo(".audience__card",
    { autoAlpha: 0, y: 40 }, // INICIAL
    { // FINAL
      autoAlpha: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".audience__grid",
        start: "top 85%"
      }
    }
  );

  // Animação da seção de "Feedback/Contato"
  gsap.fromTo(".contact__me",
    { autoAlpha: 0, y: 40 }, // INICIAL
    { // FINAL
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".contact__me",
        start: "top 85%"
      }
    }
  );
}

/* ==============================================
   3. PÁGINAS DE CATEGORIA (cellphones.html, etc.)
==============================================
*/
if (document.querySelector(".category-main")) {
  // Animação do Título da Categoria
  gsap.fromTo(".category-title",
    { autoAlpha: 0, y: -30 }, // INICIAL
    { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" } // FINAL
  );

  // Animação da Sidebar de Filtros
  gsap.fromTo(".filters-sidebar",
    { autoAlpha: 0, x: -50 }, // INICIAL
    { autoAlpha: 1, x: 0, duration: 1, delay: 0.7, ease: "power2.out" } // FINAL
  );

  // Animação da Grade de Produtos
  gsap.fromTo(".products-grid .product-card",
    { autoAlpha: 0, scale: 0.9 }, // INICIAL
    { autoAlpha: 1, scale: 1, stagger: 0.05, duration: 0.5, delay: 0.8, ease: "power2.out" } // FINAL
  );
}

/* ==============================================
   4. PÁGINA DE ITEM (item.html)
==============================================
*/
if (document.querySelector(".product-detail")) {
  // Animação da imagem do produto
  gsap.fromTo(".product-detail .preview",
    { autoAlpha: 0, x: -80 }, // INICIAL
    { autoAlpha: 1, x: 0, duration: 0.9, delay: 0.5, ease: "power2.out" } // FINAL
  );

  // Animação das informações do produto
  gsap.fromTo(".product-detail .info",
    { autoAlpha: 0, x: 80 }, // INICIAL
    { autoAlpha: 1, x: 0, duration: 0.9, delay: 0.7, ease: "power2.out" } // FINAL
  );

  // Animação da Seção de Avaliações
  gsap.fromTo(".reviews-section",
    { autoAlpha: 0, y: 40 }, // INICIAL
    { // FINAL
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".reviews-section",
        start: "top 85%"
      }
    }
  );

  // Animação dos Produtos Relacionados
  gsap.fromTo(".related-products .product-card",
    { autoAlpha: 0, scale: 0.9 }, // INICIAL
    { // FINAL
      autoAlpha: 1,
      scale: 1,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".related-products",
        start: "top 90%"
      }
    }
  );
}

/* ==============================================
   5. PÁGINA DO CARRINHO (cart.html)
==============================================
*/
if (document.querySelector(".cart__main")) {
  // Animação do Título
  gsap.fromTo("#cart-content h1",
    { autoAlpha: 0, y: -30 }, // INICIAL
    { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" } // FINAL
  );

  // Animação dos Itens do Carrinho
  gsap.fromTo(".cart-item",
    { autoAlpha: 0, x: -40 }, // INICIAL
    { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.6, delay: 0.7, ease: "power2.out" } // FINAL
  );

  // Animação do Resumo
  gsap.fromTo(".cart-summary",
    { autoAlpha: 0, x: 40 }, // INICIAL
    { autoAlpha: 1, x: 0, duration: 0.8, delay: 0.8, ease: "power2.out" } // FINAL
  );
}

/* ==============================================
   6. PÁGINA DA CONTA (account.html)
==============================================
*/
if (document.querySelector(".account__main")) {
  // Animação do Formulário da Conta
  gsap.fromTo(".account-container",
    { autoAlpha: 0, y: 40 }, // INICIAL
    { autoAlpha: 1, y: 0, duration: 1, delay: 0.5, ease: "power2.out" } // FINAL
  );

  // Animação da Lista de Desejos (com ScrollTrigger)
  gsap.fromTo(".wishlist-container",
    { autoAlpha: 0, y: 40 }, // INICIAL
    { // FINAL
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".wishlist-container",
        start: "top 90%"
      }
    }
  );

  // Animação do Histórico de Pedidos (com ScrollTrigger)
  gsap.fromTo(".orders-container",
    { autoAlpha: 0, y: 40 }, // INICIAL
    { // FINAL
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".orders-container",
        start: "top 90%"
      }
    }
  );
}

/* ==============================================
   7. PÁGINAS DE TEXTO (howpay.html, segurity.html)
==============================================
*/
if (document.querySelector(".main-content")) {
  // Animação da seção de texto principal
  gsap.fromTo(".text-section",
    { autoAlpha: 0, y: 40 }, // INICIAL
    { autoAlpha: 1, y: 0, duration: 1, delay: 0.5, ease: "power2.out" } // FINAL
  );

  // Animação específica para a lista de "Como Comprar"
  if (document.querySelector(".steps-list")) {
    gsap.fromTo(".step-item",
      { autoAlpha: 0, x: -30 }, // INICIAL
      { autoAlpha: 1, x: 0, stagger: 0.15, duration: 0.7, delay: 0.8, ease: "power2.out" } // FINAL
    );
  }
}

/* ==============================================
   8. PAINEL ADMIN (admin.html)
==============================================
*/
if (document.querySelector(".admin-dashboard-layout")) {
  // Animação da Sidebar Admin
  gsap.fromTo(".admin-sidebar",
    { autoAlpha: 0, x: -100 }, // INICIAL
    { autoAlpha: 1, x: 0, duration: 0.9, delay: 0.5, ease: "power2.out" } // FINAL
  );

  // Animação do Conteúdo Admin (o painel da direita)
  gsap.fromTo(".admin-content",
    { autoAlpha: 0, y: 20 }, // INICIAL
    { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.7, ease: "power2.out" } // FINAL
  );

  // Animação dos Cards de Estatística (só no admin)
  gsap.fromTo(".stat-card",
    { autoAlpha: 0, scale: 0.8 }, // INICIAL
    { autoAlpha: 1, scale: 1, stagger: 0.1, duration: 0.6, delay: 1.0, ease: "back.out(1.7)" } // FINAL
  );
}

/* ==============================================
   9. LOGIN/CADASTRO (cadaster.html, login.html)
==============================================
*/
if (document.querySelector(".section__login")) {
  // Estas já usavam fromTo, apenas ajustei para autoAlpha
  gsap.fromTo(".information__login",
    { x: 100, autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: 2, delay: 0, ease: "power2.out" }
  );

  gsap.fromTo(".hr__login",
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 3, delay: 0.2 }
  );

  gsap.fromTo(".textfield",
    { autoAlpha: 0, scale: 0.9 },
    { autoAlpha: 1, scale: 1, duration: 1.5, delay: 0.5, ease: "power2.out" }
  );

  gsap.fromTo(".button__login",
    { autoAlpha: 0, y: 20 },
    { autoAlpha: 1, y: 0, duration: 1.5, delay: 1.0, ease: "power2.out" }
  );

  gsap.fromTo(".other-user",
    { autoAlpha: 0, },
    { autoAlpha: 1, duration: 3, delay: 1.2 }
  );
  gsap.to(".gsap-login-links",
    { x: -49 }
  );

  gsap.fromTo(".logo-holograma",
    { autoAlpha: 0, scale: 0.5 },
    { autoAlpha: 1, scale: 1, duration: 1.5, delay: 0.2, ease: "elastic.out(1, 0.5)" } // FINAL
  );
}
