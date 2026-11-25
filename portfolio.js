
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".portfolio-carousel");
  if (!carousel) return;

  const viewport = carousel.querySelector(".portfolio-viewport");
  const track = carousel.querySelector(".portfolio-track");
  const prev = carousel.querySelector(".portfolio-prev");
  const next = carousel.querySelector(".portfolio-next");

  const originals = [...track.children];
  const total = originals.length;
  if (total < 2) return;

  // Placeholder automático para imagens inexistentes
  function handleImages(root) {
    root.querySelectorAll("img").forEach(img => {
      const missing = () => img.classList.add("is-missing");
      img.addEventListener("error", missing);

      if (img.complete && img.naturalWidth === 0) {
        missing();
      }
    });
  }

  // Criar cópias para o carrossel infinito
  const leftClones = originals.map(card => card.cloneNode(true));
  const rightClones = originals.map(card => card.cloneNode(true));

  leftClones.forEach(card => {
    card.setAttribute("aria-hidden", "true");
    card.tabIndex = -1;
    track.insertBefore(card, track.firstChild);
  });

  rightClones.forEach(card => {
    card.setAttribute("aria-hidden", "true");
    card.tabIndex = -1;
    track.appendChild(card);
  });

  handleImages(track);

  let index = total;
  let animating = false;
  let timer = null;
  let dragging = false;
  let startX = 0;
  let dragX = 0;
  let moved = false;
  let suppressClick = false;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function stepSize() {
    const card = track.querySelector(".portfolio-card");
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function render(animated = true) {
    track.style.transition =
      animated && !reducedMotion.matches
        ? "transform .65s cubic-bezier(.22,1,.36,1)"
        : "none";

    track.style.transform =
      `translate3d(${-index * stepSize()}px,0,0)`;

    const all = [...track.children];
    all.forEach(card => card.classList.remove("is-center"));

    const visible = window.innerWidth <= 700
      ? 1
      : window.innerWidth <= 1050 ? 2 : 3;

    const center = index + Math.floor((visible - 1) / 2);
    all[center]?.classList.add("is-center");
  }

  function normalize() {
    if (index >= total * 2) {
      index -= total;
      render(false);
    } else if (index < total) {
      index += total;
      render(false);
    }
  }

  function move(direction) {
    if (animating || dragging) return;

    animating = true;
    index += direction;
    render();

    if (reducedMotion.matches) {
      normalize();
      animating = false;
    }
  }

  track.addEventListener("transitionend", e => {
    if (e.target !== track ||
        e.propertyName !== "transform") return;

    normalize();
    animating = false;
  });

  function stopAuto() {
    clearInterval(timer);
    timer = null;
  }

  function canAutoPlay() {
    return !reducedMotion.matches &&
      !document.hidden &&
      !carousel.matches(":hover") &&
      !carousel.contains(document.activeElement) &&
      !dragging;
  }

  function startAuto() {
    stopAuto();

    if (!canAutoPlay()) return;

    timer = setInterval(() => {
      if (!animating) move(1);
    }, 4500);
  }

  prev.addEventListener("click", () => {
    move(-1);
    startAuto();
  });

  next.addEventListener("click", () => {
    move(1);
    startAuto();
  });

  // Navegação pelo teclado
  viewport.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
  });

  // Arraste com mouse ou toque
  viewport.addEventListener("pointerdown", e => {
    if (e.button !== 0 || animating) return;

    dragging = true;
    moved = false;
    dragX = 0;
    startX = e.clientX;

    stopAuto();
    viewport.classList.add("dragging");
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener("pointermove", e => {
    if (!dragging) return;

    dragX = e.clientX - startX;

    if (Math.abs(dragX) > 8) moved = true;

    track.style.transition = "none";
    track.style.transform =
      `translate3d(${-index * stepSize() + dragX}px,0,0)`;
  });

  function finishDrag() {
    if (!dragging) return;

    dragging = false;
    viewport.classList.remove("dragging");

    suppressClick = moved;

    if (Math.abs(dragX) > 45) {
      index += dragX < 0 ? 1 : -1;
      animating = !reducedMotion.matches;
    }

    render();

    if (reducedMotion.matches) {
      normalize();
      animating = false;
    }

    dragX = 0;
    startAuto();
  }

  viewport.addEventListener("pointerup", finishDrag);
  viewport.addEventListener("pointercancel", finishDrag);
  viewport.addEventListener("lostpointercapture", finishDrag);

  viewport.addEventListener("click", e => {
    if (suppressClick) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    }
  }, true);

  // Pausa automática
  carousel.addEventListener("mouseenter", stopAuto);
  carousel.addEventListener("mouseleave", startAuto);
  carousel.addEventListener("focusin", stopAuto);
  carousel.addEventListener("focusout", () => {
    setTimeout(startAuto, 0);
  });

  document.addEventListener("visibilitychange", startAuto);

  // Recalcula posições ao mudar a largura
  window.addEventListener("resize", () => {
    animating = false;
    normalize();
    render(false);
  });

  render(false);
  startAuto();
});


/* =========================================
   MODAL DE BENEFÍCIOS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("benefitsModal");

    const openButton = document.getElementById(
        "openBenefitsModal"
    );

    const closeButton = document.getElementById(
        "closeBenefitsModal"
    );

    if (!modal || !openButton || !closeButton) return;

    let isClosing = false;

    // Animação sequencial dos cards
    modal.querySelectorAll(".bm-card").forEach((card, index) => {
        card.style.setProperty(
            "--bm-delay",
            `${index * 35}ms`
        );
    });

    // Abrir modal
    function openModal() {

        if (modal.open) return;

        modal.classList.remove("bm-closing");

        modal.showModal();

        document.body.classList.add("bm-scroll-lock");

        modal.scrollTop = 0;

        if (window.lucide) {
            lucide.createIcons();
        }

    }

    // Fechar modal
    function closeModal() {

        if (!modal.open || isClosing) return;

        isClosing = true;

        modal.classList.add("bm-closing");

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        setTimeout(() => {

            modal.close();

            modal.classList.remove("bm-closing");

            isClosing = false;

        }, reducedMotion ? 0 : 220);

    }

    // Eventos dos botões
    openButton.addEventListener("click", openModal);

    closeButton.addEventListener("click", closeModal);

    // Fechar ao clicar fora
    modal.addEventListener("click", (event) => {

        if (event.target !== modal) return;

        const rect = modal.getBoundingClientRect();

        const outside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;

        if (outside) {
            closeModal();
        }

    });

    // Fechar pressionando ESC
    modal.addEventListener("cancel", (event) => {

        event.preventDefault();

        closeModal();

    });

    // Restaurar a página após fechar
    modal.addEventListener("close", () => {

        document.body.classList.remove("bm-scroll-lock");

        openButton.focus();

    });

});

document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("site-particles");

    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const quantity = window.innerWidth < 768 ? 12 : 30;

    for (let i = 0; i < quantity; i++) {

        const particle = document.createElement("span");

        particle.classList.add("site-particle");

        const size = Math.random() * 3 + 1;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left = `${Math.random() * 100}%`;

        particle.style.animationDuration =
            `${Math.random() * 15 + 10}s`;

        particle.style.animationDelay =
            `${-Math.random() * 25}s`;

        container.appendChild(particle);
    }

});

document.addEventListener("DOMContentLoaded", () => {

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)) return;

    const elements = document.querySelectorAll(`
        .benefits-intro,
        .benefit-card,
        .portfolio-intro,
        .portfolio-carousel,
        .process-intro,
        .process-step,
        .conversion-info,
        .conversion-cta,
        .footer-container
    `);

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }

        });

    }, {
        threshold: 0.1
    });

    elements.forEach((element, index) => {

        element.classList.add("scroll-reveal");

        element.style.setProperty(
            "--reveal-delay",
            `${(index % 4) * 70}ms`
        );

        observer.observe(element);

    });

});

document.addEventListener("DOMContentLoaded", () => {

    if (!window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    ).matches) return;

    document.querySelectorAll(".portfolio-card").forEach(card => {

        card.addEventListener("pointermove", event => {

            if (event.buttons !== 0) return;

            const rect = card.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            card.style.setProperty("--tilt-x", `${(0.5 - y) * 12}deg`);
            card.style.setProperty("--tilt-y", `${(x - 0.5) * 12}deg`);

        });

        function resetTilt() {
            card.style.setProperty("--tilt-x", "0deg");
            card.style.setProperty("--tilt-y", "0deg");
        }

        card.addEventListener("pointerleave", resetTilt);
        card.addEventListener("pointerdown", resetTilt);
        card.addEventListener("pointercancel", resetTilt);

    });

});

document.addEventListener("DOMContentLoaded", () => {

    const glow = document.getElementById("cursor-glow");

    if (!glow) return;

    if (!window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    ).matches) return;

    let mouseX = 0;
    let mouseY = 0;

    let currentX = 0;
    let currentY = 0;

    let initialized = false;

    document.addEventListener("pointermove", event => {

        mouseX = event.clientX;
        mouseY = event.clientY;

        if (!initialized) {
            currentX = mouseX;
            currentY = mouseY;
            initialized = true;
        }

        glow.style.opacity = "1";

    });

    document.addEventListener("pointerleave", () => {
        glow.style.opacity = "0";
    });

    function animateGlow() {

        currentX += (mouseX - currentX) * .12;
        currentY += (mouseY - currentY) * .12;

        glow.style.transform = `
            translate3d(${currentX}px, ${currentY}px, 0)
            translate(-50%, -50%)
        `;

        requestAnimationFrame(animateGlow);

    }

    animateGlow();

});

document.addEventListener("DOMContentLoaded", () => {

    const progress = document.getElementById("scroll-progress");

    if (!progress) return;

    function updateProgress() {

        const scrollTop = window.scrollY;

        const totalHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const percentage = totalHeight > 0
            ? Math.min(1, Math.max(0, scrollTop / totalHeight))
            : 0;

        progress.style.transform = `scaleX(${percentage})`;

    }

    window.addEventListener("scroll", updateProgress, {
        passive: true
    });

    window.addEventListener("resize", updateProgress);

    updateProgress();

});

document.addEventListener("DOMContentLoaded", () => {

    const closeButton = document.getElementById(
        "closeContactMessage"
    );

    const message = document.querySelector(
        ".floating-contact-message"
    );

    if (!closeButton || !message) return;

    closeButton.addEventListener("click", () => {
        message.hidden = true;
    });

});

document.addEventListener("DOMContentLoaded", () => {

    if (!window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    ).matches) return;

    const buttons = document.querySelectorAll(`
        .hero-button,
        .header-button,
        .benefits-button,
        .portfolio-more,
        .conversion-whatsapp,
        .bm-whatsapp
    `);

    buttons.forEach(button => {

        button.classList.add("magnetic-button");

        button.addEventListener("pointermove", event => {

            const rect = button.getBoundingClientRect();

            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;

            const moveX = Math.max(-8, Math.min(8, x * .12));
            const moveY = Math.max(-6, Math.min(6, y * .18));

            button.style.setProperty(
                "--magnetic-x",
                `${moveX}px`
            );

            button.style.setProperty(
                "--magnetic-y",
                `${moveY}px`
            );

        });

        button.addEventListener("pointerleave", () => {

            button.style.setProperty("--magnetic-x", "0px");
            button.style.setProperty("--magnetic-y", "0px");

        });

    });

});

/* CURSOR PERSONALIZADO */

document.addEventListener("DOMContentLoaded", () => {

    const dot = document.querySelector(".custom-cursor-dot");
    const ring = document.querySelector(".custom-cursor-ring");

    if (!dot || !ring) return;

    if (!window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    ).matches) return;

    let mouseX = 0;
    let mouseY = 0;

    let ringX = 0;
    let ringY = 0;

    let active = false;
    let animationFrame = null;

    const clickableElements = `
        a,
        button,
        [role="button"],
        .portfolio-card,
        .benefit-card
    `;

    function animateCursor() {

        ringX += (mouseX - ringX) * .18;
        ringY += (mouseY - ringY) * .18;

        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;

        if (active) {
            animationFrame = requestAnimationFrame(animateCursor);
        }

    }

    function hideCursor() {

        active = false;

        cancelAnimationFrame(animationFrame);

        dot.classList.remove("is-active");

        ring.classList.remove(
            "is-active",
            "is-hovering",
            "is-clicking"
        );

        document.documentElement.classList.remove(
            "custom-cursor-enabled"
        );

    }

    document.addEventListener("pointermove", event => {

        if (event.pointerType !== "mouse") {
            hideCursor();
            return;
        }

        // Preservar o cursor nativo em formulários e modais

        if (
            event.target.closest(
                "input, textarea, select, [contenteditable], dialog"
            ) ||
            document.querySelector("dialog[open]")
        ) {
            hideCursor();
            return;
        }

        mouseX = event.clientX;
        mouseY = event.clientY;

        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;

        dot.classList.add("is-active");
        ring.classList.add("is-active");

        document.documentElement.classList.add(
            "custom-cursor-enabled"
        );

        if (!active) {

            ringX = mouseX;
            ringY = mouseY;

            active = true;

            animateCursor();

        }

        ring.classList.toggle(
            "is-hovering",
            Boolean(event.target.closest(clickableElements))
        );

    });

    document.addEventListener("pointerdown", () => {

        if (active) {
            ring.classList.add("is-clicking");
        }

    });

    document.addEventListener("pointerup", () => {

        ring.classList.remove("is-clicking");

    });

    document.addEventListener("pointercancel", hideCursor);

    document.documentElement.addEventListener(
        "pointerleave",
        hideCursor
    );

    window.addEventListener("blur", hideCursor);

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            hideCursor();
        }

    });

});