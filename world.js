// src/libs/picoworld/impl/card.tsx
import { useEffect, useRef, useState } from "./libs/react.js";

// src/libs/picoworld/impl/scene.ts
import * as THREE6 from "./libs/three.js";
import { OrbitControls } from "./libs/three.js";

// src/libs/picoworld/impl/materials.ts
import * as THREE from "./libs/three.js";

// src/libs/picoworld/python/picoworld/assets/catalog.json
var catalog_default = { materials: { soil: { label: "\u6CE5\u571F", color: "#99704f", pattern: "grain", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, grass: { label: "\u8349\u65B9\u5757", color: "#79a94f", pattern: "grass", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, sand: { label: "\u6C99\u5B50", color: "#e7d099", pattern: "grain", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, sandstone: { label: "\u7802\u5CA9", color: "#d9bd83", pattern: "sandstone", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, stone: { label: "\u77F3\u5934", color: "#92958f", pattern: "grain", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, cobblestone: { label: "\u5706\u77F3", color: "#858c87", pattern: "cobble", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, stone_bricks: { label: "\u77F3\u7816", color: "#9a9f96", pattern: "brick", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, brick: { label: "\u7EA2\u7816", color: "#b97156", pattern: "brick", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, clay: { label: "\u9ECF\u571F", color: "#a6b4bb", pattern: "grain", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, snow: { label: "\u96EA\u5757", color: "#f0f3ed", pattern: "grain", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, oak_log: { label: "\u6A61\u6728\u539F\u6728", color: "#86603c", pattern: "wood", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, oak_planks: { label: "\u6A61\u6728\u677F", color: "#c29a60", pattern: "planks", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, leaves: { label: "\u6811\u53F6", color: "#528949", pattern: "leaves", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, glass: { label: "\u73BB\u7483", color: "#b4dde2", pattern: "glass", roughness: 0.12, metalness: 0, opacity: 0.35, emissive: "#000000" }, coal_ore: { label: "\u7164\u77FF\u77F3", color: "#90958e", pattern: "ore", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000", accent: "#333734" }, iron_ore: { label: "\u94C1\u77FF\u77F3", color: "#90958e", pattern: "ore", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000", accent: "#c99876" }, gold_ore: { label: "\u91D1\u77FF\u77F3", color: "#90958e", pattern: "ore", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000", accent: "#e9bc4d" }, iron_block: { label: "\u94C1\u5757", color: "#c4ccca", pattern: "metal", roughness: 0.32, metalness: 0.65, opacity: 1, emissive: "#000000" }, gold_block: { label: "\u91D1\u5757", color: "#edc45a", pattern: "metal", roughness: 0.3, metalness: 0.65, opacity: 1, emissive: "#000000" }, obsidian: { label: "\u9ED1\u66DC\u77F3", color: "#393348", pattern: "cobble", roughness: 0.8, metalness: 0, opacity: 1, emissive: "#000000" }, glowstone: { label: "\u8424\u77F3", color: "#dfba69", pattern: "glowstone", roughness: 0.7, metalness: 0, opacity: 1, emissive: "#e9b958" }, water: { label: "\u6C34", color: "#50badf", pattern: "plain", roughness: 0.18, metalness: 0.1, opacity: 0.62, emissive: "#000000" } } };

// src/libs/picoworld/impl/materials.ts
var assets = catalog_default.materials;
function textureOf(bytes, color = false) {
  const texture = new THREE.DataTexture(bytes, 16, 16);
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = color ? THREE.NearestFilter : THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
function createMaterials() {
  const result = /* @__PURE__ */ new Map();
  for (const [id, asset] of Object.entries(assets)) {
    const size = 16;
    const bytes = new Uint8Array(size * size * 4);
    const heights = new Float32Array(size * size);
    const roughness = new Uint8Array(size * size * 4);
    const base = new THREE.Color(asset.color);
    const accent = new THREE.Color(asset.accent ?? asset.color);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const noise = (x * 73 + y * 151 + x * y * 17) % 31 / 31;
      let shade = asset.pattern === "plain" ? 1 : 0.91 + noise * 0.16;
      let color = base;
      if (asset.pattern === "brick" && (y % 8 === 0 || (x + (y < 8 ? 0 : 8)) % 16 === 0)) shade = 0.67;
      if (asset.pattern === "wood" && (x + Math.floor(y / 5)) % 6 === 0) shade = 0.76;
      if (asset.pattern === "planks" && (y % 4 === 0 || (x + Math.floor(y / 4) * 5) % 16 === 0)) shade = 0.7;
      if (asset.pattern === "sandstone" && (y === 0 || y === 8)) shade = 0.83;
      if (asset.pattern === "cobble" && (y % 5 === 0 || (x + Math.floor(y / 5) * 3) % 7 === 0)) shade = 0.64;
      if (asset.pattern === "grass" && (x * 3 + y * 7) % 11 < 2) shade = 0.72;
      if (asset.pattern === "leaves") shade = ((x >> 1) * 3 + (y >> 1) * 5) % 7 < 3 ? 0.7 : 1.08;
      if (asset.pattern === "ore" && ((x >> 1) * 7 + (y >> 1) * 11) % 13 < 4) color = accent;
      if (asset.pattern === "metal") shade = x === 0 || y === 0 ? 0.75 : x === 15 || y === 15 ? 1.12 : 1;
      if (asset.pattern === "glass") shade = x === 0 || y === 0 || x === 15 || y === 15 ? 0.75 : x === y || x === y + 1 ? 1.2 : 1;
      if (asset.pattern === "glowstone") shade = ((x >> 1) * 3 + (y >> 1) * 7) % 11 < 3 ? 0.63 : 1.12;
      heights[y * size + x] = (shade - 1) * (id === "glass" || id === "water" ? 0.012 : 0.075);
      if (id === "water") heights[y * size + x] = 6e-3 * Math.sin(x * Math.PI / 4) * Math.cos(y * Math.PI / 8);
      const pixel = color.clone().multiplyScalar(shade).convertLinearToSRGB();
      const offset = (y * size + x) * 4;
      bytes[offset] = Math.min(255, pixel.r * 255);
      bytes[offset + 1] = Math.min(255, pixel.g * 255);
      bytes[offset + 2] = Math.min(255, pixel.b * 255);
      bytes[offset + 3] = 255;
      roughness.fill(Math.round((0.82 + noise * 0.18) * 255), offset, offset + 3);
      roughness[offset + 3] = 255;
    }
    const normals = new Uint8Array(bytes.length);
    const height = (x, y) => heights[(y + size) % size * size + (x + size) % size];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const normal = new THREE.Vector3(
        (height(x - 1, y) - height(x + 1, y)) * size,
        (height(x, y - 1) - height(x, y + 1)) * size,
        1
      ).normalize();
      const offset = (y * size + x) * 4;
      normals[offset] = Math.round((normal.x * 0.5 + 0.5) * 255);
      normals[offset + 1] = Math.round((normal.y * 0.5 + 0.5) * 255);
      normals[offset + 2] = Math.round((normal.z * 0.5 + 0.5) * 255);
      normals[offset + 3] = 255;
    }
    const material = new THREE.MeshStandardMaterial({
      map: textureOf(bytes, true),
      normalMap: textureOf(normals),
      roughnessMap: textureOf(roughness),
      roughness: asset.roughness,
      metalness: asset.metalness,
      transparent: asset.opacity < 1,
      opacity: asset.opacity,
      depthWrite: asset.opacity === 1,
      emissive: asset.emissive,
      emissiveIntensity: id === "glowstone" ? 0.45 : 0
    });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = `attribute float picoOcclusion; varying float vPicoOcclusion;
${shader.vertexShader}`.replace("#include <begin_vertex>", "#include <begin_vertex>\nvPicoOcclusion = picoOcclusion;");
      shader.fragmentShader = `varying float vPicoOcclusion;
${shader.fragmentShader}`.replace("#include <aomap_fragment>", `#include <aomap_fragment>
          reflectedLight.indirectDiffuse *= vPicoOcclusion;
          reflectedLight.indirectSpecular *= mix(1.0, vPicoOcclusion, material.roughness);`);
    };
    material.customProgramCacheKey = () => "pico-voxel-occlusion-v1";
    result.set(id, material);
  }
  return result;
}
function disposeMaterials(materials) {
  for (const material of materials.values()) {
    material.map?.dispose();
    material.normalMap?.dispose();
    material.roughnessMap?.dispose();
    material.dispose();
  }
}

// src/libs/picoworld/impl/world.ts
var keyOf = (x, y, z) => `${x},${y},${z}`;
var defaultCell = (z) => ({ material: z < 0 ? "soil" : null, water: false });
var WorldView = class {
  cells = /* @__PURE__ */ new Map();
  at(x, y, z) {
    return this.cells.get(keyOf(x, y, z)) ?? defaultCell(z);
  }
  apply(change, reverse = false) {
    for (const cell2 of change.cells) {
      const key = keyOf(cell2.x, cell2.y, cell2.z);
      const value = reverse ? cell2.before : cell2.after;
      if (value === null) this.cells.delete(key);
      else this.cells.set(key, value);
    }
  }
};

// src/libs/picoworld/impl/ground.ts
import * as THREE2 from "./libs/three.js";
var GroundSurface = class extends THREE2.Mesh {
  holes = /* @__PURE__ */ new Set();
  uniforms = {
    groundHoles: { value: new THREE2.DataTexture(new Float32Array(4), 1, 1, THREE2.RGBAFormat, THREE2.FloatType) },
    groundHoleCount: { value: 0 },
    groundHoleSize: { value: new THREE2.Vector2(1, 1) }
  };
  plane = new THREE2.Plane(new THREE2.Vector3(0, 0, 1), 0);
  constructor(source) {
    const material = source.clone();
    material.map = source.map.clone();
    material.map.wrapS = material.map.wrapT = THREE2.RepeatWrapping;
    material.map.generateMipmaps = true;
    material.map.minFilter = THREE2.LinearMipmapLinearFilter;
    material.map.needsUpdate = true;
    for (const name of ["normalMap", "roughnessMap"]) {
      material[name] = source[name].clone();
      material[name].needsUpdate = true;
    }
    super(new THREE2.PlaneGeometry(1e5, 1e5), material);
    this.receiveShadow = true;
    this.frustumCulled = false;
    this.uniforms.groundHoles.value.needsUpdate = true;
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.vertexShader = `varying vec2 groundXY;
${shader.vertexShader}`.replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>
        groundXY = (modelMatrix * vec4(position, 1.0)).xy;
        vMapUv = groundXY;
        #ifdef USE_NORMALMAP
          vNormalMapUv = groundXY;
        #endif
        #ifdef USE_ROUGHNESSMAP
          vRoughnessMapUv = groundXY;
        #endif`
      );
      shader.fragmentShader = `
        varying vec2 groundXY;
        uniform sampler2D groundHoles;
        uniform float groundHoleCount;
        uniform vec2 groundHoleSize;
        vec2 holeAt(float i) {
          return texture2D(groundHoles, (vec2(mod(i, groundHoleSize.x), floor(i / groundHoleSize.x)) + 0.5) / groundHoleSize).xy;
        }
        ${shader.fragmentShader}`.replace("#include <clipping_planes_fragment>", `
        #include <clipping_planes_fragment>
        vec2 cell = floor(groundXY);
        float low = 0.0, high = groundHoleCount;
        for (int search = 0; search < 32; search++) {
          if (low >= high) break;
          float mid = floor((low + high) * 0.5);
          vec2 candidate = holeAt(mid);
          if (candidate.x < cell.x || (candidate.x == cell.x && candidate.y < cell.y)) low = mid + 1.0;
          else high = mid;
        }
        if (low < groundHoleCount && all(equal(holeAt(low), cell))) discard;
        `).replace("#include <map_fragment>", `
        #include <map_fragment>
        vec2 footprint = max(fwidth(groundXY), vec2(0.0001));
        vec2 edge = min(fract(groundXY), 1.0 - fract(groundXY));
        float grid = 1.0 - smoothstep(0.0, 1.1, min(edge.x / footprint.x, edge.y / footprint.y));
        float visibility = 1.0 - smoothstep(0.12, 0.65, max(footprint.x, footprint.y));
        diffuseColor.rgb *= 1.0 - 0.15 * grid * visibility;
        `);
    };
    material.customProgramCacheKey = () => "pico-ground-relief-v1";
  }
  sync(world) {
    const coordinates = [];
    this.holes.clear();
    for (const key of world.cells.keys()) {
      const [x, y, z] = key.split(",").map(Number);
      if (z === -1) {
        this.holes.add(`${x},${y}`);
        coordinates.push([x, y]);
      }
    }
    coordinates.sort(([x, y], [a, b]) => x - a || y - b);
    const width = Math.min(1024, Math.max(1, coordinates.length));
    const height = Math.max(1, Math.ceil(coordinates.length / width));
    const data = new Float32Array(width * height * 4);
    coordinates.forEach(([x, y], index) => {
      data[index * 4] = x;
      data[index * 4 + 1] = y;
    });
    this.uniforms.groundHoles.value.dispose();
    this.uniforms.groundHoles.value = new THREE2.DataTexture(data, width, height, THREE2.RGBAFormat, THREE2.FloatType);
    this.uniforms.groundHoles.value.needsUpdate = true;
    this.uniforms.groundHoleCount.value = coordinates.length;
    this.uniforms.groundHoleSize.value.set(width, height);
  }
  /** Shader cutouts must also be respected by CPU picking. */
  raycast(raycaster, hits) {
    const point = raycaster.ray.intersectPlane(this.plane, new THREE2.Vector3());
    if (!point || this.holes.has(`${Math.floor(point.x)},${Math.floor(point.y)}`)) return;
    const distance = point.distanceTo(raycaster.ray.origin);
    if (distance < raycaster.near || distance > raycaster.far) return;
    hits.push({ distance, point, object: this });
  }
  dispose() {
    this.geometry.dispose();
    this.material.map?.dispose();
    this.material.normalMap?.dispose();
    this.material.roughnessMap?.dispose();
    this.material.dispose();
    this.uniforms.groundHoles.value.dispose();
  }
};

// src/libs/picoworld/impl/motion.ts
function cellMotion(before, after, reverse, progress) {
  const t = Math.max(0, Math.min(1, reverse ? 1 - progress : progress));
  const ease = t * t * (3 - 2 * t);
  const beforeMaterial = before.water ? "water" : before.material;
  const afterMaterial = after.water ? "water" : after.material;
  const beforeOffset = beforeMaterial && !afterMaterial && !before.water ? -5 * ease || 0 : 0;
  const afterOffset = afterMaterial && !beforeMaterial && !after.water ? 5 * (1 - ease) : 0;
  return reverse ? { sourceOffset: afterOffset, targetOffset: beforeOffset } : { sourceOffset: beforeOffset, targetOffset: afterOffset };
}

// src/libs/picoworld/impl/explosion.ts
import * as THREE3 from "./libs/three.js";
function explosionPhase(progress, reverse) {
  const t = Math.max(0, Math.min(1, reverse ? 1 - progress : progress));
  return { t, crater: t >= 0.12 };
}
var ExplosionEffect = class extends THREE3.Group {
  constructor(explosion2) {
    super();
    this.explosion = explosion2;
    const count = Math.min(384, explosion2.blocks.length * 4);
    this.debris = new THREE3.InstancedMesh(
      new THREE3.BoxGeometry(1, 1, 1),
      new THREE3.MeshStandardMaterial({ roughness: 0.9, transparent: true, depthWrite: false }),
      count
    );
    this.debris.frustumCulled = false;
    const { center, radius, blocks } = explosion2;
    for (let i = 0; i < count; i++) {
      const index = Math.floor(i * blocks.length * 4 / count);
      const block = blocks[Math.floor(index / 4)];
      const corner = index % 4;
      const start = new THREE3.Vector3(
        block.x + (corner % 2 ? 0.75 : 0.25),
        block.y + (corner < 2 ? 0.25 : 0.75),
        block.z + 0.65
      );
      const direction = new THREE3.Vector2(start.x - center.x - 0.5, start.y - center.y - 0.5).normalize();
      const speed = (radius + 1) * (1.1 + index % 7 * 0.1);
      this.pieces.push({ start, velocity: new THREE3.Vector3(
        direction.x * speed,
        direction.y * speed,
        radius * 2 + 3 + Math.max(0, center.z - block.z)
      ), spin: (index % 2 ? 1 : -1) * (2 + index % 5) });
      this.debris.setColorAt(i, new THREE3.Color(catalog_default.materials[block.material].color));
    }
    this.flash.position.set(center.x + 0.5, center.y + 0.5, center.z + 0.8);
    this.shockwave.position.set(center.x + 0.5, center.y + 0.5, center.z + 1.02);
    this.add(this.debris, this.flash, this.shockwave);
    this.sample(0, false);
  }
  explosion;
  pieces = [];
  debris;
  flash = new THREE3.Mesh(
    new THREE3.SphereGeometry(1, 16, 10),
    new THREE3.MeshBasicMaterial({ color: "#fff0b0", transparent: true, depthWrite: false, blending: THREE3.AdditiveBlending })
  );
  shockwave = new THREE3.Mesh(
    new THREE3.RingGeometry(0.86, 1, 64),
    new THREE3.MeshBasicMaterial({ color: "#ffc66b", transparent: true, depthWrite: false, side: THREE3.DoubleSide })
  );
  transform = new THREE3.Object3D();
  sample(progress, reverse) {
    const { t } = explosionPhase(progress, reverse);
    const flight = Math.max(0, (t - 0.08) / 0.92);
    const fade = Math.max(0, Math.min(1, (1 - t) / 0.35));
    this.debris.visible = t >= 0.08 && t < 1;
    this.debris.material.opacity = fade;
    for (let i = 0; i < this.pieces.length; i++) {
      const piece = this.pieces[i];
      this.transform.position.copy(piece.start).addScaledVector(piece.velocity, flight);
      this.transform.position.z -= (this.explosion.radius + 2) * flight * flight;
      this.transform.rotation.set(piece.spin * flight, piece.spin * 0.7 * flight, piece.spin * 0.4 * flight);
      this.transform.scale.setScalar(0.38 * fade);
      this.transform.updateMatrix();
      this.debris.setMatrixAt(i, this.transform.matrix);
    }
    this.debris.instanceMatrix.needsUpdate = true;
    this.flash.scale.setScalar((0.15 + t * 3) * this.explosion.radius);
    this.flash.material.opacity = t <= 0 || t >= 0.4 ? 0 : Math.min(1, t / 0.08) * (1 - t / 0.4);
    this.shockwave.scale.setScalar(0.2 + this.explosion.radius * 2.5 * t);
    this.shockwave.material.opacity = t <= 0 || t >= 0.7 ? 0 : Math.min(1, t / 0.08) * (1 - t / 0.7);
  }
  dispose() {
    for (const mesh of [this.debris, this.flash, this.shockwave]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.debris.dispose();
  }
};

// src/libs/picoworld/impl/appearance.ts
import * as THREE4 from "./libs/three.js";
import { LineSegments2 } from "./libs/three.js";
import { LineSegmentsGeometry } from "./libs/three.js";
import { LineMaterial } from "./libs/three.js";
function createHoverOutline() {
  const geometry = new LineSegmentsGeometry().setPositions([
    -0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.5,
    0.5,
    -0.5,
    -0.5,
    0.5
  ]);
  const material = new LineMaterial({ linewidth: 3, worldUnits: false, depthTest: false, depthWrite: false });
  const outline = new LineSegments2(geometry, material);
  outline.renderOrder = 10;
  outline.visible = false;
  return outline;
}
function createSky(top, horizon) {
  const data = new Uint8Array(256 * 4);
  for (let row = 0; row < 256; row++) {
    const color = horizon.clone().lerp(top, row / 255).convertLinearToSRGB();
    data[row * 4] = Math.round(color.r * 255);
    data[row * 4 + 1] = Math.round(color.g * 255);
    data[row * 4 + 2] = Math.round(color.b * 255);
    data[row * 4 + 3] = 255;
  }
  const texture = new THREE4.DataTexture(data, 1, 256);
  texture.colorSpace = THREE4.SRGBColorSpace;
  texture.magFilter = THREE4.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
function readTokenColor(host, token) {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;color:var(${token})`;
  host.append(probe);
  const css = getComputedStyle(probe).color;
  probe.remove();
  const srgb = css.match(/^color\(srgb\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)/);
  return srgb ? new THREE4.Color().setRGB(Number(srgb[1]), Number(srgb[2]), Number(srgb[3]), THREE4.SRGBColorSpace) : new THREE4.Color(css);
}

// src/libs/picoworld/impl/lighting.ts
import * as THREE5 from "./libs/three.js";
var SUN_POSITION = new THREE5.Vector3(-18, -25, 38);
function createEnvironment(top, horizon) {
  const width = 256, height = 128;
  const data = new Uint16Array(width * height * 4);
  const ground = horizon.clone().lerp(new THREE5.Color("#e5dfcf"), 0.55).multiplyScalar(0.85);
  const sun = SUN_POSITION.clone().normalize();
  const warm = new THREE5.Color("#fff1d5");
  const direction = new THREE5.Vector3(), color = new THREE5.Color();
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const latitude = ((y + 0.5) / height - 0.5) * Math.PI;
    const longitude = ((x + 0.5) / width - 0.5) * 2 * Math.PI;
    direction.set(Math.cos(latitude) * Math.cos(longitude), Math.sin(latitude), Math.cos(latitude) * Math.sin(longitude));
    color.copy(horizon).lerp(top, Math.pow(Math.max(0, direction.z), 0.55));
    if (direction.z < 0) color.lerp(ground, Math.min(1, -direction.z * 5));
    const alignment = direction.dot(sun);
    const sunlight = 3 * Math.exp((alignment - 1) * 700) + 0.16 * Math.exp((alignment - 1) * 24);
    color.r += warm.r * sunlight;
    color.g += warm.g * sunlight;
    color.b += warm.b * sunlight;
    const offset = (y * width + x) * 4;
    data[offset] = THREE5.DataUtils.toHalfFloat(color.r);
    data[offset + 1] = THREE5.DataUtils.toHalfFloat(color.g);
    data[offset + 2] = THREE5.DataUtils.toHalfFloat(color.b);
    data[offset + 3] = THREE5.DataUtils.toHalfFloat(1);
  }
  const texture = new THREE5.DataTexture(data, width, height, THREE5.RGBAFormat, THREE5.HalfFloatType);
  texture.mapping = THREE5.EquirectangularReflectionMapping;
  texture.colorSpace = THREE5.LinearSRGBColorSpace;
  texture.magFilter = texture.minFilter = THREE5.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
var WorldLighting = class {
  constructor(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.fill.position.set(0, 0, 50);
    this.sun.position.copy(SUN_POSITION);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 0.5, far: 140 });
    this.sun.shadow.bias = -15e-5;
    this.sun.shadow.normalBias = 0.025;
    scene.environmentIntensity = 0.8;
    scene.add(this.sun, this.fill);
  }
  renderer;
  scene;
  sun = new THREE5.DirectionalLight("#fff4e4", 2.35);
  fill = new THREE5.HemisphereLight("#f4f9ff", "#d5d8cf", 1.7);
  environment = null;
  palette = "";
  setSky(top, horizon) {
    const palette = [...top.toArray(), ...horizon.toArray()].join(",");
    if (palette === this.palette) return;
    const source = createEnvironment(top, horizon);
    const generator = new THREE5.PMREMGenerator(this.renderer);
    try {
      const next = generator.fromEquirectangular(source);
      this.environment?.dispose();
      this.environment = next;
      this.scene.environment = next.texture;
      this.palette = palette;
    } finally {
      source.dispose();
      generator.dispose();
    }
  }
  dispose() {
    this.scene.environment = null;
    this.environment?.dispose();
    this.sun.shadow.dispose();
    this.scene.remove(this.sun, this.fill);
  }
};

// src/libs/picoworld/impl/occlusion.ts
function voxelOcclusion(world, geometry, x, y, z) {
  const position = geometry.getAttribute("position"), normal = geometry.getAttribute("normal");
  const values = new Float32Array(position.count);
  const solid = (point) => {
    const material = world.at(point[0], point[1], point[2]).material;
    return material !== null && material !== "glass";
  };
  for (let vertex = 0; vertex < position.count; vertex++) {
    const face = [normal.getX(vertex), normal.getY(vertex), normal.getZ(vertex)];
    const corner = [position.getX(vertex), position.getY(vertex), position.getZ(vertex)];
    const axes = [0, 1, 2].filter((axis) => face[axis] === 0);
    const outside = [x + face[0], y + face[1], z + face[2]];
    const sideA = [...outside], sideB = [...outside], diagonal = [...outside];
    sideA[axes[0]] += Math.sign(corner[axes[0]]);
    sideB[axes[1]] += Math.sign(corner[axes[1]]);
    diagonal[axes[0]] = sideA[axes[0]];
    diagonal[axes[1]] = sideB[axes[1]];
    const a = Number(solid(sideA)), b = Number(solid(sideB));
    const blocked = a && b ? 3 : a + b + Number(solid(diagonal));
    values[vertex] = [1, 0.95, 0.9, 0.85][blocked];
  }
  return values;
}

// src/libs/picoworld/impl/scene.ts
var adjacent = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
var WorldScene = class {
  constructor(host, onHover) {
    this.host = host;
    this.onHover = onHover;
    this.renderer = new THREE6.WebGLRenderer({ antialias: true, alpha: false, logarithmicDepthBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE6.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.outputColorSpace = THREE6.SRGBColorSpace;
    this.renderer.toneMapping = THREE6.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
    this.renderer.domElement.setAttribute("aria-label", "Pico \u4E09\u7EF4\u4E16\u754C\uFF0C\u62D6\u52A8\u65CB\u8F6C\uFF0C\u6EDA\u8F6E\u7F29\u653E");
    this.host.append(this.renderer.domElement);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(12, -18, 9);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 95;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = THREE6.MathUtils.degToRad(88);
    this.lighting = new WorldLighting(this.renderer, this.scene);
    this.geometry.setAttribute("picoOcclusion", new THREE6.Float32BufferAttribute(new Float32Array(24).fill(1), 1));
    for (const material of this.materials.values()) {
      for (const texture of [material.map, material.normalMap, material.roughnessMap]) {
        if (texture) texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
      }
    }
    this.ground = new GroundSurface(this.materials.get("soil"));
    this.scene.add(this.ground);
    this.updateAppearance();
    this.themeObserver = new MutationObserver(this.updateAppearance);
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-pico-theme", "style", "class"] });
    this.themeQuery.addEventListener("change", this.updateAppearance);
    this.scene.add(this.highlight);
    this.move = (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer = new THREE6.Vector2(
        (event.clientX - rect.left) / rect.width * 2 - 1,
        -(event.clientY - rect.top) / rect.height * 2 + 1
      );
    };
    this.leave = () => {
      this.pointer = null;
      this.pick();
    };
    this.renderer.domElement.addEventListener("pointermove", this.move);
    this.renderer.domElement.addEventListener("pointerleave", this.leave);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.resize();
    this.rebuild();
  }
  host;
  onHover;
  world = new WorldView();
  scene = new THREE6.Scene();
  renderer;
  camera = new THREE6.PerspectiveCamera(55, 1, 0.1, 3e4);
  controls;
  lighting;
  shadowsDirty = true;
  materials = createMaterials();
  geometry = new THREE6.BoxGeometry(1, 1, 1);
  meshes = /* @__PURE__ */ new Map();
  incoming = /* @__PURE__ */ new Map();
  explosion = null;
  raycaster = new THREE6.Raycaster();
  pointer = null;
  hoverKey = "";
  ground;
  highlight = createHoverOutline();
  themeObserver;
  themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  updateAppearance = () => {
    const top = readTokenColor(this.host, "--pico-world-sky-top");
    const horizon = readTokenColor(this.host, "--pico-world-sky-horizon");
    this.scene.background?.dispose();
    this.scene.background = createSky(top, horizon);
    this.lighting.setSky(top, horizon);
    this.highlight.material.color.copy(readTokenColor(this.host, "--pico-accent"));
  };
  observer;
  move;
  leave;
  resize() {
    const width = Math.max(1, this.host.clientWidth), height = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  mesh(x, y, z, material) {
    const surface = this.materials.get(material) ?? this.materials.get("stone");
    const mesh = new THREE6.Mesh(this.geometry, surface);
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    mesh.castShadow = material !== "water" && material !== "glass";
    mesh.receiveShadow = true;
    mesh.userData.cell = { x, y, z };
    return mesh;
  }
  refresh(x, y, z) {
    const key = keyOf(x, y, z);
    const previous = this.meshes.get(key);
    if (previous) {
      this.scene.remove(previous);
      if (previous.geometry !== this.geometry) previous.geometry.dispose();
    }
    this.meshes.delete(key);
    const cell2 = this.world.at(x, y, z);
    const material = cell2.water ? "water" : cell2.material;
    if (!material) return;
    const groundTop = z === -1 && !this.world.cells.has(key);
    if (!adjacent.some(([dx, dy, dz]) => {
      if (groundTop && dz === 1) return false;
      const next = this.world.at(x + dx, y + dy, z + dz);
      return !next.material || next.material === "glass";
    })) return;
    const mesh = this.mesh(x, y, z, material);
    mesh.geometry = this.geometry.clone();
    mesh.geometry.setAttribute("picoOcclusion", new THREE6.Float32BufferAttribute(voxelOcclusion(this.world, this.geometry, x, y, z), 1));
    if (groundTop) {
      const normal = mesh.geometry.getAttribute("normal");
      mesh.geometry.setIndex([...mesh.geometry.index.array].filter((vertex) => normal.getZ(vertex) !== 1));
    }
    this.meshes.set(key, mesh);
    this.scene.add(mesh);
  }
  rebuild() {
    this.clearTransition();
    for (const mesh of this.meshes.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    }
    this.meshes.clear();
    this.ground.sync(this.world);
    for (const key of this.world.cells.keys()) {
      const [x, y, z] = key.split(",").map(Number);
      this.refresh(x, y, z);
      for (const [dx, dy, dz] of adjacent) this.refresh(x + dx, y + dy, z + dz);
    }
    this.shadowsDirty = true;
  }
  commit(change, reverse) {
    this.clearTransition();
    this.world.apply(change, reverse);
    this.paintChange(change);
  }
  paintChange(change) {
    if (change.cells.some((cell2) => cell2.z === -1)) this.ground.sync(this.world);
    const dirty = /* @__PURE__ */ new Set();
    for (const { x, y, z } of change.cells) {
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        dirty.add(keyOf(x + dx, y + dy, z + dz));
      }
    }
    for (const key of dirty) {
      const [x, y, z] = key.split(",").map(Number);
      this.refresh(x, y, z);
    }
    this.shadowsDirty = true;
  }
  transition(change, reverse, progress) {
    if (change.explosion) {
      if (this.explosion?.change !== change || this.explosion.reverse !== reverse) {
        this.clearTransition();
        const effect = new ExplosionEffect(change.explosion);
        this.explosion = { change, reverse, effect, projected: false };
        this.scene.add(effect);
      }
      const projected = explosionPhase(progress, reverse).crater !== reverse;
      if (projected !== this.explosion.projected) {
        if (projected) this.world.apply(change, reverse);
        try {
          this.paintChange(change);
        } finally {
          if (projected) this.world.apply(change, !reverse);
        }
        this.explosion.projected = projected;
      }
      this.explosion.effect.sample(progress, reverse);
      return;
    }
    for (const cell2 of change.cells) {
      const key = keyOf(cell2.x, cell2.y, cell2.z);
      const old = this.meshes.get(key);
      const motion = cellMotion(cell2.before ?? defaultCell(cell2.z), cell2.after ?? defaultCell(cell2.z), reverse, progress);
      const value = (reverse ? cell2.before : cell2.after) ?? defaultCell(cell2.z);
      const material = value.water ? "water" : value.material;
      if (old) {
        old.scale.setScalar(1);
        old.position.z = cell2.z + 0.5 + motion.sourceOffset;
        old.visible = !material;
      }
      if (!material) continue;
      let mesh = this.incoming.get(key);
      if (!mesh) {
        mesh = this.mesh(cell2.x, cell2.y, cell2.z, material);
        this.incoming.set(key, mesh);
        this.scene.add(mesh);
      }
      mesh.scale.setScalar(1);
      mesh.position.z = cell2.z + 0.5 + motion.targetOffset;
    }
    this.shadowsDirty = true;
  }
  clearTransition() {
    if (this.explosion || this.incoming.size) this.shadowsDirty = true;
    if (this.explosion) {
      const { effect, change, projected } = this.explosion;
      this.explosion = null;
      this.scene.remove(effect);
      effect.dispose();
      if (projected) this.paintChange(change);
    }
    for (const mesh of this.incoming.values()) this.scene.remove(mesh);
    this.incoming.clear();
    for (const mesh of this.meshes.values()) {
      mesh.visible = true;
      mesh.scale.setScalar(1);
      const cell2 = mesh.userData.cell;
      mesh.position.z = cell2.z + 0.5;
    }
  }
  render() {
    this.controls.update();
    this.scene.updateMatrixWorld(true);
    this.camera.updateMatrixWorld(true);
    this.pick();
    if (this.shadowsDirty) {
      this.renderer.shadowMap.needsUpdate = true;
      this.shadowsDirty = false;
    }
    this.renderer.render(this.scene, this.camera);
  }
  resetOrigin() {
    const damping = this.controls.enableDamping;
    this.controls.enableDamping = false;
    this.controls.update();
    this.controls.target.set(0, 0, 0);
    this.camera.position.set(12, -18, 9);
    this.controls.update();
    this.controls.enableDamping = damping;
  }
  pick() {
    let position = null;
    if (this.pointer) {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      this.raycaster.far = this.camera.far;
      const hit = this.raycaster.intersectObjects([this.ground, ...this.meshes.values(), ...this.incoming.values()], false)[0];
      if (hit) {
        if (hit.object === this.ground) {
          const x = Math.floor(hit.point.x), y = Math.floor(hit.point.y);
          position = { x, y, z: -1 };
          this.highlight.position.set(x + 0.5, y + 0.5, -0.5);
          this.highlight.scale.setScalar(1);
        } else {
          const { x, y, z } = hit.object.userData.cell;
          position = { x, y, z };
          this.highlight.position.copy(hit.object.position);
          this.highlight.scale.copy(hit.object.scale);
        }
      }
    }
    this.highlight.visible = position !== null;
    const key = position ? `${position.x},${position.y},${position.z}` : "";
    if (key !== this.hoverKey) {
      this.hoverKey = key;
      this.onHover(position);
    }
  }
  dispose() {
    this.clearTransition();
    this.observer.disconnect();
    this.themeObserver.disconnect();
    this.themeQuery.removeEventListener("change", this.updateAppearance);
    this.scene.background?.dispose();
    this.ground.dispose();
    this.controls.dispose();
    this.renderer.domElement.removeEventListener("pointermove", this.move);
    this.renderer.domElement.removeEventListener("pointerleave", this.leave);
    this.geometry.dispose();
    for (const mesh of this.meshes.values()) mesh.geometry.dispose();
    this.highlight.geometry.dispose();
    this.highlight.material.dispose();
    disposeMaterials(this.materials);
    this.lighting.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
};

// src/libs/picoworld/impl/timeline.ts
var Timeline = class {
  start = 0;
  end = 0;
  time = 0;
  duration = 1;
  velocity = 0;
  sample(now) {
    const t = Math.max(0, Math.min(1, (now - this.time) / this.duration));
    const distance = this.end - this.start;
    const tangent = this.velocity * this.duration;
    return {
      position: this.start + (3 * t * t - 2 * t * t * t) * distance + (t * t * t - 2 * t * t + t) * tangent,
      velocity: ((6 * t - 6 * t * t) * distance + (3 * t * t - 4 * t + 1) * tangent) / this.duration
    };
  }
  append(count, now, durationMs, catchUpMs) {
    const current = this.sample(now);
    const catchingUp = current.position < this.end - 1e-9;
    this.start = current.position;
    this.end += count;
    this.time = now;
    this.velocity = Math.max(0, current.velocity);
    const distance = this.end - this.start;
    const budget = catchingUp ? catchUpMs : durationMs * distance;
    this.duration = Math.max(1e-3, Math.min(
      budget,
      this.velocity > 0 ? 3 * distance / this.velocity : Infinity
    ));
  }
  reset() {
    this.start = this.end = this.velocity = 0;
    this.time = 0;
    this.duration = 1;
  }
};

// src/libs/picoworld/impl/playback.ts
function resolveWorldTransition(current, target, requested) {
  if (requested !== void 0) return requested;
  return Math.abs(target - current) <= 1 ? "animate" : "snap";
}

// src/libs/picoworld/impl/orientation.ts
import { Vector3 as Vector35 } from "./libs/three.js";
var AXES = ["x", "y", "z"];
function projectWorldAxes(camera, anchor) {
  const view = camera.quaternion.clone().normalize().conjugate();
  const projection = camera.projectionMatrix.elements;
  const axes = AXES.map((axis, index) => {
    const direction = new Vector35().setComponent(index, 1).applyQuaternion(view);
    return {
      axis,
      x: (projection[0] * direction.x + anchor.x * direction.z) * anchor.width,
      y: -(projection[5] * direction.y + anchor.y * direction.z) * anchor.height,
      depth: direction.z
    };
  });
  const scale = Math.max(...axes.map((axis) => Math.hypot(axis.x, axis.y)), 1e-10);
  return axes.map((axis) => ({ ...axis, x: axis.x / scale, y: axis.y / scale }));
}
var OrientationIndicator = class {
  constructor(svg) {
    this.svg = svg;
    this.parts = Object.fromEntries(AXES.map((axis) => {
      const group = svg.querySelector(`[data-axis="${axis}"]`);
      return [axis, {
        group,
        line: group.querySelector("[data-line]"),
        head: group.querySelector("[data-head]"),
        label: group.querySelector("text")
      }];
    }));
  }
  svg;
  projectionKey = "";
  parts;
  update(camera, viewport) {
    const rect = viewport.getBoundingClientRect(), widget = this.svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const anchor = {
      x: (widget.left + widget.width / 2 - rect.left) / rect.width * 2 - 1,
      y: 1 - (widget.top + widget.height / 2 - rect.top) / rect.height * 2,
      width: rect.width,
      height: rect.height
    };
    const key = [
      ...camera.quaternion.toArray(),
      ...camera.projectionMatrix.elements,
      anchor.x,
      anchor.y,
      anchor.width,
      anchor.height
    ].join(",");
    if (key === this.projectionKey) return;
    this.projectionKey = key;
    for (const { axis, x, y, depth } of projectWorldAxes(camera, anchor).sort((a, b) => a.depth - b.depth)) {
      const { group, line, head, label } = this.parts[axis];
      const endX = 48 + 26 * x, endY = 48 + 26 * y;
      const length = Math.hypot(x, y);
      const ux = length > 1e-3 ? x / length : 0;
      const uy = length > 1e-3 ? y / length : -1;
      line.setAttribute("d", `M48 48 L${endX} ${endY}`);
      head.setAttribute("d", length < 0.05 ? "" : `M${endX - ux * 4 - uy * 2} ${endY - uy * 4 + ux * 2} L${endX} ${endY} L${endX - ux * 4 + uy * 2} ${endY - uy * 4 - ux * 2}`);
      label.setAttribute("x", String(endX + ux * 10));
      label.setAttribute("y", String(endY + uy * 10));
      group.setAttribute("opacity", depth < 0 ? "0.72" : "1");
      this.svg.append(group);
    }
  }
};

// src/libs/picoworld/impl/card.css
var card_default = ".pico-world-card {\n  --pico-world-overlay-inset: var(--pico-space-3);\n  --pico-world-sky-top: var(--pico-accent);\n  --pico-world-sky-horizon: color-mix(in srgb, var(--pico-on-accent) 70%, var(--pico-accent));\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  color: var(--pico-ink);\n  background: var(--pico-surface);\n  font: var(--pico-size-xs)/1.4 var(--pico-font-ui);\n  user-select: none;\n}\n.pico-world-card__canvas { position: relative; flex: 1; min-height: 0; overflow: hidden; }\n.pico-world-card__canvas canvas { display: block; width: 100%; height: 100%; touch-action: none; }\n.pico-world-card__coordinates {\n  position: absolute;\n  left: var(--pico-world-overlay-inset);\n  bottom: var(--pico-world-overlay-inset);\n  padding: 6px 9px;\n  border-radius: var(--pico-radius-sm);\n  color: var(--pico-ink-soft);\n  background: color-mix(in srgb, var(--pico-surface-raised) 72%, transparent);\n  font-family: var(--pico-font-ui);\n  font-variant-numeric: tabular-nums;\n  pointer-events: none;\n  opacity: 0.78;\n  font-size: calc(var(--pico-size-xs) + 2px);\n}\n.pico-world-card__axis-gizmo {\n  position: absolute;\n  left: var(--pico-world-overlay-inset);\n  bottom: calc(var(--pico-world-overlay-inset) + 12px);\n  width: 96px;\n  height: 96px;\n  padding: 0;\n  border: 0;\n  border-radius: var(--pico-radius);\n  background: transparent;\n  color: var(--pico-ink-soft);\n  cursor: pointer;\n  opacity: 0.86;\n  transition: opacity var(--pico-duration-fast), filter var(--pico-duration-fast);\n}\n.pico-world-card__axis-gizmo:hover,\n.pico-world-card__axis-gizmo:focus-visible {\n  opacity: 1;\n  background: transparent;\n  filter: brightness(1.12);\n}\n.pico-world-card__axis-gizmo svg { display: block; width: 100%; height: 100%; }\n.pico-world-axis { fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }\n.pico-world-axis--x { color: #d95757; }\n.pico-world-axis--y { color: #3a9b68; }\n.pico-world-axis--z { color: #4b80d1; }\n.pico-world-axis-label { fill: currentColor; font: 500 13px var(--pico-font-ui); }\n.pico-world-card__error {\n  position: absolute;\n  inset: var(--pico-space-4);\n  padding: var(--pico-space-4);\n  border-radius: var(--pico-radius);\n  background: var(--pico-hue-error-bg);\n  color: var(--pico-hue-error-ink);\n}\n";

// src/libs/picoworld/impl/card.tsx
import { jsx, jsxs } from "./libs/react.js";
var Player = class {
  constructor(scene) {
    this.scene = scene;
  }
  scene;
  history = null;
  position = 0;
  consumed = 0;
  queue = [];
  timeline = new Timeline();
  update(props, now) {
    if (!Number.isInteger(props.position) || props.position < 0 || props.position > props.history.length) {
      throw new RangeError("PicoWorld position is outside history");
    }
    const duration = props.animation?.durationMs ?? 400;
    const catchUp = props.animation?.catchUpMs ?? 200;
    if (![duration, catchUp].every((value) => Number.isFinite(value) && value > 0)) {
      throw new RangeError("PicoWorld animation durations must be finite and positive");
    }
    const distance = Math.abs(props.position - this.position);
    const seek = resolveWorldTransition(this.position, props.position, props.transition) === "snap";
    if (this.history !== props.history || seek || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.queue = [];
      this.timeline.reset();
      this.consumed = 0;
      this.scene.world.cells.clear();
      for (let index = 0; index < props.position; index++) this.scene.world.apply(props.history.at(index));
      this.history = props.history;
      this.position = props.position;
      this.scene.rebuild();
      return;
    }
    this.tick(now);
    const count = distance;
    if (count === 0) return;
    while (this.position < props.position) this.queue.push({ change: props.history.at(this.position++), reverse: false });
    while (this.position > props.position) this.queue.push({ change: props.history.at(--this.position), reverse: true });
    this.timeline.append(count, now, duration, catchUp);
  }
  tick(now) {
    const position = this.timeline.sample(now).position;
    while (this.queue.length && position >= this.consumed + 1 - 1e-9) {
      const item = this.queue.shift();
      this.scene.commit(item.change, item.reverse);
      this.consumed++;
    }
    if (this.queue.length) {
      const item = this.queue[0];
      this.scene.transition(item.change, item.reverse, Math.max(0, Math.min(1, position - this.consumed)));
    }
  }
};
function PicoWorldCardImpl(props) {
  const host = useRef(null);
  const player = useRef(null);
  const axes = useRef(null);
  const latest = useRef(props);
  latest.current = props;
  const [hover, setHover] = useState({ x: 0, y: 0, z: 0 });
  const [error, setError] = useState(null);
  useEffect(() => {
    let scene;
    try {
      scene = new WorldScene(host.current, (position) => {
        if (position) setHover(position);
        latest.current.onHoverCell?.(position);
      });
    } catch (error2) {
      setError(error2 instanceof Error ? error2.message : String(error2));
      return;
    }
    const controller = new Player(scene);
    const indicator = new OrientationIndicator(axes.current);
    player.current = controller;
    let frame = 0;
    const render = (now) => {
      controller.tick(now);
      scene.render();
      indicator.update(scene.camera, host.current);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      player.current = null;
      scene.dispose();
    };
  }, []);
  useEffect(() => {
    try {
      player.current?.update(props, performance.now());
    } catch (error2) {
      setError(error2 instanceof Error ? error2.message : String(error2));
    }
  }, [props.history, props.position, props.transition, props.animation]);
  return /* @__PURE__ */ jsxs("section", { "aria-label": "Pico World", className: `pico-world-card ${props.surface === "flush" ? "" : "pico-card"} ${props.className ?? ""}`, children: [
    /* @__PURE__ */ jsx("style", { children: card_default }),
    /* @__PURE__ */ jsx("div", { ref: host, className: "pico-world-card__canvas" }),
    /* @__PURE__ */ jsx("button", { type: "button", className: "pico-world-card__axis-gizmo", "aria-label": "\u56DE\u5230\u4E16\u754C\u539F\u70B9", onClick: () => player.current?.scene.resetOrigin(), children: /* @__PURE__ */ jsx("svg", { ref: axes, viewBox: "0 0 96 96", "aria-hidden": "true", children: ["x", "y", "z"].map((axis) => /* @__PURE__ */ jsxs("g", { "data-axis": axis, className: `pico-world-axis--${axis}`, children: [
      /* @__PURE__ */ jsx("path", { "data-line": true, className: "pico-world-axis" }),
      /* @__PURE__ */ jsx("path", { "data-head": true, className: "pico-world-axis" }),
      /* @__PURE__ */ jsx("text", { className: "pico-world-axis-label", textAnchor: "middle", dominantBaseline: "central", children: axis })
    ] }, axis)) }) }),
    /* @__PURE__ */ jsxs("span", { className: "pico-world-card__coordinates", children: [
      "(",
      hover.x,
      ", ",
      hover.y,
      ")"
    ] }),
    error && /* @__PURE__ */ jsxs("div", { role: "alert", className: "pico-world-card__error", children: [
      "\u4E09\u7EF4\u4E16\u754C\u6682\u65F6\u65E0\u6CD5\u663E\u793A\uFF1A",
      error
    ] })
  ] });
}

// src/libs/picoworld/python/picoworld/__init__.py
var init_default = '"""PicoWorld\uFF1A\u901A\u8FC7\u79BB\u6563 Python \u64CD\u4F5C\u6539\u53D8\u7684\u4E09\u7EF4\u6C99\u76D8\uFF0C\u4E16\u754C\u72B6\u6001\u3001\u7269\u7406\u7ED3\u7B97\u548C\u64CD\u4F5C\u65E5\u5FD7\u5168\u90E8\u7531 Python \u7EF4\u62A4\u3002\n\n\u5206\u5C42\uFF1AVoxel \u63CF\u8FF0\u4E00\u4E2A\u4F53\u7D20\uFF0CStructure \u63CF\u8FF0\u76F8\u5BF9\u5750\u6807\u4E0B\u7684\u591A\u4F53\u7D20\u7ED3\u6784\uFF0C\nPicoWorld \u7BA1\u7406\u72EC\u7ACB\u4E16\u754C\u3002export() \u8FD4\u56DE\u7ED1\u5B9A\u5F53\u524D\u5B9E\u4F8B\u7684 lambda \u5B57\u5178\uFF0C\u5916\u5C42\u901A\u8FC7\nglobals().update(w.export()) \u6CE8\u5165\u5B66\u751F\u51FD\u6570\uFF1B\u5185\u90E8\u63A5\u53E3\u4E0D\u4F9D\u8D56\u5168\u5C40\u5355\u4F8B\u3001\u7F16\u8F91\u5668\u3001\u6E32\u67D3\u5668\u6216\u771F\u5B9E\u65F6\u95F4\u3002\n\n\u4E16\u754C\u4F7F\u7528\u6574\u6570\u7F51\u683C\uFF0Cx\u3001y \u4E3A\u6C34\u5E73\u5750\u6807\uFF0Cz \u5411\u4E0A\u3002\u521D\u59CB\u5730\u8868\u9AD8\u5EA6\u4E3A 0\uFF0Cz < 0\n\u9ED8\u8BA4\u662F soil\uFF0Cz >= 0 \u9ED8\u8BA4\u662F\u7A7A\u6C14\u3002\u4E16\u754C\u65E0\u9650\u5EF6\u4F38\uFF0C\u4F7F\u7528\u6709\u9650\u7684\u7A00\u758F\u4FEE\u6539\u8868\u793A\u3002\n\u7ED3\u6784\u53EF\u4EE5\u6709\u591A\u683C\u5360\u5730\u3001\u7A7A\u9699\u548C\u60AC\u6311\uFF0C\u4E0D\u9650\u5236\u4E3A\u9AD8\u5EA6\u56FE\uFF1B\u4E0D\u6A21\u62DF\u8FDE\u7EED\u521A\u4F53\u7269\u7406\u3002\n\n\u6BCF\u4E2A\u4FEE\u6539\u64CD\u4F5C\u539F\u5B50\u5730\u5B8C\u6210\uFF0C\u4ECE\u4E00\u4E2A\u7A33\u5B9A\u72B6\u6001\u5230\u53E6\u4E00\u4E2A\u7A33\u5B9A\u72B6\u6001\u3002\u64CD\u4F5C\u5931\u8D25\u4E0D\u6539\u53D8\n\u4E16\u754C\u3002\u540C\u6837\u7684\u521D\u59CB\u72B6\u6001\u548C\u64CD\u4F5C\u5E8F\u5217\u4EA7\u751F\u540C\u6837\u7684\u7ED3\u679C\uFF0C\u4E0D\u4F9D\u8D56\u5E27\u7387\u3001\u65F6\u949F\u6216\u968F\u673A\u6570\u3002\n\u91CD\u529B\u3001\u6392\u6C34\u7B49\u89C4\u5219\u5728\u64CD\u4F5C\u8FD4\u56DE\u524D\u7ED3\u7B97\uFF1B\u6E32\u67D3\u52A8\u753B\u4E0D\u5C5E\u4E8E\u4E16\u754C\u72B6\u6001\u3002\n\nrain \u662F\u4E00\u6B21\u65E0\u9650\u4F9B\u6C34\u7684\u7ED3\u7B97\uFF1A\u586B\u6EE1\u6709\u56F4\u6321\u7684\u6D3C\u5730\uFF0C\u6C34\u4F4D\u7531\u6EA2\u51FA\u53E3\u51B3\u5B9A\u3002\n\u65E0\u7A77\u8FDC\u5904\u5F00\u653E\u6392\u6C34\uFF0C\u539F\u59CB\u5E73\u5730\u4E0D\u4F1A\u79EF\u6C34\u3002\u4E0D\u662F\u6307\u5B9A\u6C34\u91CF\uFF0C\u4E5F\u4E0D\u662F\u5F00\u59CB\u6301\u7EED\u964D\u96E8\u3002\n\u968F\u540E\u6539\u52A8\u5730\u5F62\u65F6\u91CD\u65B0\u7ED3\u7B97\u5DF2\u6709\u6C34\u7684\u6392\u6C34\uFF0C\u4E0D\u81EA\u52A8\u8865\u5145\u65B0\u7684\u96E8\u6C34\u3002\n\n\u4E16\u754C\u53EA\u63CF\u8FF0\u9759\u6001\u5EFA\u9020\u7ED3\u679C\uFF1B\u5B66\u751F\u7A0B\u5E8F\u81EA\u7136\u7ED3\u675F\u540E\u5373\u53EF\u67E5\u770B\uFF0C\u4E0D\u9700\u8981\u542F\u52A8\u547D\u4EE4\u6216\u8FD0\u884C\u6A21\u5F0F\u3002\n\nWorldChange \u662F\u53EF JSON \u5E8F\u5217\u5316\u3001\u53EF\u9006\u7684\u539F\u5B50\u53D8\u5316\uFF0C\u4E0E index.tsx \u4E2D\u7C7B\u578B\u540C\u5F62\u3002\n\u6BCF\u6B21\u64CD\u4F5C\u901A\u8FC7\u5199\u5165\u65E5\u5FD7\u8BB0\u5F55\u5B9E\u9645\u6539\u53D8\u683C\u5B50\u7684 before/after\uFF0C\u4E0D\u6BD4\u8F83\u5B8C\u6574\u4E16\u754C\u526F\u672C\u3002trace \u4FDD\u5B58\u4E00\u6B21\u5171\u4EAB\u589E\u91CF\u65E5\u5FD7\uFF0C\u6BCF\u4E2A\u7A0B\u5E8F\u843D\u70B9\u53EA\u4FDD\u5B58\u65E5\u5FD7\u6E38\u6807\u3002\n\u7A7A\u95F4\u4E3A O(\u53D8\u5316\u8BB0\u5F55\u6570 + \u5B9E\u9645\u683C\u5B50\u53D8\u66F4\u603B\u6570)\uFF0C\u4E0D\u9010\u6B65\u4FDD\u5B58\u5B8C\u6574\u4E16\u754C\u6216\u7D2F\u8BA1\u65E5\u5FD7\u526F\u672C\u3002\n\u67E5\u8BE2\u548C export \u4E0D\u4EA7\u751F\u53D8\u5316\u3002changes \u662F\u53EA\u8BFB\u3001\u53EA\u8FFD\u52A0\u7684\u65E5\u5FD7\uFF0C\u8FD0\u884C\u5668\u81EA\u52A8\u8BB0\u5F55\u5176\u957F\u5EA6\uFF0C\n\u6267\u884C\u7ED3\u675F\u540E\u4E00\u6B21\u6027\u5E8F\u5217\u5316\uFF1B\u6B63\u5E38\u7EC8\u6B62\u3001\u5F02\u5E38\u3001\u7B49\u5F85\u8F93\u5165\u548C\u8D85\u9650\u5747\u4FDD\u7559\u5DF2\u7ECF\u63D0\u4EA4\u7684\u64CD\u4F5C\u3002\n\u4E0D\u63D0\u4F9B drain_changes\uFF0C\u4E5F\u4E0D\u8981\u6C42\u5B66\u751F\u6216\u9875\u9762\u624B\u52A8\u6536\u96C6\u3002\n"""\n\nfrom dataclasses import dataclass\nfrom typing import Callable, NotRequired, TypedDict\nfrom collections.abc import Sequence\nimport sys\n\n\n@dataclass(frozen=True)\nclass Voxel:\n    """\u4E00\u4E2A\u5355\u4F4D\u7ACB\u65B9\u4F53\uFF1B\u5728\u4E16\u754C\u4E2D\u5750\u6807\u4E3A\u7EDD\u5BF9\u5750\u6807\uFF0C\u5728 Structure \u4E2D\u4E3A\u76F8\u5BF9\u5750\u6807\u3002\n\n    material \u662F\u57FA\u7840\u65B9\u5757\u540D\uFF08\u4E0E index.tsx \u7684 BlockType \u4E00\u81F4\uFF09\uFF0C\u4E0D\u63A5\u53D7 water \u6216\u9884\u5236\u9020\u578B\u540D\u3002\n    """\n\n    x: int\n    y: int\n    z: int\n    material: str\n\n\n@dataclass(frozen=True)\nclass Structure:\n    """\u4EE5\u5C40\u90E8\u539F\u70B9\u5B9A\u4F4D\u7684\u975E\u7A7A\u4F53\u7D20\u96C6\u5408\uFF1B\u5750\u6807\u552F\u4E00\uFF0C\u5141\u8BB8\u7A7A\u9699\u548C\u8D1F\u5750\u6807\u3002\n\n    drop \u5C06\u5C40\u90E8\u539F\u70B9\u7684 x\u3001y \u5BF9\u9F50\u76EE\u6807\u683C\uFF0C\u6574\u4F53\u7AD6\u76F4\u4E0B\u964D\u5230\u9996\u6B21\u63A5\u89E6\u652F\u6491\u7684\u4F4D\u7F6E\u3002\n    \u4E0D\u5C06\u5404\u4E2A\u4F53\u7D20\u5206\u522B\u4E0B\u843D\uFF0C\u4E0D\u81EA\u52A8\u65CB\u8F6C\u7ED3\u6784\u3002\n    """\n\n    relative_voxels: tuple[Voxel, ...]\n\n\nclass CellState(TypedDict):\n    """\u5B8C\u6574\u683C\u5B50\u5185\u5BB9\uFF1Bmaterial=None \u8868\u793A\u7A7A\u6C14\uFF0Cwater \u4E0E\u56FA\u4F53\u4E0D\u80FD\u5171\u5B58\u3002\n\n    \u5750\u6807\u7531 CellChange \u5355\u72EC\u643A\u5E26\u3002\n    """\n\n    material: str | None\n    water: bool\n\n\nclass CellChange(TypedDict):\n    """\u540C\u4E00\u5750\u6807\u5728\u64CD\u4F5C\u524D\u540E\u7684\u8986\u76D6\uFF1BNone \u8868\u793A\u9ED8\u8BA4\u4E16\u754C\uFF0C\u4E0D\u662F\u5220\u9664\u56FA\u4F53\u3002\n\n    z < 0 \u7684\u56FA\u4F53\u6D88\u5931\u5FC5\u987B\u5199\u5165\u663E\u5F0F\u7A7A\u6C14\u5185\u5BB9\uFF1Bafter=None \u4F1A\u6062\u590D\u9ED8\u8BA4 soil\u3002\n    z >= 0 \u5220\u9664\u8986\u76D6\u5219\u6062\u590D\u9ED8\u8BA4\u7A7A\u6C14\u3002\u53CD\u5411\u5E94\u7528\u65F6\u4EA4\u6362 before \u4E0E after\u3002\n    """\n\n    x: int\n    y: int\n    z: int\n    before: CellState | None\n    after: CellState | None\n\n\nclass GridPosition(TypedDict):\n    x: int\n    y: int\n    z: int\n\n\nclass ExplodedBlock(GridPosition):\n    material: str\n\n\nclass WorldExplosion(TypedDict):\n    """\u7206\u5FC3\u3001\u534A\u5F84\u53CA\u76F4\u63A5\u70B8\u6389\u7684\u56FA\u4F53\uFF1B\u4E0D\u5305\u542B\u7206\u7834\u540E\u584C\u843D\u6216\u6392\u6C34\u6539\u53D8\u7684\u5176\u4ED6\u683C\u5B50\u3002"""\n\n    center: GridPosition\n    radius: int\n    blocks: list[ExplodedBlock]\n\n\nclass WorldChange(TypedDict):\n    """\u4E00\u6B21\u539F\u5B50\u64CD\u4F5C\u7684\u53EF\u9006\u589E\u91CF\uFF1Bcells \u5750\u6807\u552F\u4E00\u3001\u6309 (x, y, z) \u6392\u5E8F\u3002\n\n    \u53EA\u5305\u542B\u5185\u5BB9\u786E\u5B9E\u53D8\u5316\u7684\u683C\u5B50\uFF1B\u6CA1\u6709\u4EFB\u4F55\u53D8\u5316\u65F6\u4E0D\u53D1\u51FA\n    \u8BB0\u5F55\u3002\u53D8\u66F4\u4E00\u7ECF\u4EA4\u4ED8\u5373\u4E0D\u53EF\u4FEE\u6539\uFF1B\u56DE\u653E\u6309\u8BB0\u5F55\u987A\u5E8F\uFF0C\u5012\u9000\u6309\u8BB0\u5F55\u9006\u5E8F\u3002\n    """\n\n    cells: list[CellChange]\n    explosion: NotRequired[WorldExplosion]\n\n\nclass PicoWorld:\n    """\u72EC\u7ACB\u3001\u786E\u5B9A\u6027\u7684\u4E16\u754C\u3002\u516C\u5F00\u64CD\u4F5C\u6BCF\u6B21\u81EA\u52A8\u63D0\u4EA4\u6700\u591A\u4E00\u6761 WorldChange\u3002\n\n    \u6574\u6570\u53C2\u6570\u4E0D\u63A5\u53D7 bool\uFF0C\u6DF1\u5EA6\u548C\u534A\u5F84\u5FC5\u987B\u4E3A\u6B63\u3002\u5931\u8D25\uFF08\u5305\u62EC\u8FD0\u884C\u8D85\u9650\uFF09\u56DE\u6EDA\u5F53\u524D\n    \u64CD\u4F5C\uFF0C\u5386\u53F2\u5DF2\u5B8C\u6210\u64CD\u4F5C\u4FDD\u7559\u3002\u5171\u4EAB\u9762\u7684\u516D\u90BB\u57DF\u8FDE\u901A\u56FA\u4F53\u89C6\u4F5C\u4E00\u4E2A\u521A\u6027\u7ED3\u6784\uFF1B\u652F\u6491\u79FB\u9664\u540E\uFF0C\u60AC\u7A7A\n    \u8FDE\u901A\u5206\u91CF\u6309\u6700\u4F4E z\u3001\u6700\u5C0F\u5750\u6807\u987A\u5E8F\u6574\u4F53\u4E0B\u843D\uFF0C\u76F4\u5230\u63A5\u89E6\u4E0B\u65B9\u56FA\u4F53\uFF0C\u4E0D\u65CB\u8F6C\u6216\u6EDA\u52A8\u3002\n    """\n\n    def __init__(self) -> None:\n        """\u521B\u5EFA\u65E0\u9650\u5E73\u5730\uFF0C\u81EA\u52A8\u6CE8\u518C\u5230\u5F53\u524D Pico trace\uFF1B\u72EC\u7ACB Python \u4E2D\u4E5F\u53EF\u4F7F\u7528\u3002"""\n        from ._impl import WorldCore\n        self._core = WorldCore()\n        self._runtime = sys.modules.get("_pico_runtime")\n        if self._runtime is not None:\n            self._runtime.register_trace_resource("picoworld", self.changes)\n\n    @property\n    def changes(self) -> Sequence[WorldChange]:\n        """\u5185\u90E8\u53EA\u8BFB\u65E5\u5FD7\uFF1Alen \u4E3A O(1)\uFF0C\u7D22\u5F15\u8BFB\u53D6\u8FD4\u56DE\u72EC\u7ACB\u8BB0\u5F55\uFF0C\u4E0D\u590D\u5236\u7D2F\u8BA1\u5386\u53F2\u3002\n\n        \u8FD0\u884C\u5668\u4FDD\u5B58\u6B64\u5E8F\u5217\u5F15\u7528\u5E76\u81EA\u52A8\u91C7\u6837\u6E38\u6807\uFF1B\u5361\u7247\u6309 before/after \u91CD\u653E\u3002\n        \u4E0D\u5BFC\u51FA\u7ED9\u5B66\u751F\uFF0C\u8BFB\u53D6\u4E0D\u4F1A\u6D88\u8D39\u8BB0\u5F55\u6216\u63A8\u8FDB\u4E16\u754C\u3002\n        """\n        return self._core.changes\n\n    def drop(self, x: int, y: int, structure: Structure) -> None:\n        """\u7ED3\u6784\u4ECE\u4E0A\u65B9\u6574\u4F53\u843D\u5230\u9996\u6B21\u63A5\u89E6\u7684\u4F4D\u7F6E\uFF0C\u968F\u540E\u7ED3\u7B97\u6392\u6C34\uFF1B\u4E0D\u81EA\u52A8\u8865\u5145\u96E8\u6C34\u3002"""\n        self._core.drop(x, y, structure)\n\n    def dig(self, x: int, y: int, depth: int = 1) -> None:\n        """\u4ECE\u6700\u9AD8\u56FA\u4F53\u683C\u5411\u4E0B\u79FB\u9664 depth \u5C42\uFF1B\u8303\u56F4\u5185\u7A7A\u6C14\u8BA1\u5165\u6DF1\u5EA6\u3002"""\n        self._core.dig(x, y, depth)\n\n    def bomb(self, x: int, y: int, radius: int = 2) -> None:\n        """\u4EE5\u76EE\u6807\u5217\u6700\u9AD8\u56FA\u4F53\u683C\u4E3A\u7403\u5FC3\uFF0C\u79FB\u9664\u683C\u4E2D\u5FC3\u8DDD\u79BB <= radius \u7684\u56FA\u4F53\u3002\n\n        \u65E0\u5F15\u4FE1\u6216\u7B49\u5F85\u3002\u7206\u7834\u3001\u65AD\u88C2\u4E0B\u843D\u548C\u6392\u6C34\u5171\u540C\u5F62\u6210\u4E00\u6B21\u539F\u5B50\u53D8\u5316\uFF0C\n        explosion \u8BB0\u5F55\u7206\u5FC3\u548C\u76F4\u63A5\u70B8\u6389\u7684\u56FA\u4F53\uFF0C\u4F9B\u663E\u793A\u7AEF\u56DE\u653E\u98DE\u6563\u7279\u6548\u3002\n        """\n        self._core.bomb(x, y, radius)\n\n    def rain(self) -> None:\n        """\u65E0\u9650\u964D\u96E8\u4E00\u6B21\u7ED3\u7B97\u5230\u6EA2\u6D41\u6C34\u4F4D\uFF1B\u5F00\u653E\u5E73\u5730\u4E0D\u79EF\u6C34\uFF0C\u5C01\u95ED\u7A7A\u8154\u4E0D\u4F1A\u51ED\u7A7A\u8FDB\u6C34\u3002\n\n        \u4FEE\u6539\u5730\u5F62\u540E\u5DF2\u6709\u6C34\u5728\u53EF\u8FDE\u901A\u4F4E\u5904\u91CD\u65B0\u5206\u5E03\uFF0C\u591A\u4F59\u6C34\u6392\u8D70\uFF1B\u6709\u9650\u6C34\u91CF\u65E0\u6CD5\u94FA\u6EE1\n        \u540C\u9AD8\u4E00\u5C42\u65F6\uFF0C\u6309 (z, x, y) \u987A\u5E8F\u5360\u683C\uFF0C\u4FDD\u8BC1\u7ED3\u679C\u786E\u5B9A\u3002\u6C34\u53EA\u901A\u8FC7\u5171\u4EAB\u9762\u8FDE\u901A\u3002\n        """\n        self._core.rain()\n\n    def voxel_at(self, x: int, y: int, z: int) -> Voxel | None:\n        """\u5185\u90E8\u56FA\u4F53\u67E5\u8BE2\uFF1B\u7A7A\u6C14\u548C\u6C34\u8FD4\u56DE None\uFF0C\u4E0D\u5BFC\u51FA\u7ED9\u5B66\u751F\u3002"""\n        return self._core.voxel_at(x, y, z)\n\n    def surface_height(self, x: int, y: int) -> int:\n        """\u5185\u90E8\u67E5\u8BE2\uFF1A\u6700\u9AD8\u56FA\u4F53\u9876\u9762\u7684 z + 1\uFF0C\u9ED8\u8BA4\u5E73\u5730\u4E3A 0\u3002"""\n        return self._core.surface_height(x, y)\n\n    def water_depth(self, x: int, y: int) -> int:\n        """\u5185\u90E8\u67E5\u8BE2\uFF1A\u8BE5\u5217\u6C34\u683C\u603B\u6570\uFF0C\u5206\u5C42\u79EF\u6C34\u4E5F\u8BA1\u5165\u3002"""\n        return self._core.water_depth(x, y)\n\n    def structure(self, item: str) -> Structure:\n        """\u65B9\u5757\u540D\u751F\u6210\u5355\u683C\u7ED3\u6784\uFF1B\u4E0D\u63D0\u4F9B\u9884\u5236\u9020\u578B\uFF0C\u672A\u77E5\u540D\u6216 water \u629B ValueError\u3002"""\n        return self._core.structure(item)\n\n    def export(self) -> dict[str, Callable[..., object]]:\n        """\u4EC5\u5BFC\u51FA\u5B66\u751F\u6784\u5EFA\u51FD\u6570\uFF0C\u53EF\u76F4\u63A5 globals().update(w.export())\u3002\n\n        \u6240\u6709\u503C\u5747\u4E3A lambda\uFF1Bdrop \u89E3\u6790\u65B9\u5757\u540D\uFF0C\u5176\u4F59\u53C2\u6570\u76F4\u63A5\u8F6C\u53D1\u3002\u67E5\u8BE2\u3001\u65E5\u5FD7\u548C\n        \u4F53\u7D20\u7C7B\u578B\u4E0D\u5BFC\u51FA\uFF0C\u4E0D\u6355\u83B7\u64CD\u4F5C\u5F02\u5E38\u3002\n        """\n        return {\n            "drop": lambda x, y, item="soil": self.drop(x, y, self.structure(item)),\n            "dig": lambda *args, **kwargs: self.dig(*args, **kwargs),\n            "bomb": lambda *args, **kwargs: self.bomb(*args, **kwargs),\n            "rain": lambda *args, **kwargs: self.rain(*args, **kwargs),\n        }\n';

// src/libs/picoworld/python/picoworld/_impl.py
var impl_default = `"""Sparse world storage and atomic operations; public contract lives in __init__.py."""
from collections.abc import Sequence
from copy import deepcopy
from functools import lru_cache
import json
from pathlib import Path

from . import Structure, Voxel
from ._water import rebalance_water

_AIR = (None, False)
_SOIL = ('soil', False)
_NEIGHBORS = ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))


def integer(value, name, positive=False):
    if type(value) is not int:
        raise TypeError(f'{name} \u5FC5\u987B\u662F\u6574\u6570')
    if abs(value) > 2**53 - 1 or (positive and value < 1):
        raise ValueError(f'{name} \u8D85\u51FA\u5141\u8BB8\u8303\u56F4')
    return value


def neighbors(point):
    x, y, z = point
    return ((x+dx, y+dy, z+dz) for dx, dy, dz in _NEIGHBORS)


def json_cell(value):
    if value is None:
        return None
    return dict(material=value[0], water=value[1])


@lru_cache(maxsize=1)
def catalog():
    return json.loads(Path(__file__).with_name('assets').joinpath('catalog.json').read_text(encoding='utf-8'))


class ChangeLog(Sequence):
    def __init__(self, records):
        self._records = records

    def __len__(self):
        return len(self._records)

    def __getitem__(self, index):
        return deepcopy(self._records[index])


class WorldCore:
    def __init__(self):
        self.cells = {}
        self.columns = {}
        self.water = set()
        self._records = []
        self.changes = ChangeLog(self._records)
        self._journal = None

    def at(self, point):
        return self.cells.get(point, _SOIL if point[2] < 0 else _AIR)

    def _raw_set(self, point, value):
        column = point[:2]
        if value is None:
            self.cells.pop(point, None)
            if column in self.columns:
                self.columns[column].discard(point[2])
                if not self.columns[column]:
                    del self.columns[column]
        else:
            self.cells[point] = value
            self.columns.setdefault(column, set()).add(point[2])
        if value is not None and value[1]:
            self.water.add(point)
        else:
            self.water.discard(point)

    def set(self, point, value):
        if value == (_SOIL if point[2] < 0 else _AIR):
            value = None
        if self.cells.get(point) == value:
            return
        self._journal.setdefault(point, self.cells.get(point))
        self._raw_set(point, value)

    def atomic(self, action, settle=False, rain=False, explosion=None):
        old_water, old_length = set(self.water), len(self._records)
        self._journal = {}
        try:
            action()
            if settle:
                self._settle()
            if old_water or rain:
                rebalance_water(self, old_water, rain)
            changes = []
            for (x, y, z), before in sorted(self._journal.items()):
                after = self.cells.get((x, y, z))
                if before != after:
                    changes.append(dict(x=x, y=y, z=z, before=json_cell(before), after=json_cell(after)))
            if changes or explosion:
                record = dict(cells=changes)
                if explosion is not None:
                    record['explosion'] = explosion
                self._records.append(record)
        except BaseException:
            for point, value in self._journal.items():
                self._raw_set(point, value)
            del self._records[old_length:]
            raise
        finally:
            self._journal = None

    def structure(self, item):
        if not isinstance(item, str):
            raise TypeError('\u65B9\u5757\u540D\u79F0\u5FC5\u987B\u662F\u5B57\u7B26\u4E32')
        assets = catalog()
        if item in assets['materials'] and item != 'water':
            return Structure((Voxel(0, 0, 0, item),))
        raise ValueError(f'\u672A\u77E5\u65B9\u5757\uFF1A{item}')

    def surface_height(self, x, y):
        integer(x, 'x'); integer(y, 'y')
        top = max([-1, *(z for z in self.columns.get((x, y), ()) if self.at((x, y, z))[0] is not None)])
        while self.at((x, y, top))[0] is None:
            top -= 1
        return top + 1

    def voxel_at(self, x, y, z):
        integer(x, 'x'); integer(y, 'y'); integer(z, 'z')
        material = self.at((x, y, z))[0]
        return None if material is None else Voxel(x, y, z, material)

    def water_depth(self, x, y):
        integer(x, 'x'); integer(y, 'y')
        return sum((x, y, z) in self.water for z in self.columns.get((x, y), ()))

    def drop(self, x, y, structure):
        integer(x, 'x'); integer(y, 'y')
        if not isinstance(structure, Structure) or not structure.relative_voxels:
            raise ValueError('\u7ED3\u6784\u5FC5\u987B\u5305\u542B\u81F3\u5C11\u4E00\u4E2A\u4F53\u7D20')
        footprint, seen = {}, set()
        for voxel in structure.relative_voxels:
            if not isinstance(voxel, Voxel):
                raise TypeError('\u7ED3\u6784\u53EA\u80FD\u5305\u542B Voxel')
            integer(voxel.x, 'voxel.x'); integer(voxel.y, 'voxel.y'); integer(voxel.z, 'voxel.z')
            point = (voxel.x, voxel.y, voxel.z)
            if point in seen:
                raise ValueError('\u7ED3\u6784\u4E2D\u7684\u4F53\u7D20\u5750\u6807\u4E0D\u80FD\u91CD\u590D')
            seen.add(point)
            if voxel.material not in catalog()['materials'] or voxel.material == 'water':
                raise ValueError(f'\u672A\u77E5\u56FA\u4F53\u6750\u8D28\uFF1A{voxel.material}')
            column = (integer(x + voxel.x, 'x'), integer(y + voxel.y, 'y'))
            footprint[column] = min(footprint.get(column, voxel.z), voxel.z)
        offset = max(self.surface_height(*column) - bottom for column, bottom in footprint.items())
        placed = [((x+v.x, y+v.y, integer(offset+v.z, 'z')), (v.material, False)) for v in structure.relative_voxels]
        def apply():
            for point, value in placed:
                self.set(point, value)
        self.atomic(apply)

    def dig(self, x, y, depth):
        integer(x, 'x'); integer(y, 'y'); integer(depth, 'depth', True)
        top = self.surface_height(x, y) - 1
        integer(top - depth + 1, 'z')
        def apply():
            for z in range(top - depth + 1, top + 1):
                if self.at((x, y, z))[0] is not None:
                    self.set((x, y, z), _AIR)
        self.atomic(apply, settle=True)

    def bomb(self, x, y, radius):
        integer(x, 'x'); integer(y, 'y'); integer(radius, 'radius', True)
        center = self.surface_height(x, y) - 1
        for value in (x-radius, x+radius, y-radius, y+radius, center-radius, center+radius):
            integer(value, '\u7206\u7834\u5750\u6807')
        explosion = dict(center=dict(x=x, y=y, z=center), radius=radius, blocks=[])
        def apply():
            for dx in range(-radius, radius+1):
                for dy in range(-radius, radius+1):
                    for dz in range(-radius, radius+1):
                        if dx*dx + dy*dy + dz*dz <= radius*radius:
                            point = (x+dx, y+dy, center+dz)
                            material = self.at(point)[0]
                            if material is not None:
                                explosion['blocks'].append(dict(x=point[0], y=point[1], z=point[2], material=material))
                                self.set(point, _AIR)
        self.atomic(apply, settle=True, explosion=explosion)

    def rain(self):
        self.atomic(lambda: None, rain=True)

    def _below(self, point, ignored):
        x, y, z = point
        top = max([min(-1, z-1), *(height for height in self.columns.get((x, y), ())
            if height < z and (x, y, height) not in ignored and self.at((x, y, height))[0] is not None)])
        while (x, y, top) in ignored or self.at((x, y, top))[0] is None:
            top -= 1
        return top

    def _settle(self):
        # Default underground soil is an infinite anchored component; only overrides need traversal.
        while True:
            remaining = {point for point, cell in self.cells.items() if cell[0] is not None}
            unsupported = []
            while remaining:
                seed = min(remaining)
                remaining.remove(seed)
                component, frontier, anchored = {seed}, [seed], False
                while frontier:
                    for neighbor in neighbors(frontier.pop()):
                        if neighbor not in self.cells and neighbor[2] < 0:
                            anchored = True
                        if neighbor in remaining:
                            remaining.remove(neighbor)
                            component.add(neighbor)
                            frontier.append(neighbor)
                if not anchored:
                    unsupported.append(component)
            moved = False
            for component in sorted(unsupported, key=lambda c: (min(p[2] for p in c), min(c))):
                distance = min(p[2] - self._below(p, component) - 1 for p in component)
                if distance <= 0:
                    continue
                values = [(p, self.at(p)) for p in sorted(component)]
                for point, _ in values:
                    self.set(point, _AIR)
                for (x, y, z), value in values:
                    self.set((x, y, z-distance), value)
                moved = True
            if not moved:
                return
`;

// src/libs/picoworld/python/picoworld/_water.py
var water_default = `"""Discrete flood/escape levels and finite-water redistribution. No display clock."""
from heapq import heappop, heappush

_STEPS = ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))


def neighbors(point):
    x, y, z = point
    return ((x+dx, y+dy, z+dz) for dx, dy, dz in _STEPS)


def domains(world, old_water):
    points = set(world.cells) | old_water
    columns = {}
    for x, y, z in points:
        columns.setdefault((x, y), []).append(z)
    remaining = set(columns)
    regions = []
    while remaining:
        start = min(remaining)
        remaining.remove(start)
        component, frontier = {start}, [start]
        while frontier:
            x, y = frontier.pop()
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    next_column = (x+dx, y+dy)
                    if next_column in remaining:
                        remaining.remove(next_column)
                        component.add(next_column)
                        frontier.append(next_column)
        xs, ys = zip(*component)
        heights = [z for column in component for z in columns[column]]
        region = (min(xs)-1, max(xs)+1, min(ys)-1, max(ys)+1, min(-1, min(heights)), max(1, max(heights)+1))
        index = 0
        while index < len(regions):
            other = regions[index]
            if region[0] <= other[1] and other[0] <= region[1] and region[2] <= other[3] and other[2] <= region[3]:
                region = tuple(min(region[i], other[i]) if i % 2 == 0 else max(region[i], other[i]) for i in range(6))
                regions.pop(index)
                index = 0
            else:
                index += 1
        regions.append(region)
    yield from sorted(regions)


def escape_levels(world, bounds):
    x0, x1, y0, y1, z0, z1 = bounds
    air, levels, heap = set(), {}, []
    for x in range(x0, x1+1):
        for y in range(y0, y1+1):
            for z in range(z0, z1+1):
                point = (x, y, z)
                if world.at(point)[0] is not None:
                    continue
                air.add(point)
                if x in (x0, x1) or y in (y0, y1) or z == z1:
                    levels[point] = z
                    heappush(heap, (z, point))
    while heap:
        level, point = heappop(heap)
        if levels[point] != level:
            continue
        for neighbor in neighbors(point):
            if neighbor not in air:
                continue
            next_level = max(level, neighbor[2])
            if next_level < levels.get(neighbor, float('inf')):
                levels[neighbor] = next_level
                heappush(heap, (next_level, neighbor))
    return air, levels


def retained_water(air, levels, sources):
    remaining, pools = set(sources), []
    while remaining:
        seed = min(remaining)
        remaining.remove(seed)
        group, frontier = {seed}, [seed]
        while frontier:
            for neighbor in neighbors(frontier.pop()):
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    group.add(neighbor)
                    frontier.append(neighbor)
        ceiling = max(p[2] for p in group) + 1
        reached = {p for source in group for p in (source, *neighbors(source)) if p in air and p[2] < ceiling}
        frontier = list(reached)
        while frontier:
            for neighbor in neighbors(frontier.pop()):
                if neighbor in air and neighbor not in reached and neighbor[2] < ceiling:
                    reached.add(neighbor)
                    frontier.append(neighbor)
        candidates = {p for p in reached if p[2] < levels.get(p, ceiling)}
        volume = len(group)
        # Pools communicating below their previous waterline share their available capacity.
        index = 0
        while index < len(pools):
            other_reached, other_candidates, other_volume = pools[index]
            if reached & other_reached:
                reached |= other_reached
                candidates |= other_candidates
                volume += other_volume
                pools.pop(index)
                index = 0
            else:
                index += 1
        pools.append((reached, candidates, volume))
    result = set()
    for _, candidates, volume in pools:
        result.update(sorted(candidates, key=lambda p: (p[2], p[0], p[1]))[:volume])
    return result


def rebalance_water(world, old_water, rain):
    filled = set()
    for bounds in domains(world, old_water):
        air, levels = escape_levels(world, bounds)
        x0, x1, y0, y1, z0, z1 = bounds
        sources = {p for p in old_water if x0 <= p[0] <= x1 and y0 <= p[1] <= y1 and z0 <= p[2] <= z1}
        filled.update(retained_water(air, levels, sources))
        if rain:
            filled.update(p for p, level in levels.items() if p[2] < level)
    for point in sorted(world.water - filled):
        material, _ = world.at(point)
        world.set(point, (material, False))
    for point in sorted(filled - world.water):
        world.set(point, (None, True))
`;

// src/libs/picoworld/impl/program.ts
var files = Object.freeze({
  "picoworld/__init__.py": init_default,
  "picoworld/_impl.py": impl_default,
  "picoworld/_water.py": water_default,
  "picoworld/assets/catalog.json": JSON.stringify(catalog_default)
});
function picoWorldProgramImpl(source) {
  return {
    source,
    files,
    prelude: "from picoworld import PicoWorld as __PicoWorld\n__world = __PicoWorld()\nglobals().update(__world.export())\n",
    trigger: "manual",
    options: {
      trace: { events: ["stmt", "call", "return"], observe: { globals: true, locals: true } },
      timeoutMs: 1e4,
      maxTraceSteps: 2e4
    }
  };
}
var histories = /* @__PURE__ */ new WeakMap();
function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function cell(value) {
  return value === null || record(value) && (value.material === null || typeof value.material === "string" && value.material !== "water" && Object.hasOwn(catalog_default.materials, value.material)) && typeof value.water === "boolean" && !(value.material !== null && value.water);
}
function gridPosition(value) {
  return record(value) && [value.x, value.y, value.z].every(Number.isSafeInteger);
}
function explosion(value) {
  return record(value) && gridPosition(value.center) && Number.isSafeInteger(value.radius) && value.radius > 0 && Array.isArray(value.blocks) && value.blocks.length > 0 && value.blocks.every((block) => record(block) && gridPosition(block) && typeof block.material === "string" && block.material !== "water" && Object.hasOwn(catalog_default.materials, block.material));
}
function worldChange(value) {
  return record(value) && (value.explosion === void 0 || explosion(value.explosion)) && Array.isArray(value.cells) && value.cells.every((entry) => record(entry) && [entry.x, entry.y, entry.z].every(Number.isSafeInteger) && cell(entry.before) && cell(entry.after));
}
function picoWorldHistoryImpl(trace, resource) {
  let cache = histories.get(trace);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    histories.set(trace, cache);
  }
  const cached = cache.get(resource);
  if (cached) return cached;
  const records = trace.resources[resource] ?? [];
  if (!records.every(worldChange)) throw new TypeError(`\u65E0\u6548\u7684 PicoWorld \u8D44\u6E90\u65E5\u5FD7\uFF1A${resource}`);
  const history = Object.freeze({
    length: records.length,
    at(index) {
      if (!Number.isInteger(index) || index < 0 || index >= records.length) throw new RangeError("PicoWorld history index out of range");
      return records[index];
    }
  });
  cache.set(resource, history);
  return history;
}
function picoWorldPositionImpl(state, resource) {
  return state.resources?.[resource] ?? 0;
}

// src/libs/picoworld/index.tsx
import { jsx as jsx2 } from "./libs/react.js";
function PicoWorldCard(props) {
  return /* @__PURE__ */ jsx2(PicoWorldCardImpl, { ...props });
}
function picoWorldProgram(source) {
  return picoWorldProgramImpl(source);
}
function picoWorldHistory(trace, resource = "picoworld") {
  return picoWorldHistoryImpl(trace, resource);
}
function picoWorldPosition(state, resource = "picoworld") {
  return picoWorldPositionImpl(state, resource);
}
export {
  PicoWorldCard,
  picoWorldHistory,
  picoWorldPosition,
  picoWorldProgram
};
