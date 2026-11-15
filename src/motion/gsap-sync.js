/**
 * Synchronizes Reveal.js slide transitions with GSAP animations,
 * WebGL shader mood uniforms, and the Three.js 3D card stage.
 */
export function initRevealGsapSync({ shaderState, threeStage, counterId = "slide-counter" }) {
  const deck = new window.Reveal({
    hash: true,
    controls: true,
    progress: true,
    center: true,
    transition: "fade",
    transitionSpeed: "fast",
    width: 1200,
    height: 700,
    margin: 0.06,
  });

  function animateSlide(slideEl, index) {
    if (!slideEl || !window.gsap) return;

    const items = slideEl.querySelectorAll(".gsap-item");
    window.gsap.killTweensOf(items);
    window.gsap.fromTo(
      items,
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
      }
    );

    const counters = slideEl.querySelectorAll("[data-count]");
    counters.forEach((el) => {
      const target = parseInt(el.getAttribute("data-count"), 10);
      const obj = { val: 0 };
      window.gsap.to(obj, {
        val: target,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(obj.val);
        },
      });
    });

    if (shaderState) {
      window.gsap.to(shaderState, {
        pan: index * 1.15,
        warm: index % 2 === 0 ? 0.25 : 0.55,
        duration: 2.0,
        ease: "power2.inOut",
      });
    }

    if (threeStage && threeStage.setSlide) {
      threeStage.setSlide(index, false);
    }

    const total = deck.getTotalSlides();
    const counterEl = document.getElementById(counterId);
    if (counterEl) {
      const cur = String(index + 1).padStart(2, "0");
      const tot = String(total).padStart(2, "0");
      counterEl.textContent = `${cur} / ${tot}`;
    }
  }

  deck.initialize().then(() => {
    animateSlide(deck.getCurrentSlide(), deck.getIndices().h || 0);
  });

  deck.on("slidechanged", (event) => {
    animateSlide(event.currentSlide, event.indexh || 0);
  });

  return deck;
}
