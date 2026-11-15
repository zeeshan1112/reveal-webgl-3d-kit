# 3D Models Directory (`.glb` / `.gltf`)

Drop any `.glb` or `.gltf` 3D assets (for example, downloaded from [itch.io 3D Game Assets](https://itch.io/game-assets/tag-3d)) into this folder and pass `optionalGltfModel` to `initThreeStage()` in `index.html`:

```js
initThreeStage({
  optionalGltfModel: {
    url: "./assets/models/your-model.glb",
    scale: 1.2,
    position: [2.2, 0, 0],
  },
});
```
