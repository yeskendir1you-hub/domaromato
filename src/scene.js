/* Dom Aromatov — 3D flacon.
   Build: npx esbuild src/scene.js --bundle --minify --format=esm --outfile=js/scene.min.js
   Scroll / intro state is written by js/main.js into window.DA_STATE. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const S = (window.DA_STATE = window.DA_STATE || { pour: 0, intro: 0, shift: 0, lift: 0, opacity: 1, mx: 0, my: 0 });
if (S.giant == null) S.giant = 1;

const canvas = document.getElementById("scene");
const mobile = window.matchMedia("(max-width: 767px)").matches;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fail() {
  document.documentElement.classList.add("no-webgl");
  window.dispatchEvent(new Event("da:scene-ready"));
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
} catch (e) { fail(); }

if (renderer) start();

function start() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.3 : 1.75));
  renderer.setClearColor(0x070605, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.25, 7.4);

  /* lights: warm key, amber rim behind */
  const key = new THREE.DirectionalLight(0xfff0d8, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0xffa640, 30, 12, 2);
  rim.position.set(-1.5, 0.6, -2.5);
  scene.add(rim);
  const rim2 = new THREE.PointLight(0xffd9a0, 14, 10, 2);
  rim2.position.set(2.2, -1, -2);
  scene.add(rim2);

  /* ---------- the flacon ---------- */
  const root = new THREE.Group();
  const bottle = new THREE.Group();
  root.add(bottle);
  scene.add(root);

  const BW = 1.5, BH = 1.8, BD = 0.86;
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.03,
    transmission: 1, thickness: 0.7, ior: 1.5,
    clearcoat: 1, clearcoatRoughness: 0.04,
    attenuationColor: new THREE.Color(0xfff6ea), attenuationDistance: 6,
    specularIntensity: 1, envMapIntensity: 1.0
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(BW, BH, BD, 8, 0.24), glass);
  bottle.add(body);

  // thick glass base
  const base = new THREE.Mesh(new RoundedBoxGeometry(BW * 0.96, 0.16, BD * 0.94, 4, 0.06), glass);
  base.position.y = -BH / 2 + 0.1;
  bottle.add(base);

  // liquid (opaque so the glass transmission pass can see it)
  const LW = BW - 0.2, LH = BH - 0.3, LD = BD - 0.2, L0 = -BH / 2 + 0.17;
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0xc0741c, roughness: 0.12, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.1,
    emissive: 0x6a3205, emissiveIntensity: 0.35,
    sheen: 0.6, sheenColor: new THREE.Color(0xffd28a)
  });
  const liquid = new THREE.Mesh(new RoundedBoxGeometry(LW, 1, LD, 4, 0.1), liquidMat);
  bottle.add(liquid);
  // liquid surface — a bright lens that catches the light
  const surfMat = new THREE.MeshPhysicalMaterial({ color: 0xffc463, roughness: 0.05, emissive: 0xb86a10, emissiveIntensity: 0.5, clearcoat: 1 });
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.12, LD - 0.12, 24, 12), surfMat);
  surface.rotation.x = -Math.PI / 2;
  bottle.add(surface);
  const surfPos = surface.geometry.attributes.position;
  const surfBase = Float32Array.from(surfPos.array);

  // neck + collar
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.2, 40), glass);
  neck.position.y = BH / 2 + 0.08;
  bottle.add(neck);
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xe4b866, metalness: 1, roughness: 0.18, clearcoat: 0.6, envMapIntensity: 1.6 });
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.16, 48), gold);
  collar.position.y = BH / 2 + 0.24;
  bottle.add(collar);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 12, 64), gold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = BH / 2 + 0.32;
  bottle.add(ring);

  // faceted crown cap
  const cap = new THREE.Group();
  const capGold = gold.clone(); capGold.flatShading = true;
  const capBody = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 0.62, 8, 1), capGold);
  capBody.position.y = 0.31;
  cap.add(capBody);
  const capTop = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), capGold);
  capTop.scale.set(1, 0.7, 1);
  capTop.position.y = 0.74;
  cap.add(capTop);
  const capBaseY = BH / 2 + 0.33;
  cap.position.y = capBaseY;
  bottle.add(cap);

  // label
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.5), new THREE.MeshPhysicalMaterial({ roughness: 0.35, metalness: 0.1, transparent: true }));
  label.position.set(0, -0.2, BD / 2 + 0.004);
  bottle.add(label);
  drawLabel(label.material);

  // pouring stream
  const streamMat = new THREE.MeshPhysicalMaterial({ color: 0xf0b350, roughness: 0.1, emissive: 0xa4600e, emissiveIntensity: 0.7, clearcoat: 1 });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 1, 20, 1, true), streamMat);
  stream.visible = false;
  bottle.add(stream);
  // droplets that splash at the surface
  const drops = [];
  for (let i = 0; i < 10; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), streamMat);
    d.userData = { t: Math.random(), a: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 0.6 };
    d.visible = false;
    bottle.add(d);
    drops.push(d);
  }

  /* ---------- giant word behind the glass (refracts through it) ---------- */
  const giantMat = new THREE.MeshBasicMaterial({ alphaTest: 0.25, toneMapped: false });
  // warm halo behind everything — opaque so the glass refracts it
  const haloMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  (function () {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const g = c.getContext("2d");
    const r = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    r.addColorStop(0, "#4a2c10"); r.addColorStop(0.35, "#25160a"); r.addColorStop(0.7, "#0c0907"); r.addColorStop(1, "#070605");
    g.fillStyle = r; g.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; haloMat.map = t;
  })();
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), haloMat);
  halo.position.set(0, 0.2, -3.6);
  scene.add(halo);
  const giant = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), giantMat);
  const GZ = -2.2;
  giant.position.z = GZ;
  scene.add(giant);
  let giantAspect = 5;
  (function paintGiant() {
    const draw = () => {
      const c = document.createElement("canvas"); c.width = 2600; c.height = 560;
      const g = c.getContext("2d");
      g.font = "600 470px Unbounded, sans-serif";
      g.letterSpacing = "-28px";
      g.textAlign = "center"; g.textBaseline = "middle";
      g.lineWidth = 4; g.strokeStyle = "rgba(226,191,134,.55)"; g.strokeText("AROMATOV", c.width / 2, c.height / 2 + 20);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      giantMat.map = t; giantMat.needsUpdate = true;
      giantAspect = c.width / c.height;
      fitGiant();
    };
    draw();
    if (document.fonts) document.fonts.ready.then(draw);
  })();
  function fitGiant() {
    if (!camera) return;
    const d = camera.position.z - GZ;
    const vh = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const vw = vh * camera.aspect;
    const w = vw * (camera.aspect < 0.8 ? 1.15 : 1.02);
    giant.scale.set(w, w / giantAspect, 1);
    giant.position.y = camera.aspect < 0.8 ? vh * 0.2 : vh * 0.04;
  }

  /* ---------- gold dust ---------- */
  const N = mobile ? 140 : 600;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3), spd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 9;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 0.5;
    spd[i] = 0.05 + Math.random() * 0.15;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({
    size: mobile ? 0.04 : 0.032, map: dotTexture(), color: 0xf3cf8a,
    transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  const dust = new THREE.Points(pGeo, pMat);
  scene.add(dust);

  /* ---------- helpers ---------- */
  function dotTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d");
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.3, "rgba(255,230,180,.6)"); r.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function drawLabel(mat) {
    const paint = () => {
      const c = document.createElement("canvas"); c.width = 1024; c.height = 522;
      const g = c.getContext("2d");
      g.fillStyle = "#0b0907"; g.fillRect(0, 0, c.width, c.height);
      g.strokeStyle = "#d9b26a"; g.lineWidth = 6; g.strokeRect(22, 22, c.width - 44, c.height - 44);
      g.lineWidth = 2; g.strokeRect(40, 40, c.width - 80, c.height - 80);
      g.fillStyle = "#d9b26a"; g.textAlign = "center";
      g.font = "500 44px Manrope, sans-serif";
      g.letterSpacing = "22px";
      g.fillText("DOM", c.width / 2 + 11, 190);
      g.letterSpacing = "6px";
      g.fillStyle = "#f4ead8";
      g.font = "600 112px Unbounded, sans-serif";
      g.fillText("AROMATOV", c.width / 2 + 3, 318);
      g.fillStyle = "#b8955a";
      g.letterSpacing = "10px";
      g.font = "500 30px Manrope, sans-serif";
      g.fillText("PARFUMERIE ÉLÉGANTE", c.width / 2 + 5, 404);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      mat.map = t; mat.needsUpdate = true;
    };
    paint();
    if (document.fonts) document.fonts.ready.then(paint);
  }
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  /* ---------- size ---------- */
  let W = 0, H = 0;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // keep the bottle the same apparent size across aspect ratios
    camera.position.z = camera.aspect < 0.8 ? 11.8 : camera.aspect < 1.2 ? 10.4 : 9.4;
    fitGiant();
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  /* ---------- loop ---------- */
  const timer = new THREE.Timer(); timer.connect(document);
  const cur = { pour: S.pour, mx: 0, my: 0, intro: 0, shift: 0, lift: 0 };
  let running = true, visible = true, first = true;
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const op = S.opacity;
    canvas.style.opacity = op;
    if (op <= 0.001 && !first) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();
    const k = reduced ? 1 : 1 - Math.pow(0.0015, dt);
    cur.pour += (S.pour - cur.pour) * k;
    cur.mx += (S.mx - cur.mx) * (1 - Math.pow(0.02, dt));
    cur.my += (S.my - cur.my) * (1 - Math.pow(0.02, dt));
    cur.intro += (S.intro - cur.intro) * (1 - Math.pow(0.004, dt));
    cur.shift += (S.shift - cur.shift) * k;
    cur.lift += (S.lift - cur.lift) * k;
    const p = cur.pour;

    // root: intro drop-in, mouse tilt, scroll shift
    const intro = cur.intro;
    root.position.set(cur.shift, (1 - intro) * -2.2 + cur.lift + Math.sin(t * 0.8) * 0.05 * (reduced ? 0 : 1), 0);
    root.scale.setScalar(0.7 + 0.3 * intro);
    root.rotation.x = cur.my * 0.18 + 0.06;
    root.rotation.z = -cur.mx * 0.08;
    bottle.rotation.y = -0.45 + cur.mx * 0.35 + p * Math.PI * 0.9 + (reduced ? 0 : Math.sin(t * 0.35) * 0.08) + (1 - intro) * -1.2;

    // cap lifts off, floats aside, returns at the end
    const capAmt = sm(0, 0.14, p) - sm(0.86, 1, p);
    cap.position.set(capAmt * 1.15, capBaseY + capAmt * 0.75, capAmt * 0.3);
    cap.rotation.set(capAmt * 0.3, capAmt * 1.6 + t * 0.4 * capAmt, -capAmt * 0.55);

    // liquid level
    const level = 0.16 + 0.76 * sm(0.12, 0.84, p);
    S.level = level;
    const lh = LH * level;
    liquid.scale.y = lh;
    liquid.position.y = L0 + lh / 2;
    surface.position.y = L0 + lh + 0.002;
    // surface ripples while pouring
    const pourOn = sm(0.1, 0.16, p) * (1 - sm(0.8, 0.86, p));
    const amp = 0.012 + pourOn * 0.03;
    for (let i = 0; i < surfPos.count; i++) {
      const x = surfBase[i * 3], y = surfBase[i * 3 + 1];
      const r = Math.hypot(x, y);
      surfPos.array[i * 3 + 2] = Math.sin(r * 18 - t * 7) * amp * Math.exp(-r * 1.6) + Math.sin(x * 4 + t * 1.6) * 0.006;
    }
    surfPos.needsUpdate = true;
    surface.geometry.computeVertexNormals();

    // stream: falls in from above, then its tail drains down
    const sTop = 4.2, sBottom = L0 + lh;
    const b = sTop - (sTop - sBottom) * sm(0.1, 0.17, p);  // head falling in
    const a = sTop - (sTop - sBottom) * sm(0.8, 0.88, p);  // tail draining
    const len = a - b;
    stream.visible = pourOn > 0.001 && len > 0.02 && !reduced;
    if (stream.visible) {
      stream.scale.set(1 + Math.sin(t * 30) * 0.06, len, 1 + Math.cos(t * 26) * 0.06);
      stream.position.set(0, b + len / 2, 0);
    }
    drops.forEach((d) => {
      const u = d.userData;
      u.t += dt * 1.6 * u.s;
      if (u.t > 1) { u.t = 0; u.a = Math.random() * Math.PI * 2; u.s = 0.4 + Math.random() * 0.6; }
      const rr = u.t * 0.32 * u.s;
      d.position.set(Math.cos(u.a) * rr, sBottom + Math.sin(u.t * Math.PI) * 0.18 * u.s, Math.sin(u.a) * rr * 0.7);
      d.scale.setScalar(1 - u.t * 0.7);
      d.visible = stream.visible && pourOn > 0.5;
    });

    // dust drifts up
    if (!reduced) {
      const arr = pGeo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        arr[i * 3 + 1] += spd[i] * dt;
        arr[i * 3] += Math.sin(t * 0.3 + i) * 0.0008;
        if (arr[i * 3 + 1] > 3) arr[i * 3 + 1] = -3;
      }
      pGeo.attributes.position.needsUpdate = true;
    }
    dust.rotation.y = cur.mx * 0.15;
    pMat.opacity = 0.5 + 0.35 * pourOn + 0.15;

    giantMat.color.setScalar(Math.pow(Math.max(0, Math.min(1, S.giant == null ? 1 : S.giant)) * Math.min(1, intro * 1.5), 2.2));
    halo.position.x = root.position.x * 0.8;
    halo.position.y = 0.2 + root.position.y * 0.8;
    giant.position.x = -cur.mx * 0.15;

    // light breathes with the pour
    rim.intensity = 26 + pourOn * 18;

    renderer.render(scene, camera);
    if (first) { first = false; window.dispatchEvent(new Event("da:scene-ready")); }
  }
  frame();
}
