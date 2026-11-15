/**
 * Interactive WebGL 8x8 Bayer Dithering Background Shader
 * Based on Codrops Bayer Dithering + WebGL Shaders noise patterns.
 */
export function initBayerDitherBackground(canvasId = "webgl-bg", options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return null;

  const colors = {
    deep: options.deepColor || [0.015, 0.06, 0.06],
    mid: options.midColor || [0.038, 0.135, 0.135],
    accent: options.accentColor || [0.83, 0.68, 0.22],
  };

  const vertexSrc = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSrc = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_mood;
    uniform float u_clickRipple;
    uniform vec3 u_colDeep;
    uniform vec3 u_colMid;
    uniform vec3 u_colAccent;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }

    float bayer4x4(vec2 pos) {
      int x = int(mod(pos.x, 4.0));
      int y = int(mod(pos.y, 4.0));
      int index = y * 4 + x;
      if (index == 0) return 0.0 / 16.0;
      if (index == 1) return 8.0 / 16.0;
      if (index == 2) return 2.0 / 16.0;
      if (index == 3) return 10.0 / 16.0;
      if (index == 4) return 12.0 / 16.0;
      if (index == 5) return 4.0 / 16.0;
      if (index == 6) return 14.0 / 16.0;
      if (index == 7) return 6.0 / 16.0;
      if (index == 8) return 3.0 / 16.0;
      if (index == 9) return 11.0 / 16.0;
      if (index == 10) return 1.0 / 16.0;
      if (index == 11) return 9.0 / 16.0;
      if (index == 12) return 15.0 / 16.0;
      if (index == 13) return 7.0 / 16.0;
      if (index == 14) return 13.0 / 16.0;
      return 5.0 / 16.0;
    }

    float bayer8x8(vec2 pos) {
      float coarse = bayer4x4(floor(pos * 0.5));
      float fine = bayer4x4(pos);
      return (coarse + fine * 0.25) / 1.25;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 aspectUv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 mouseUv = (u_mouse - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

      float t = u_time * 0.14;
      float n1 = fbm(aspectUv * 2.1 + vec2(t, -t * 0.6) + u_mood * 0.35);
      float n2 = fbm(aspectUv * 3.8 - vec2(t * 0.8, t * 0.5) + n1 * 0.6);

      float dist = length(aspectUv - mouseUv);
      float mouseGlow = exp(-dist * 3.2) * 0.38;
      float ripple = sin(dist * 24.0 - u_time * 6.0) * exp(-dist * 4.5) * u_clickRipple * 0.25;

      float field = clamp(n2 * 0.85 + mouseGlow + ripple - 0.12, 0.0, 1.0);

      vec2 ditherCoord = floor(gl_FragCoord.xy / 3.0);
      float threshold = bayer8x8(ditherCoord);

      float dithered = step(threshold, field);
      float softLayer = smoothstep(threshold - 0.15, threshold + 0.15, field * 0.78);

      vec3 base = mix(u_colDeep, u_colMid, softLayer * 0.8);
      vec3 finalCol = mix(base, u_colMid + u_colAccent * 0.22, dithered * 0.32);

      float vig = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.85;
      gl_FragColor = vec4(finalCol * vig, 1.0);
    }
  `;

  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "u_resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uMouse = gl.getUniformLocation(program, "u_mouse");
  const uMood = gl.getUniformLocation(program, "u_mood");
  const uRipple = gl.getUniformLocation(program, "u_clickRipple");
  const uColDeep = gl.getUniformLocation(program, "u_colDeep");
  const uColMid = gl.getUniformLocation(program, "u_colMid");
  const uColAccent = gl.getUniformLocation(program, "u_colAccent");

  const state = { mood: 0, ripple: 0 };
  let mouseX = window.innerWidth * 0.65;
  let mouseY = window.innerHeight * 0.5;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    mouseX = e.clientX * dpr;
    mouseY = (window.innerHeight - e.clientY) * dpr;
  });

  window.addEventListener("click", () => {
    if (window.gsap) {
      window.gsap.fromTo(
        state,
        { ripple: 1.0 },
        { ripple: 0.0, duration: 1.1, ease: "power2.out" }
      );
    }
  });

  resize();
  const start = performance.now();
  function loop(now) {
    const t = (now - start) * 0.001;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.uniform1f(uMood, state.mood);
    gl.uniform1f(uRipple, state.ripple);
    gl.uniform3fv(uColDeep, colors.deep);
    gl.uniform3fv(uColMid, colors.mid);
    gl.uniform3fv(uColAccent, colors.accent);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return state;
}
