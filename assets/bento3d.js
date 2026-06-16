/* bento3d.js — Three.js graphics for the "risk" bento cards.
   Two WebGL graphics live INSIDE their cards (so they tilt with the card and
   are clipped by its rounded corners): a 3D dotted particle globe with
   money-movement arcs, and a dispersing particle burst. Both run on the same
   soft depth-faded point shader. Because the cards sit on a WHITE surface we
   use NORMAL blending (additive would wash to white) with brand/cyan tinted
   soft points — the look Stripe uses for its particle cards.

   Each card gets its own tiny renderer/canvas (only two contexts — well within
   limits) which keeps stacking + the card's CSS tilt transform trivially
   correct. Fails soft: if WebGL or the module is unavailable the cards still
   show their CSS background + DOM overlays. ES module. */
import * as THREE from "./three.module.min.js";

const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* brand palette (matches CSS --brand / --brand-300 / --cyan / --brand-700) */
const COL = {
  brand: new THREE.Color(0x533afd),
  brand300: new THREE.Color(0x9a9afe),
  cyan: new THREE.Color(0x5b9bff),
  deep: new THREE.Color(0x3322b8),
};

/* shared pointer (normalized -1..1), drives a subtle scene parallax */
let pX = 0, pY = 0, tpX = 0, tpY = 0;
window.addEventListener("pointermove", function (e) {
  tpX = (e.clientX / window.innerWidth - 0.5) * 2;
  tpY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

/* ---- soft round depth-faded point shader (normal blending, white bg) ---- */
/* worldSize is a point radius in world units; uPixel (drawing-buffer height /
   2·tan(fov/2)) converts it to a perspective-correct pixel size each frame.
   premultipliedAlpha context -> fragment outputs premultiplied rgb. */
function pointMaterial(worldSize, opacity) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uSize: { value: worldSize },
      uScale: { value: 1 },
      uTime: { value: 0 },
      uOpacity: { value: opacity == null ? 1 : opacity },
      uPixel: { value: 600 },
    },
    vertexShader: `
      attribute vec3 color;
      attribute float aPhase;
      varying vec3 vColor;
      varying float vFade;
      uniform float uSize;
      uniform float uScale;
      uniform float uTime;
      uniform float uPixel;
      void main(){
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float depth = clamp((mv.z + 4.0) / 2.4, 0.0, 1.0);   // front brighter
        float tw = 0.7 + 0.3 * sin(uTime * 1.6 + aPhase);     // gentle twinkle
        vFade = (0.2 + 0.8 * depth) * tw;
        gl_PointSize = uSize * uScale * uPixel * (0.7 + 0.5 * depth) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vFade;
      uniform float uOpacity;
      void main(){
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.06, d);
        float a = soft * vFade * uOpacity;
        gl_FragColor = vec4(vColor * a, a);   // premultiplied
      }
    `,
  });
}

/* fibonacci sphere -> evenly spread surface points */
function spherePoints(n, r) {
  const pos = new Float32Array(n * 3);
  const gold = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = gold * i;
    pos[i * 3] = Math.cos(th) * rad * r;
    pos[i * 3 + 1] = y * r;
    pos[i * 3 + 2] = Math.sin(th) * rad * r;
  }
  return pos;
}

function colorAttr(n, mix) {
  const c = new Float32Array(n * 3), t = new THREE.Color();
  for (let i = 0; i < n; i++) {
    t.copy(mix(i, n));
    c[i * 3] = t.r; c[i * 3 + 1] = t.g; c[i * 3 + 2] = t.b;
  }
  return c;
}
function phaseAttr(n) {
  const p = new Float32Array(n);
  for (let i = 0; i < n; i++) p[i] = Math.random() * Math.PI * 2;
  return p;
}

/* ---------------- GLOBE scene ---------------- */
function buildGlobe() {
  const group = new THREE.Group();
  const R = 1.0;

  // dotted sphere
  const N = 2200;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(spherePoints(N, R), 3));
  g.setAttribute("color", new THREE.BufferAttribute(colorAttr(N, function (i, n) {
    const k = i / n;
    return k < 0.18 ? COL.cyan : (k < 0.4 ? COL.brand300 : COL.brand);
  }), 3));
  g.setAttribute("aPhase", new THREE.BufferAttribute(phaseAttr(N), 1));
  const dotMat = pointMaterial(0.011, 1.0);
  const dots = new THREE.Points(g, dotMat);
  group.add(dots);

  // money-movement arcs (great-circle bulges) + traveling dots
  const arcCurves = [];
  const ARCS = 7;
  const arcGroup = new THREE.Group();
  for (let i = 0; i < ARCS; i++) {
    const a = randSurf(R), b = randSurf(R);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.35 + Math.random() * 0.25));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    arcCurves.push(curve);
    const pts = curve.getPoints(46);
    const lg = new THREE.BufferGeometry().setFromPoints(pts);
    const lm = new THREE.LineBasicMaterial({ color: COL.cyan, transparent: true, opacity: 0.32, depthWrite: false, depthTest: false });
    arcGroup.add(new THREE.Line(lg, lm));
  }
  group.add(arcGroup);

  // traveling pulse dots along the arcs
  const TN = ARCS;
  const tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TN * 3), 3));
  tg.setAttribute("color", new THREE.BufferAttribute(colorAttr(TN, function () { return COL.cyan; }), 3));
  tg.setAttribute("aPhase", new THREE.BufferAttribute(phaseAttr(TN), 1));
  const travMat = pointMaterial(0.05, 1.0);
  const travel = new THREE.Points(tg, travMat);
  const travProg = [];
  for (let i = 0; i < TN; i++) travProg.push(Math.random());
  group.add(travel);

  group.rotation.x = 0.34;

  return {
    object: group,
    materials: [dotMat, travMat],
    update: function (t, dt) {
      group.rotation.y += dt * 0.12;
      const arr = tg.attributes.position.array;
      for (let i = 0; i < TN; i++) {
        travProg[i] = (travProg[i] + dt * 0.12) % 1;
        const p = arcCurves[i].getPoint(travProg[i]);
        arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z;
      }
      tg.attributes.position.needsUpdate = true;
      dotMat.uniforms.uTime.value = t;
      travMat.uniforms.uTime.value = t;
      // cursor parallax tilt
      group.rotation.z = pX * 0.12;
      group.rotation.x = 0.34 - pY * 0.16;
    },
    cameraZ: 3.0,
  };
}
function randSurf(r) {
  const u = Math.random(), v = Math.random();
  const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
  return new THREE.Vector3(
    Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)
  ).multiplyScalar(r);
}

/* ---------------- BURST scene ---------------- */
function buildBurst() {
  const group = new THREE.Group();
  const N = 2000;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    // hollow-ish cloud: bias toward a ring/shell so the centre stays open
    const dir = randSurf(1);
    const rr = 0.55 + Math.pow(Math.random(), 0.6) * 1.15;
    pos[i * 3] = dir.x * rr * 1.25;
    pos[i * 3 + 1] = dir.y * rr * 1.05;
    pos[i * 3 + 2] = dir.z * rr * 0.7;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(colorAttr(N, function (i, n) {
    const k = Math.random();
    return k < 0.3 ? COL.cyan : (k < 0.7 ? COL.brand300 : COL.brand);
  }), 3));
  g.setAttribute("aPhase", new THREE.BufferAttribute(phaseAttr(N), 1));
  const mat = pointMaterial(0.018, 1.0);
  const pts = new THREE.Points(g, mat);
  group.add(pts);
  group.rotation.x = 0.2;
  return {
    object: group,
    materials: [mat],
    update: function (t, dt) {
      group.rotation.y += dt * 0.16;
      group.rotation.z = Math.sin(t * 0.2) * 0.06 + pX * 0.1;
      group.rotation.x = 0.2 - pY * 0.12;
      mat.uniforms.uScale.value = 1 + Math.sin(t * 0.6) * 0.04;
      mat.uniforms.uTime.value = t;
    },
    cameraZ: 3.2,
  };
}

/* ---------------- PROOF GEO scene (minimal dotted icosahedron) ---------------- */
/* A slowly-rotating geometric solid: soft points on a subdivided icosahedron
   with a faint wireframe. Same clean look as the bento cards, sits behind the
   testimonial copy. */
function buildProofGeo() {
  const group = new THREE.Group();
  const R = 1.18;

  // soft points sampled on the icosahedron's subdivided vertices
  const ico = new THREE.IcosahedronGeometry(R, 3);
  const N = ico.attributes.position.count;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(ico.attributes.position.array.slice(), 3));
  g.setAttribute("color", new THREE.BufferAttribute(colorAttr(N, function (i, n) {
    const k = i / n;
    return k < 0.22 ? COL.cyan : (k < 0.55 ? COL.brand300 : COL.brand);
  }), 3));
  g.setAttribute("aPhase", new THREE.BufferAttribute(phaseAttr(N), 1));
  const dotMat = pointMaterial(0.016, 0.62);
  const dots = new THREE.Points(g, dotMat);
  group.add(dots);
  ico.dispose();

  // faint low-poly wireframe shell
  const wireSrc = new THREE.IcosahedronGeometry(R, 1);
  const wire = new THREE.WireframeGeometry(wireSrc);
  const lm = new THREE.LineBasicMaterial({ color: COL.brand300, transparent: true, opacity: 0.1, depthWrite: false, depthTest: false });
  group.add(new THREE.LineSegments(wire, lm));
  wireSrc.dispose();

  group.rotation.x = 0.32;
  group.position.set(0.15, 0.25, 0); // nudge up/right, out of the copy's way

  return {
    object: group,
    materials: [dotMat],
    update: function (t, dt) {
      group.rotation.y += dt * 0.16;
      group.rotation.x = 0.32 - pY * 0.14;
      group.rotation.z = pX * 0.09;
      dotMat.uniforms.uTime.value = t;
    },
    cameraZ: 3.5,
  };
}

/* ---------------- per-card instance ---------------- */
function makeInstance(canvas, builder) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: false, premultipliedAlpha: true,
      preserveDrawingBuffer: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false,
    });
  } catch (e) { return null; }
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const built = builder();
  scene.add(built.object);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = built.cameraZ;

  let w = 0, h = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    const nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  return {
    el: canvas,
    resize: resize,
    render: function (t, dt) {
      resize();
      const bh = renderer.domElement.height;
      const px = bh / (2 * Math.tan((camera.fov * Math.PI / 180) / 2));
      built.materials.forEach(function (m) { if (m.uniforms && m.uniforms.uPixel) m.uniforms.uPixel.value = px; });
      built.update(t, dt);
      renderer.render(scene, camera);
    },
    dispose: function () { renderer.dispose(); },
  };
}

/* ---------------- boot ---------------- */
function boot() {
  const specs = [
    { sel: 'canvas[data-gfx="globe"]', build: buildGlobe },
    { sel: 'canvas[data-gfx="burst"]', build: buildBurst },
    { sel: 'canvas[data-gfx="proofgeo"]', build: buildProofGeo },
  ];
  const instances = [];
  specs.forEach(function (s) {
    document.querySelectorAll(s.sel).forEach(function (cv) {
      const inst = makeInstance(cv, s.build);
      if (inst) instances.push(inst);
    });
  });
  if (!instances.length) return;

  // only animate while a card-bearing section (risk / proof / pricing / platform) is on screen
  let visible = true;
  const watched = [
    document.getElementById("risk"),
    document.getElementById("proof"),
    document.getElementById("pricing"),
    document.getElementById("platform"),
  ].filter(Boolean);
  if (watched.length && "IntersectionObserver" in window) {
    const vis = new Map();
    const secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis.set(e.target, e.isIntersecting); });
      let any = false; vis.forEach(function (v) { if (v) any = true; });
      visible = any && !document.hidden;
    }, { threshold: 0 });
    watched.forEach(function (s) { secIO.observe(s); });
  }
  document.addEventListener("visibilitychange", function () { visible = !document.hidden; });

  let last = performance.now() / 1000;
  let running = true;
  function renderAll(now, dt) {
    pX += (tpX - pX) * 0.06; pY += (tpY - pY) * 0.06;
    for (let i = 0; i < instances.length; i++) instances[i].render(now, dt);
  }
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const now = performance.now() / 1000;
    let dt = now - last; last = now;
    if (dt > 0.05) dt = 0.05;
    if (!visible) return;
    if (reduce) dt = 0;
    renderAll(now, dt);
  }
  // capture/debug hook: headless screenshot tooling can stall on a live WebGL
  // loop, so allow pausing to a persisted frame (preserveDrawingBuffer keeps it).
  window.__bento3d = {
    pause: function () { running = false; },
    resume: function () { if (!running) { running = true; last = performance.now() / 1000; requestAnimationFrame(loop); } },
    renderOnce: function () { renderAll(performance.now() / 1000, 0); },
    count: instances.length,
  };
  window.addEventListener("resize", function () { instances.forEach(function (i) { i.resize(); }); }, { passive: true });
  requestAnimationFrame(loop);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
