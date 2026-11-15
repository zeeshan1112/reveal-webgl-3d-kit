# Reveal + WebGL Bayer Dither + Three.js 3D + GSAP Presentation Kit

A zero-build, single-repo starter kit consolidating the interactive HTML presentation stack into modular ES files ready for local viewing or one-click GitHub Pages publishing.

## Consolidated Stack
- **Slides & Export**: [Reveal.js 5](https://revealjs.com/) (keyboard navigation, overview mode `Esc`, PDF export via `?print-pdf`).
- **Motion Choreography**: [GSAP 3](https://gsap.com/) synced to `slidechanged` events for staggered text reveals, numeric count-ups, and 3D pose tweening.
- **Interactive GPU Background**: Custom GLSL $8\times8$ **Bayer Dithering** + FBM noise shader with cursor spotlight and click ripples (`src/shaders/bayer-dither.js`).
- **3D Stage**: **Three.js** (`src/three/stage.js`) with beveled metallic 3D cards mapped to real card artwork (`assets/cards/`) plus `GLTFLoader` support for `.glb`/`.gltf` assets (`assets/models/`).

## Quick Start (Local)
```bash
python3 -m http.server 3099
```
Open [http://localhost:3099](http://localhost:3099).

## Folder Structure
- `index.html` — Slide deck & scene configuration
- `src/styles/deck.css` — Theme variables (`--bg-deep`, `--gold`, `--card-bg`) & slide layout classes
- `src/shaders/bayer-dither.js` — WebGL Bayer ordered dithering shader
- `src/three/stage.js` — Three.js 3D textured cards, orbiting gems, & GLTF model loader
- `src/motion/gsap-sync.js` — Reveal.js ↔ GSAP ↔ Three.js synchronization
- `assets/cards/` — Card artwork mapped onto 3D cards
- `assets/models/` — Optional `.glb` / `.gltf` 3D models
- `.github/workflows/pages.yml` — Auto-deploy to GitHub Pages on push to `main`
