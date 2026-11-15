/**
 * Reusable Cinematic Letterbox Intro (inspired by tripvan-proposal)
 * Works standalone for Websites & Reveal.js Decks, OR returns a GSAP timeline
 * that can be embedded into a paused HyperFrames master timeline.
 */
export function buildCinematicIntroTimeline({
  containerId = "cinematic-intro",
  shaderState = null,
  onComplete = null,
} = {}) {
  const gsap = window.gsap;
  const root = document.getElementById(containerId);
  if (!gsap || !root) return null;

  // Split characters for dramatic title reveal
  root.querySelectorAll(".in-ttl .w").forEach((w) => {
    if (!w.dataset.split) {
      w.dataset.split = "1";
      w.innerHTML = [...w.textContent]
        .map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`)
        .join("");
    }
  });

  gsap.set(root, { display: "flex", opacity: 1, x: 0 });
  gsap.set(root.querySelectorAll(".in-curtain"), { opacity: 1 });
  gsap.set(root.querySelectorAll(".in-bar"), { height: "12vh" });
  gsap.set(
    root.querySelectorAll(".in-cap, .in-beat, .in-ttl, .in-sub, .in-flash"),
    { opacity: 0, y: 0, scale: 1, filter: "blur(0px)" }
  );
  gsap.set(root.querySelectorAll(".in-rule"), { scaleX: 0, opacity: 1 });

  if (shaderState) {
    Object.assign(shaderState, { bright: 0.15, lift: -0.45, pan: -6, warm: 0.1 });
  }

  const IN = { opacity: 1, filter: "blur(0px)", scale: 1, duration: 1.05, ease: "power3.out" };
  const OUT = { opacity: 0, filter: "blur(14px)", y: -30, duration: 0.65, ease: "power2.in" };

  const tl = gsap.timeline({
    onComplete: () => {
      if (shaderState) Object.assign(shaderState, { bright: 1, lift: 0 });
      gsap.set(root, { display: "none" });
      if (onComplete) onComplete();
    },
  });

  // 1. Opening Caption + Shader Sunrise
  tl.fromTo(
    root.querySelector(".in-cap"),
    { opacity: 0, letterSpacing: "0.15em" },
    { opacity: 1, letterSpacing: "0.58em", duration: 1.5, ease: "power2.out" },
    0.2
  )
    .to(root.querySelector(".in-cap"), { opacity: 0, duration: 0.5 }, 1.6)
    .to(root.querySelector(".in-curtain"), { opacity: 0, duration: 2.2, ease: "power2.inOut" }, 1.2);

  if (shaderState) {
    tl.to(shaderState, { bright: 1, duration: 2.4, ease: "power2.out" }, 1.2)
      .to(shaderState, { lift: 0, duration: 3.5, ease: "power3.out" }, 1.2)
      .to(shaderState, { pan: 0, duration: 5.5, ease: "power2.out" }, 0.8);
  }

  // 2. Story Beats (Beat 1 & Beat 2)
  const beats = root.querySelectorAll(".in-beat");
  let t = 2.1;
  beats.forEach((beat) => {
    tl.fromTo(beat, { opacity: 0, filter: "blur(20px)", scale: 1.18 }, IN, t)
      .to(beat, OUT, t + 1.45);
    t += 1.95;
  });

  // 3. Title Explosion + Camera Shake + Rule Sweep
  const ttlTime = t + 0.25;
  tl.set(root.querySelector(".in-ttl"), { opacity: 1 }, ttlTime)
    .fromTo(
      root.querySelectorAll(".in-ttl .ch"),
      { opacity: 0, scale: 2.6, filter: "blur(14px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out", stagger: 0.04 },
      ttlTime
    )
    .set(root.querySelector(".in-flash"), { opacity: 0.65 }, ttlTime + 0.45)
    .to(root.querySelector(".in-flash"), { opacity: 0, duration: 0.9, ease: "power2.out" }, ttlTime + 0.45)
    .to(root, { x: 8, duration: 0.04, yoyo: true, repeat: 7, ease: "none" }, ttlTime + 0.45)
    .set(root, { x: 0 }, ttlTime + 0.85)
    .to(root.querySelector(".in-rule"), { scaleX: 1, duration: 0.9, ease: "expo.out" }, ttlTime + 0.6)
    .fromTo(
      root.querySelector(".in-sub"),
      { opacity: 0, letterSpacing: "0.1em" },
      { opacity: 1, letterSpacing: "0.45em", duration: 1.1, ease: "power2.out" },
      ttlTime + 0.7
    );

  if (shaderState) {
    tl.to(shaderState, { warm: 0.7, duration: 1.0 }, ttlTime + 0.45)
      .to(shaderState, { warm: 0.25, duration: 1.1 }, ttlTime + 2.3);
  }

  // 4. Exit Curtain Bars
  const exitTime = ttlTime + 2.2;
  tl.to(
    root.querySelectorAll(".in-ttl, .in-sub, .in-rule"),
    { opacity: 0, scale: 0.94, filter: "blur(8px)", duration: 0.7, ease: "power2.in" },
    exitTime
  ).to(root.querySelectorAll(".in-bar"), { height: 0, duration: 0.95, ease: "power3.inOut" }, exitTime + 0.15);

  return tl;
}
