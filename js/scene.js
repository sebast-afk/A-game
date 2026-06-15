// One Piece Legends - Three.js Scene Management

class GameScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.characterMeshes = { player: null, enemy: null };
    this.effects = [];
    this.particles = [];
    this.waterMesh = null;
    this.arenaGroup = null;
    this.cameraTarget = { x: 0, y: 1.5, z: 0 };
    this.cameraShake = { intensity: 0, duration: 0 };
    this.cinematicMode = false;
    this.cinematicTimeout = null;
    this.basePlayerPos = new THREE.Vector3(-4, 0, 0);
    this.baseEnemyPos = new THREE.Vector3(4, 0, 0);
    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1628);
    this.scene.fog = new THREE.FogExp2(0x0a2040, 0.04);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 1, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Lighting
    this.setupLighting();

    // Arena
    this.createArena();

    // Resize handler
    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0x203060, 0.6);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xFFEECC, 1.4);
    sun.position.set(5, 12, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    this.scene.add(sun);
    this.sunLight = sun;

    const rimLight = new THREE.DirectionalLight(0x4466FF, 0.8);
    rimLight.position.set(-5, 3, -5);
    this.scene.add(rimLight);

    // Dynamic battle light
    this.battleLight = new THREE.PointLight(0xFF4400, 0, 20);
    this.battleLight.position.set(0, 3, 0);
    this.scene.add(this.battleLight);
  }

  createArena() {
    this.arenaGroup = new THREE.Group();
    this.scene.add(this.arenaGroup);

    // Main platform
    const platformGeo = new THREE.CylinderGeometry(10, 10, 0.4, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1a3a5c,
      roughness: 0.3,
      metalness: 0.2
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.2;
    platform.receiveShadow = true;
    this.arenaGroup.add(platform);

    // Platform edge ring
    const ringGeo = new THREE.TorusGeometry(10, 0.25, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xFFDD44, emissive: 0xAA8800, emissiveIntensity: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1;
    this.arenaGroup.add(ring);

    // Grid lines on platform
    this.createGridLines();

    // Water surrounding the platform
    const waterGeo = new THREE.RingGeometry(10, 80, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0066AA,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = -0.3;
    this.arenaGroup.add(this.waterMesh);

    // Distant ocean
    const farOceanGeo = new THREE.PlaneGeometry(300, 300);
    const farOceanMat = new THREE.MeshStandardMaterial({ color: 0x003366, roughness: 0.2, metalness: 0.5 });
    const farOcean = new THREE.Mesh(farOceanGeo, farOceanMat);
    farOcean.rotation.x = -Math.PI / 2;
    farOcean.position.y = -0.5;
    this.arenaGroup.add(farOcean);

    // Sky dome
    this.createSkyDome();

    // Atmospheric particles (sea spray)
    this.createAmbientParticles();

    // Ships in background
    this.createBackgroundShips();

    // Pillar columns
    this.createPillars();
  }

  createGridLines() {
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3399FF, transparent: true, opacity: 0.3 });
    for (let i = -8; i <= 8; i += 2) {
      const points = [new THREE.Vector3(i, 0.01, -10), new THREE.Vector3(i, 0.01, 10)];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      this.arenaGroup.add(new THREE.Line(geo, lineMat));
    }
    for (let j = -8; j <= 8; j += 2) {
      const points = [new THREE.Vector3(-10, 0.01, j), new THREE.Vector3(10, 0.01, j)];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      this.arenaGroup.add(new THREE.Line(geo, lineMat));
    }
  }

  createSkyDome() {
    const skyGeo = new THREE.SphereGeometry(120, 32, 16);
    skyGeo.scale(-1, 1, -1);
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 64);
    grad.addColorStop(0, '#0a1628');
    grad.addColorStop(0.5, '#1a3a6a');
    grad.addColorStop(1, '#2a5a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
    this.scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 800; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.6;
      const r = 100 + Math.random() * 10;
      starVerts.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5, transparent: true, opacity: 0.8 });
    this.scene.add(new THREE.Points(starGeo, starMat));
  }

  createAmbientParticles() {
    const geo = new THREE.BufferGeometry();
    const verts = [];
    for (let i = 0; i < 200; i++) {
      verts.push((Math.random() - 0.5) * 20, Math.random() * 6, (Math.random() - 0.5) * 20);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const mat = new THREE.PointsMaterial({ color: 0xAADDFF, size: 0.06, transparent: true, opacity: 0.6 });
    this.ambientParticles = new THREE.Points(geo, mat);
    this.scene.add(this.ambientParticles);
  }

  createBackgroundShips() {
    const shipColor = 0x3a2800;
    const positions = [[-30, 0, -50], [35, 0, -55], [-45, 0, -40]];
    positions.forEach(([x, y, z]) => {
      const ship = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 20), new THREE.MeshStandardMaterial({ color: shipColor }));
      hull.position.y = 0;
      ship.add(hull);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 12, 8), new THREE.MeshStandardMaterial({ color: 0x5a3800 }));
      mast.position.y = 7.5;
      ship.add(mast);
      ship.position.set(x, -1, z);
      ship.rotation.y = Math.random() * Math.PI;
      this.scene.add(ship);
    });
  }

  createPillars() {
    const positions = [[-9, 0, -3], [9, 0, -3], [-7, 0, 7], [7, 0, 7]];
    positions.forEach(([x, y, z]) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 5, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a4a6a, roughness: 0.8 })
      );
      pillar.position.set(x, 2.3, z);
      pillar.castShadow = true;
      this.arenaGroup.add(pillar);
      // Glowing top
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x4488FF, emissive: 0x2244AA, emissiveIntensity: 1 })
      );
      top.position.set(x, 5, z);
      this.arenaGroup.add(top);
    });
  }

  buildCharacterMesh(charId) {
    const char = CHARACTERS[charId];
    if (!char) return new THREE.Group();
    const group = new THREE.Group();
    const color = char.color;
    const skinColor = 0xF4C896;

    // Character-specific models
    switch (charId) {
      case 'luffy': this.buildLuffy(group, skinColor); break;
      case 'zoro': this.buildZoro(group, skinColor); break;
      case 'sanji': this.buildSanji(group, skinColor); break;
      case 'law': this.buildLaw(group, skinColor); break;
      case 'nami': this.buildNami(group, skinColor); break;
      case 'usopp': this.buildUsopp(group, skinColor); break;
      default: this.buildDefault(group, color, skinColor);
    }

    return group;
  }

  buildLuffy(group, skin) {
    // Legs
    const legMat = new THREE.MeshToonMaterial({ color: 0x224488 });
    [-0.22, 0.22].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.9, 8), legMat);
      leg.position.set(x, 0.45, 0);
      group.add(leg);
    });
    // Body/vest
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.9, 8), new THREE.MeshToonMaterial({ color: 0xFF3333 }));
    body.position.set(0, 1.2, 0);
    group.add(body);
    // Arms
    const armMat = new THREE.MeshToonMaterial({ color: skin });
    [-0.6, 0.6].forEach(x => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.8, 6), armMat);
      arm.position.set(x, 1.15, 0);
      arm.rotation.z = x > 0 ? -0.4 : 0.4;
      group.add(arm);
    });
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshToonMaterial({ color: skin }));
    head.position.set(0, 1.95, 0);
    group.add(head);
    // Scar under eye
    const scar = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), new THREE.MeshToonMaterial({ color: 0xCC0000 }));
    scar.position.set(0.18, 1.92, 0.32);
    scar.scale.set(1, 0.3, 0.5);
    group.add(scar);
    // Straw hat
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.06, 16), new THREE.MeshToonMaterial({ color: 0xD4A84B }));
    hatBrim.position.set(0, 2.28, 0);
    group.add(hatBrim);
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.28, 12), new THREE.MeshToonMaterial({ color: 0xD4A84B }));
    hatTop.position.set(0, 2.42, 0);
    group.add(hatTop);
    // Hat band
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 6, 16), new THREE.MeshToonMaterial({ color: 0xCC3300 }));
    band.position.set(0, 2.3, 0);
    band.rotation.x = Math.PI / 2;
    group.add(band);
    group.userData.idleY = 0;
  }

  buildZoro(group, skin) {
    // Legs
    const legMat = new THREE.MeshToonMaterial({ color: 0x333333 });
    [-0.22, 0.22].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.9, 8), legMat);
      leg.position.set(x, 0.45, 0);
      group.add(leg);
    });
    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.9, 8), new THREE.MeshToonMaterial({ color: 0xEEEECC }));
    body.position.set(0, 1.2, 0);
    group.add(body);
    // Sash (green)
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.2), new THREE.MeshToonMaterial({ color: 0x22AA22 }));
    sash.position.set(0, 0.95, 0.22);
    group.add(sash);
    // Arms
    const armMat = new THREE.MeshToonMaterial({ color: skin });
    [-0.62, 0.62].forEach(x => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.8, 6), armMat);
      arm.position.set(x, 1.18, 0);
      arm.rotation.z = x > 0 ? -0.35 : 0.35;
      group.add(arm);
    });
    // Swords (3) - right hand, left hand, mouth
    const swordMat = new THREE.MeshToonMaterial({ color: 0xCCCCCC, metalness: 0.8 });
    const guardMat = new THREE.MeshToonMaterial({ color: 0xAA8800 });
    [{ pos: [0.75, 1.1, 0], rot: [0, 0, -0.3] },
     { pos: [-0.75, 1.1, 0], rot: [0, 0, 0.3] },
     { pos: [0, 2.05, 0.15], rot: [0.2, 0, 0] }].forEach(({ pos, rot }) => {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.04), swordMat);
      blade.position.set(...pos);
      blade.rotation.set(...rot);
      group.add(blade);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.08), guardMat);
      guard.position.set(pos[0], pos[1] - 0.38, pos[2]);
      guard.rotation.set(...rot);
      group.add(guard);
    });
    // Head with green hair
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshToonMaterial({ color: skin }));
    head.position.set(0, 1.95, 0);
    group.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshToonMaterial({ color: 0x22BB22 }));
    hair.position.set(0, 2.1, -0.05);
    hair.scale.y = 0.6;
    group.add(hair);
  }

  buildSanji(group, skin) {
    // Legs
    const suitMat = new THREE.MeshToonMaterial({ color: 0x111111 });
    [-0.22, 0.22].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.9, 8), suitMat);
      leg.position.set(x, 0.45, 0);
      group.add(leg);
      // Shoes
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.35), new THREE.MeshToonMaterial({ color: 0x222222 }));
      shoe.position.set(x, 0.06, 0.08);
      group.add(shoe);
    });
    // Body - black suit
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.32, 0.9, 8), suitMat);
    body.position.set(0, 1.2, 0);
    group.add(body);
    // Tie
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.06), new THREE.MeshToonMaterial({ color: 0xCC8800 }));
    tie.position.set(0, 1.15, 0.35);
    group.add(tie);
    // Arms
    [-0.6, 0.6].forEach(x => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.8, 6), suitMat);
      arm.position.set(x, 1.18, 0);
      arm.rotation.z = x > 0 ? -0.35 : 0.35;
      group.add(arm);
    });
    // Head - blonde hair covering one eye
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshToonMaterial({ color: skin }));
    head.position.set(0, 1.96, 0);
    group.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshToonMaterial({ color: 0xDDCC00 }));
    hair.position.set(-0.08, 2.12, 0);
    hair.scale.set(1, 0.55, 0.9);
    group.add(hair);
    // Cigarette
    const cig = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), new THREE.MeshToonMaterial({ color: 0xFFFFEE }));
    cig.position.set(0.12, 1.93, 0.35);
    cig.rotation.z = 0.3;
    group.add(cig);
  }

  buildLaw(group, skin) {
    const pantaloonMat = new THREE.MeshToonMaterial({ color: 0x222233 });
    [-0.22, 0.22].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.9, 8), pantaloonMat);
      leg.position.set(x, 0.45, 0);
      group.add(leg);
    });
    // Spotted jacket
    const jacketMat = new THREE.MeshToonMaterial({ color: 0xDDDDDD });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.32, 0.9, 8), jacketMat);
    body.position.set(0, 1.2, 0);
    group.add(body);
    // Spot decorations
    const spotMat = new THREE.MeshToonMaterial({ color: 0x444444 });
    [[0.2, 1.3, 0.35], [-0.2, 1.15, 0.35], [0.1, 1.45, 0.35]].forEach(([x, y, z]) => {
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), spotMat);
      spot.position.set(x, y, z);
      group.add(spot);
    });
    // Arms
    [-0.62, 0.62].forEach(x => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.8, 6), jacketMat);
      arm.position.set(x, 1.18, 0);
      arm.rotation.z = x > 0 ? -0.35 : 0.35;
      group.add(arm);
    });
    // Nodachi sword
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.6, 0.03), new THREE.MeshToonMaterial({ color: 0xDDDDDD }));
    blade.position.set(0.75, 0.95, 0);
    blade.rotation.z = -0.1;
    group.add(blade);
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshToonMaterial({ color: skin }));
    head.position.set(0, 1.96, 0);
    group.add(head);
    // Spotted hat
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 16), new THREE.MeshToonMaterial({ color: 0xDDDDDD }));
    hatBrim.position.set(0, 2.28, 0);
    group.add(hatBrim);
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.36, 12), new THREE.MeshToonMaterial({ color: 0xDDDDDD }));
    hatTop.position.set(0, 2.46, 0);
    group.add(hatTop);
    const spots = [[0.12, 2.44, 0.26], [-0.14, 2.44, 0.22], [0.05, 2.55, 0.2]];
    spots.forEach(([x, y, z]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshToonMaterial({ color: 0x333344 }));
      s.position.set(x, y, z);
      group.add(s);
    });
    // Dark hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), new THREE.MeshToonMaterial({ color: 0x222233 }));
    hair.position.set(0, 1.98, -0.06);
    hair.scale.y = 0.7;
    group.add(hair);
  }

  buildNami(group, skin) {
    const skirtMat = new THREE.MeshToonMaterial({ color: 0xFF4477 });
    const legMat = new THREE.MeshToonMaterial({ color: skin });
    [-0.2, 0.2].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.7, 8), legMat);
      leg.position.set(x, 0.35, 0);
      group.add(leg);
    });
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.4, 8), skirtMat);
    skirt.position.set(0, 0.75, 0);
    group.add(skirt);
    // Top/shirt
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.33, 0.7, 8), new THREE.MeshToonMaterial({ color: 0xFFAA00 }));
    top.position.set(0, 1.25, 0);
    group.add(top);
    // Arms
    [-0.58, 0.58].forEach(x => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.7, 6), new THREE.MeshToonMaterial({ color: skin }));
      arm.position.set(x, 1.15, 0);
      arm.rotation.z = x > 0 ? -0.4 : 0.4;
      group.add(arm);
    });
    // Clima-Tact staff
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), new THREE.MeshToonMaterial({ color: 0xDDAA00, metalness: 0.6 }));
    staff.position.set(0.68, 1.1, 0);
    staff.rotation.z = -0.15;
    group.add(staff);
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.37, 12, 12), new THREE.MeshToonMaterial({ color: skin }));
    head.position.set(0, 1.95, 0);
    group.add(head);
    // Orange hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshToonMaterial({ color: 0xFF6600 }));
    hair.position.set(0, 2.12, -0.04);
    hair.scale.set(1.05, 0.6, 1);
    group.add(hair);
    const sideHair = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshToonMaterial({ color: 0xFF6600 }));
    sideHair.position.set(-0.3, 1.85, 0.15);
    group.add(sideHair);
  }

  buildUsopp(group, skin) {
    const pantaloonMat = new THREE.MeshToonMaterial({ color: 0x446622 });
    [-0.22, 0.22].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.9, 8), pantaloonMat);
      leg.position.set(x, 0.45, 0);
      group.add(leg);
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.32, 0.9, 8), new THREE.MeshToonMaterial({ color: 0x884400 }));
    body.position.set(0, 1.2, 0);
    group.add(body);
    [-0.62, 0.62].forEach(x => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.8, 6), new THREE.MeshToonMaterial({ color: skin }));
      arm.position.set(x, 1.18, 0);
      arm.rotation.z = x > 0 ? -0.35 : 0.35;
      group.add(arm);
    });
    // Slingshot (Kabuto)
    const kabuto = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 12, Math.PI), new THREE.MeshToonMaterial({ color: 0x226644 }));
    kabuto.position.set(0.7, 1.55, 0);
    kabuto.rotation.z = Math.PI / 4;
    group.add(kabuto);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshToonMaterial({ color: skin }));
    head.position.set(0, 1.96, 0);
    group.add(head);
    // Long nose!
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 6), new THREE.MeshToonMaterial({ color: skin }));
    nose.position.set(0, 1.92, 0.42);
    nose.rotation.x = Math.PI / 2 - 0.2;
    group.add(nose);
    // Bandana
    const bandana = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.12, 12), new THREE.MeshToonMaterial({ color: 0xCC8800 }));
    bandana.position.set(0, 2.2, 0);
    group.add(bandana);
    // Dark curly hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 8), new THREE.MeshToonMaterial({ color: 0x111111 }));
    hair.position.set(0, 2.28, -0.05);
    hair.scale.y = 0.6;
    group.add(hair);
  }

  buildDefault(group, color, skin) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 1.8, 8), new THREE.MeshToonMaterial({ color }));
    body.position.y = 0.9;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), new THREE.MeshToonMaterial({ color: skin }));
    head.position.y = 2.05;
    group.add(head);
  }

  setPlayerCharacter(charId, isEnemy = false) {
    const key = isEnemy ? 'enemy' : 'player';
    if (this.characterMeshes[key]) {
      this.scene.remove(this.characterMeshes[key]);
    }
    const mesh = this.buildCharacterMesh(charId);
    const basePos = isEnemy ? this.baseEnemyPos.clone() : this.basePlayerPos.clone();
    mesh.position.copy(basePos);
    if (isEnemy) mesh.rotation.y = Math.PI;
    this.scene.add(mesh);
    this.characterMeshes[key] = mesh;
    // Spawn effect
    this.spawnEffect(basePos, isEnemy ? 0xFF4400 : 0x00BBFF, 0.8);
  }

  spawnEffect(position, color, scale = 1) {
    const count = 30;
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      verts[i * 3] = position.x;
      verts[i * 3 + 1] = position.y + 1;
      verts[i * 3 + 2] = position.z;
      velocities.push({
        x: (Math.random() - 0.5) * 4 * scale,
        y: Math.random() * 5 * scale,
        z: (Math.random() - 0.5) * 4 * scale
      });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.15 * scale, transparent: true, opacity: 1 });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
    this.effects.push({ mesh: pts, velocities, life: 1.0, type: 'burst', verts });
  }

  createSlashEffect(position, color, direction = 1) {
    const geo = new THREE.PlaneGeometry(1.8, 0.15);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const slash = new THREE.Mesh(geo, mat);
    slash.position.copy(position);
    slash.position.y += 1.2;
    slash.rotation.z = direction * (Math.random() * 0.4 - 0.2) + (direction > 0 ? -0.3 : 0.3);
    this.scene.add(slash);
    this.effects.push({ mesh: slash, life: 1.0, type: 'slash', speed: 3 });
  }

  createImpactEffect(position, color, scale = 1) {
    // Radial burst
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const geo = new THREE.PlaneGeometry(0.5 * scale, 0.08 * scale);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, side: THREE.DoubleSide });
      const ray = new THREE.Mesh(geo, mat);
      ray.position.copy(position);
      ray.position.y += 1.0;
      ray.rotation.z = angle;
      this.scene.add(ray);
      this.effects.push({ mesh: ray, life: 1.0, type: 'ray', vx: Math.cos(angle) * 0.05 * scale, vy: Math.sin(angle) * 0.05 * scale });
    }
    // Flash sphere
    const flashGeo = new THREE.SphereGeometry(0.5 * scale, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.copy(position);
    flash.position.y += 1;
    this.scene.add(flash);
    this.effects.push({ mesh: flash, life: 1.0, type: 'flash', scale });
    // Camera shake
    this.cameraShake.intensity = 0.3 * scale;
    this.cameraShake.duration = 0.4;
  }

  createBeamEffect(fromPos, toPos, color) {
    const dir = new THREE.Vector3().subVectors(toPos, fromPos);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(0.08, 0.08, len, 6);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
    const beam = new THREE.Mesh(geo, mat);
    const mid = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
    beam.position.copy(mid);
    beam.position.y += 1.2;
    beam.lookAt(toPos.clone().add(new THREE.Vector3(0, 1.2, 0)));
    beam.rotateX(Math.PI / 2);
    this.scene.add(beam);
    this.effects.push({ mesh: beam, life: 1.0, type: 'beam' });
  }

  createUltimateEffect(position, color) {
    // Multiple expanding rings
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(0.5 + i * 0.3, 0.06, 6, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(position);
      ring.position.y += 1;
      ring.rotation.x = Math.PI / 2;
      this.scene.add(ring);
      this.effects.push({ mesh: ring, life: 1.0, type: 'ring', delay: i * 0.15, scale: 1 + i * 0.5 });
    }
    // Large central flash
    this.createImpactEffect(position, color, 2.5);
    // Pillar of light
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.6, 10, 8);
    const pillarMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.copy(position);
    pillar.position.y += 5;
    this.scene.add(pillar);
    this.effects.push({ mesh: pillar, life: 1.0, type: 'pillar' });

    this.cameraShake.intensity = 0.8;
    this.cameraShake.duration = 0.8;
  }

  createGrandRushEffect() {
    this.cameraShake.intensity = 1.5;
    this.cameraShake.duration = 2.0;
    // Full arena glow
    this.battleLight.intensity = 5;
    this.battleLight.color.set(0xFFAA00);
    // Rings from center
    for (let i = 0; i < 6; i++) {
      const ringGeo = new THREE.TorusGeometry(1 + i, 0.1, 6, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xFFCC00, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.5;
      this.scene.add(ring);
      this.effects.push({ mesh: ring, life: 1.0, type: 'grandRushRing', delay: i * 0.1 });
    }
    setTimeout(() => {
      if (this.battleLight) this.battleLight.intensity = 0;
    }, 2000);
  }

  shakeCharacter(isEnemy, intensity = 0.3) {
    const mesh = this.characterMeshes[isEnemy ? 'enemy' : 'player'];
    if (!mesh) return;
    const startX = mesh.position.x;
    const startTime = performance.now();
    const shake = () => {
      const t = (performance.now() - startTime) / 400;
      if (t < 1) {
        mesh.position.x = startX + Math.sin(t * 30) * intensity * (1 - t);
        requestAnimationFrame(shake);
      } else {
        mesh.position.x = startX;
      }
    };
    shake();
  }

  moveCharacterTo(isEnemy, targetX, duration = 0.4) {
    const mesh = this.characterMeshes[isEnemy ? 'enemy' : 'player'];
    if (!mesh) return Promise.resolve();
    return new Promise(resolve => {
      const startX = mesh.position.x;
      const startTime = performance.now();
      const animate = () => {
        const t = Math.min((performance.now() - startTime) / (duration * 1000), 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        mesh.position.x = startX + (targetX - startX) * ease;
        if (t < 1) requestAnimationFrame(animate);
        else resolve();
      };
      animate();
    });
  }

  returnCharacterToBase(isEnemy, duration = 0.5) {
    const mesh = this.characterMeshes[isEnemy ? 'enemy' : 'player'];
    if (!mesh) return;
    const basePos = isEnemy ? this.baseEnemyPos : this.basePlayerPos;
    this.moveCharacterTo(isEnemy, basePos.x, duration);
  }

  startCinematicMode(type) {
    this.cinematicMode = true;
    if (type === 'special') {
      this.camera.position.set(0, 3, 7);
      this.camera.lookAt(0, 1.5, 0);
    } else if (type === 'ultimate') {
      this.camera.position.set(-3, 2, 5);
      this.camera.lookAt(4, 1, 0);
    } else if (type === 'grandRush') {
      this.camera.position.set(0, 8, 3);
      this.camera.lookAt(0, 0, 0);
    }
    if (this.cinematicTimeout) clearTimeout(this.cinematicTimeout);
    const duration = type === 'grandRush' ? 3000 : 1500;
    this.cinematicTimeout = setTimeout(() => {
      this.cinematicMode = false;
    }, duration);
  }

  update(delta) {
    if (!this.scene) return;

    // Animate water
    if (this.waterMesh) {
      this.waterMesh.rotation.z += delta * 0.05;
    }

    // Animate ambient particles
    if (this.ambientParticles) {
      const positions = this.ambientParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += delta * 0.3;
        if (positions[i + 1] > 6) positions[i + 1] = 0;
        positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.003;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Idle character animation
    ['player', 'enemy'].forEach(key => {
      const mesh = this.characterMeshes[key];
      if (mesh) {
        mesh.position.y = Math.sin(Date.now() * 0.002 + (key === 'enemy' ? 1 : 0)) * 0.08;
      }
    });

    // Camera shake
    if (this.cameraShake.duration > 0) {
      this.cameraShake.duration -= delta;
      const s = this.cameraShake.intensity * (this.cameraShake.duration > 0 ? 1 : 0);
      if (!this.cinematicMode) {
        this.camera.position.x += (Math.random() - 0.5) * s * 0.3;
        this.camera.position.y += (Math.random() - 0.5) * s * 0.15;
      }
    } else if (!this.cinematicMode) {
      // Reset camera
      this.camera.position.x += (0 - this.camera.position.x) * 0.05;
      this.camera.position.y += (5 - this.camera.position.y) * 0.05;
      this.camera.position.z += (12 - this.camera.position.z) * 0.05;
      this.camera.lookAt(0, 1.5, 0);
    }

    // Update effects
    this.effects = this.effects.filter(effect => {
      effect.life -= delta * 2;
      if (effect.life <= 0) {
        this.scene.remove(effect.mesh);
        effect.mesh.geometry.dispose();
        if (effect.mesh.material.dispose) effect.mesh.material.dispose();
        return false;
      }

      const t = 1 - effect.life;
      switch (effect.type) {
        case 'burst':
          const pos = effect.mesh.geometry.attributes.position.array;
          for (let i = 0; i < effect.velocities.length; i++) {
            pos[i * 3] = effect.verts[i * 3] + effect.velocities[i].x * t;
            pos[i * 3 + 1] = effect.verts[i * 3 + 1] + effect.velocities[i].y * t - 4.9 * t * t;
            pos[i * 3 + 2] = effect.verts[i * 3 + 2] + effect.velocities[i].z * t;
          }
          effect.mesh.geometry.attributes.position.needsUpdate = true;
          effect.mesh.material.opacity = effect.life;
          break;
        case 'slash':
          effect.mesh.material.opacity = effect.life;
          effect.mesh.position.x += (effect.speed || 2) * delta * (effect.mesh.position.x < 0 ? 1 : -1);
          effect.mesh.scale.x *= 1 + delta * 2;
          break;
        case 'ray':
          effect.mesh.material.opacity = effect.life;
          effect.mesh.position.x += (effect.vx || 0);
          effect.mesh.position.y += (effect.vy || 0);
          break;
        case 'flash':
          effect.mesh.material.opacity = effect.life * 0.8;
          const fs = 1 + t * 2 * (effect.scale || 1);
          effect.mesh.scale.set(fs, fs, fs);
          break;
        case 'beam':
          effect.mesh.material.opacity = effect.life;
          break;
        case 'ring':
          if (!effect.delay || t > effect.delay) {
            effect.mesh.material.opacity = effect.life;
            const rs = 1 + t * (effect.scale || 2);
            effect.mesh.scale.set(rs, rs, rs);
          }
          break;
        case 'grandRushRing':
          if (!effect.delay || t > effect.delay) {
            effect.mesh.material.opacity = effect.life * 0.7;
            const gs = 1 + t * 6;
            effect.mesh.scale.set(gs, gs, gs);
          }
          break;
        case 'pillar':
          effect.mesh.material.opacity = effect.life * 0.5;
          effect.mesh.scale.y = 1 + t * 0.5;
          break;
      }
      return true;
    });

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  clearEffects() {
    this.effects.forEach(e => {
      this.scene.remove(e.mesh);
      e.mesh.geometry.dispose();
    });
    this.effects = [];
  }
}
