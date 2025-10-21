/* ==============================================
   ARQUIVO: geral/js/intro.js (VERSÃO 2.1 - CORRIGIDA)
   Lógica e Animação GSAP para o "Trailer" Holográfico
   ============================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Armazena as animações de rotação para poder "matá-las" depois
  let ringAnimations = [];

  // Pega o botão de pular
  const skipButton = document.querySelector(".intro-skip");

  // Cria a timeline principal do GSAP
  const tl = gsap.timeline({
    onComplete: redirectToHome,
    paused: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  });

  // Event listener para o botão de pular
  skipButton.addEventListener("click", () => {
    // Mata a timeline
    tl.kill();
    
    // NOVO: Mata as animações de rotação
    ringAnimations.forEach((anim) => anim.kill());
    
    // Vai direto para a função de redirecionar
    redirectToHome();
  });

  // --- INÍCIO DA SEQUÊNCIA DE ANIMAÇÃO ---
  // A duração total é de aprox. 6.5 segundos

  // 1. Fade-in inicial do overlay e do botão de pular
  tl.to("#intro-overlay", { autoAlpha: 1, duration: 0.5 });
  tl.to(".intro-skip", { autoAlpha: 1, duration: 0.5 }, "-=0.3");

  // 2. Animação dos Orbs de fundo
  tl.to(
    ".intro-orbs .orb",
    {
      autoAlpha: 0.14,
      scale: 1,
      stagger: 0.2,
      duration: 1,
      ease: "power2.out",
    },
    "<"
  );

  // 3. Animação do Holograma (Logo + Anéis)
  tl.to(
    ".intro-holo",
    {
      autoAlpha: 1,
      scale: 1,
      duration: 1,
      ease: "back.out(1.4)",
    },
    "-=0.5"
  );

  // 4. Animação dos Anéis girando
  tl.to(
    ".holo-ring",
    {
      autoAlpha: (i) => (i === 0 ? 0.9 : i === 1 ? 0.5 : 0.3), // i=0: ring-1, i=1: ring-2, i=2: ring-3
      scale: 1,
      stagger: 0.1,
      duration: 1,
      ease: "back.out(1.7)",
    },
    "-=0.8"
  );

  // Faz os anéis girarem infinitamente E ARMAZENA AS ANIMAÇÕES
  // NOVO: Adiciona as animações ao array 'ringAnimations'
  ringAnimations.push(
    gsap.to(".holo-ring.ring-1", {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: "none",
    })
  );
  ringAnimations.push(
    gsap.to(".holo-ring.ring-2", {
      rotation: -360,
      duration: 8,
      repeat: -1,
      ease: "none",
    })
  );
  ringAnimations.push(
    gsap.to(".holo-ring.ring-3", {
      rotation: 360,
      duration: 12,
      repeat: -1,
      ease: "none",
    })
  );

  // 5. Animação do Logo (aparece dentro do holograma)
  tl.to(
    ".intro-logo",
    {
      autoAlpha: 1,
      scale: 1,
      duration: 0.8,
      ease: "power2.out",
    },
    "-=0.5"
  );

  // 6. Animação do Título ("CYBER" e "X")
  tl.to(
    ".intro-word",
    {
      autoAlpha: 1,
      rotateX: 0,
      scale: 1,
      stagger: 0.2,
      duration: 1,
      ease: "back.out(1.2)",
    },
    "-=0.5"
  );

  // 7. Animação do Subtítulo
  tl.to(
    ".intro-sub",
    {
      autoAlpha: 0.9,
      y: 0,
      duration: 0.7,
      ease: "power2.out",
    },
    "-=0.6"
  );

  // 8. Animação da Barra de Progresso e Linhas de Scan
  tl.to(".intro-progress", { autoAlpha: 1, duration: 0.3 }, "+=0.5");
  
  tl.to(
    ".intro-progress-bar",
    {
      width: "100%",
      duration: 2,
      ease: "power1.inOut",
    },
    "<"
  );

  tl.to(
    ".intro-lines .line",
    {
      scaleX: 1,
      stagger: 0.3,
      duration: 1.5,
      ease: "power2.out",
      repeat: 1,
      yoyo: true,
    },
    "<"
  );

  // 9. Pausa final
  tl.to({}, { duration: 0.5 });


  /**
   * Função de redirecionamento
   * (Chamada no 'onComplete' da timeline ou no 'click' do skip)
   */
  function redirectToHome() {
    // NOVO: PRIMEIRO, mata as animações de rotação infinitas
    ringAnimations.forEach((anim) => anim.kill());

    // SEGUNDO, anima o fade-out e redireciona
    gsap.to("#intro-overlay", {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => {
        window.location.replace("index.html");
      },
    });
  }
}); // Fim do DOMContentLoaded