const temaToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const body = document.querySelector('body');

temaToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
});

if (body.classList.contains('dark-mode')) {
  themeIcon.src = 'imgs/tema-claro.png';
} else {
  themeIcon.src = 'imgs/tema-claro-escuro.png';
}

/* ===== CARROSSEL DE PARCERIAS DA TATIANE ===== */

(() => {
  const section = document.querySelector('.glass-section');

  // Evita erros se o carrossel ainda não estiver no HTML.
  if (!section) return;

  const cards = [...section.querySelectorAll('.glass-card')];
  const prevButton = section.querySelector('.glass-prev');
  const nextButton = section.querySelector('.glass-next');
  const dotsContainer = section.querySelector('.glass-dots');

  if (!cards.length || !prevButton || !nextButton) return;

  let active = 0;
  let touchStartX = 0;

  const dots = cards.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'glass-dot';
    dot.setAttribute('aria-label', `Mostrar campanha ${index + 1}`);
    dot.addEventListener('click', () => {
      active = index;
      render();
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

 
function render() {
  const total = cards.length;

  cards.forEach((card, index) => {
    let offset = index - active;

    // Faz o carrossel circular
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const distance = Math.abs(offset);
    const isMobile = window.innerWidth <= 600;
    const spacing = isMobile ? 65 : 75;

    card.style.transform = `
      translateX(${offset * spacing}%)
      scale(${distance === 0 ? 1 : distance === 1 ? 0.83 : 0.68})
      rotateY(${offset * -9}deg)
    `;

    card.style.opacity =
      distance > 2 ? "0" : distance === 2 ? "0.45" : "1";

    card.style.filter =
      distance === 0 ? "none" : "brightness(0.65)";

    card.style.zIndex = String(10 - distance);
    card.style.pointerEvents = distance > 1 ? "none" : "auto";

    card.setAttribute(
      "aria-hidden",
      distance > 1 ? "true" : "false"
    );
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === active);
    dot.setAttribute(
      "aria-current",
      index === active ? "true" : "false"
    );
  });

  
cards.forEach((card, index) => {
  const video = card.querySelector("video");

  if (!video) return;

  if (index === active) {
    video.muted = true;

    video.play()
      .then(() => {
        card.classList.add("is-playing");
      })
      .catch(() => {
        card.classList.remove("is-playing");
      });
  } else {
    video.pause();
    video.currentTime = 0;
    card.classList.remove("is-playing");
  }
});

}


  function move(direction) {
    active = (active + direction + cards.length) % cards.length;
    render();
  }

  prevButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));

  // Permite navegar com as setas do teclado quando a seção estiver focada.
  section.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });

  // Navegação por gesto no celular.
  section.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true }
  );

  section.addEventListener(
    'touchend',
    (event) => {
      const delta = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
    },
    { passive: true }
  );

  render();
})();

(() => {
  const section = document.querySelector('.section-sobre');
  if (!section) return;

  let ticking = false;

  function updateExpansion() {
    ticking = false;

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const start = viewportHeight * 0.95;
    const end = viewportHeight * 0.2;

    const progress = Math.max(
      0,
      Math.min(1, (start - rect.top) / (start - end))
    );

    section.style.setProperty('--zoom-progress', progress.toFixed(3));

    const mobile = window.innerWidth <= 600;

    const stageHeight = (mobile ? 280 : 440) + progress * (mobile ? 85 : 140);
    const cardWidth = (mobile ? 200 : 260) + progress * (mobile ? 20 : 40);
    const cardHeight = (mobile ? 260 : 350) + progress * (mobile ? 40 : 60);

    section.style.setProperty('--stage-height', `${stageHeight}px`);
    section.style.setProperty('--card-width', `${cardWidth}px`);
    section.style.setProperty('--card-height', `${cardHeight}px`);

    section.style.marginTop = `${-180 * progress}px`;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateExpansion);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);

  updateExpansion();
})();


/* ===== ANIMAÇÃO DAS ESTATÍSTICAS ===== */

(() => {
  const cards = document.querySelectorAll(".card-animado");

  if (!cards.length) return;

  const formatarNumero = (numero) => {
    return numero.toLocaleString("pt-BR");
  };

  function animarNumero(elemento) {
    const destino = Number(elemento.dataset.target);
    const duracao = 1800;
    const inicio = performance.now();

    function atualizar(tempoAtual) {
      const progresso = Math.min((tempoAtual - inicio) / duracao, 1);

      // Suaviza a aceleração e desaceleração
      const suavizacao = 1 - Math.pow(1 - progresso, 3);

      const valorAtual = Math.floor(destino * suavizacao);

      elemento.textContent = formatarNumero(valorAtual);

      if (progresso < 1) {
        requestAnimationFrame(atualizar);
      }
    }

    requestAnimationFrame(atualizar);
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        const card = entrada.target;

        card.classList.add("ativo");

        const numero = card.querySelector(".numero-animado");

        if (numero && !numero.dataset.animado) {
          numero.dataset.animado = "true";
          animarNumero(numero);
        }

        observador.unobserve(card);
      }
    });
  }, {
    threshold: 0.35
  });

  cards.forEach((card) => observador.observe(card));
})();

