
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
