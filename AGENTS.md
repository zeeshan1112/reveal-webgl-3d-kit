# AGENTS.md — AI Agent Guide for This Creative Stack

This repository is a **unified, zero-build creative web + video + presentation engine** modeled on the cinematic Bayer-dithered WebGL + GSAP + Three.js 3D + Reveal.js aesthetic (as seen in `tripvan-proposal`).

Give this repository to any AI agent and ask it to build **a website, a HyperFrames promo video, or an interactive deck** using the shared primitives in `src/`.

---

## Architecture Overview (4 Layers)

| Layer | Module | Purpose |
| :--- | :--- | :--- |
| **0 · GPU Backdrop** | [`src/shaders/bayer-dither.js`](src/shaders/bayer-dither.js) | Full-screen WebGL $8\times8$ Bayer ordered dithering + FBM noise shader. Exposes `pan`, `lift`, `warm`, `bright`, and `ripple` uniforms, plus deterministic `renderAt(timeSec)` for video rendering. |
| **1 · 3D Stage** | [`src/three/stage.js`](src/three/stage.js) | Three.js scene supporting beveled metallic 3D cards mapped with real PNG/WebP artwork, orbiting 3D geometry, cursor parallax, and `GLTFLoader` for `.glb`/`.gltf` assets (e.g. from `itch.io/game-assets/tag-3d`). |
| **2 · Cinematic Intro** | [`src/motion/cinematic-intro.js`](src/motion/cinematic-intro.js) + [`src/styles/cinematic.css`](src/styles/cinematic.css) | Letterbox curtain bars, blurred beat cards, split-character title explosion, flash + camera shake, and horizontal rule sweep. Returns a GSAP timeline. |
| **3 · Output Mode** | `index.html`, `examples/website/`, `examples/hyperframes-video/` | Choose **Reveal.js Deck**, **ScrollTrigger Website**, or **HyperFrames Video**. |

---

## Design Tokens (`src/styles/deck.css`)

- **Palette**: Deep Ink `#081313`, Teal Raise `#0b2828`, Warm Gold `#ffcc78` / `#d4af37`, Bone `#e6f2f0`.
- **Typography**: `Inter` / `Space Grotesk` (display), `Fraunces` italic serif (editorial emphasis), `JetBrains Mono` / `Space Mono` (eyebrows, counters, tags).
- **Legibility**: Always pair text over the live shader with `.glass-card` (`backdrop-filter: blur(16px)`) or directional gradient scrims.

---

## How an Agent Should Build Each Target

### 1. Website Development (`examples/website/index.html`)
- Import `initBayerDitherBackground` (default `autoLoop: true`), `initThreeStage`, and `buildCinematicIntroTimeline`.
- Use **GSAP `ScrollTrigger`** to tween `shaderState.pan`, `shaderState.warm`, and call `threeStage.setSlide(sectionIndex)` as sections enter the viewport.

### 2. HyperFrames Video Creation (`examples/hyperframes-video/index.html`)
- Set fixed composition dimensions (`1920x1080` or `1080x1920`).
- Initialize the Bayer shader with `{ autoLoop: false }` so frames are **100% deterministic**.
- Put all scenes (including `buildCinematicIntroTimeline()`) onto a **single paused master GSAP timeline**: `const master = gsap.timeline({ paused: true })`.
- Scrub both `master.seek(t, false)` and `shaderState.renderAt(t)` inside the HyperFrames seek function.
- Structure scenes with `class="clip"`, `data-start`, and `data-duration`.

### 3. Interactive Proposal / Deck (`index.html`)
- Use `initRevealGsapSync({ shaderState, threeStage })` to bind Reveal.js `slidechanged` events to `.gsap-item` staggers, `[data-count]` numeric roll-ups, shader `pan`/`warm` shifts, and 3D card poses.
- Include `#cinematic-intro` for the opening curtain sequence (`Skip Intro →` button + `I` key to replay).
