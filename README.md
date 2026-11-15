# Creative Web + HyperFrames Video + 3D Deck Stack

A **unified, AI-agent-ready creative stack** combining **WebGL $8\times8$ Bayer Dithering**, **Three.js 3D**, **GSAP**, and **Reveal.js** — designed so you can point any AI coding agent at this repo (see [`AGENTS.md`](AGENTS.md)) and build:

1. **Websites** ([`examples/website/index.html`](examples/website/index.html)) — Scroll-driven landing pages (`GSAP ScrollTrigger` + live Bayer shader `pan`/`warm` + 3D stage).
2. **HyperFrames Videos** ([`examples/hyperframes-video/index.html`](examples/hyperframes-video/index.html)) — Deterministic, seek-safe GSAP master timeline + `data-start`/`data-duration` clips ready for MP4 rendering.
3. **Interactive Proposals & Decks** ([`index.html`](index.html)) — Reveal.js 5 + cinematic letterbox intro (`I` to replay) + 3D textured cards.

## Core Modules (`src/`)
- `src/shaders/bayer-dither.js` — GPU $8\times8$ Bayer dithering + FBM noise with `pan`, `lift`, `warm`, `bright`, `ripple`, and `renderAt(t)` for deterministic video frames.
- `src/three/stage.js` — Beveled metallic 3D cards (`assets/cards/`), orbiting 3D geometry, and `GLTFLoader` for `.glb`/`.gltf` models (`assets/models/`).
- `src/motion/cinematic-intro.js` — Reusable letterbox curtain + blurred beat cards + split-letter title reveal + flash/shake intro.
- `src/motion/gsap-sync.js` — Reveal.js ↔ GSAP ↔ Three.js ↔ Shader synchronization.

## Quick Start (Local)
```bash
python3 -m http.server 3098
```
- Deck: [http://localhost:3098](http://localhost:3098)
- Website template: [http://localhost:3098/examples/website/](http://localhost:3098/examples/website/)
- HyperFrames video template: [http://localhost:3098/examples/hyperframes-video/](http://localhost:3098/examples/hyperframes-video/)
