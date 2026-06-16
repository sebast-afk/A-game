import * as THREE from 'three';

const COLORS = [
  0xe63946, 0xf4a261, 0x2dc653, 0x457b9d, 0xa8dadc,
  0xffbe0b, 0xfb5607, 0xff006e, 0x8338ec, 0x3a86ff,
];

// ─── Helper: create a platform mesh ──────────────────────────────────────────

function makePlatform(w, h, d, color) {
  const mat  = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  mesh.userData.collidable = true;
  return mesh;
}

export class Obby {
  constructor(scene, player, input, camera, hudStats, gameUI) {
    this.scene    = scene;
    this.player   = player;
    this.input    = input;
    this.camera   = camera;
    this.hudStats = hudStats;
    this.gameUI   = gameUI;

    this.collidables  = [];
    this.checkpoints  = [];
    this.currentStage = 1;
    this._wonGame     = false;

    // Moving platform data
    this._movingPlatforms   = [];
    this._rotatingPlatforms = [];
    this._disappearing      = [];
    this._shrinking         = [];

    this._buildWorld();

    // Set player spawn
    player.setSpawn(0, 1, 0);
    player.position.set(0, 4, 0);
    player.velocity.set(0, 0, 0);
  }

  // ─── World Construction ───────────────────────────────────────────────────

  _buildWorld() {
    const scene = this.scene;

    // Ground (void lava)
    const lavaTex = new THREE.MeshLambertMaterial({ color: 0xff3300, emissive: 0x441100 });
    const lavaGround = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), lavaTex);
    lavaGround.rotation.x = -Math.PI / 2;
    lavaGround.position.y = -5;
    scene.add(lavaGround);

    // ── Start platform ────────────────────────────────────────────────────
    const start = makePlatform(10, 1, 10, 0x4caf50);
    start.position.set(0, 0, 0);
    scene.add(start);
    this.collidables.push(start);

    let z = 8;   // current Z offset for next platform
    let y = 0.5; // current landing height

    // ── Group 1: Static easy (platforms 1–5) ─────────────────────────────
    for (let i = 0; i < 5; i++) {
      const w = 3 + Math.random();
      z += 4 + i * 0.4;
      y += 0.5;
      const p = makePlatform(w, 0.5, 3, COLORS[i % COLORS.length]);
      p.position.set((i % 2 === 0 ? 1.5 : -1.5), y, z);
      scene.add(p);
      this.collidables.push(p);
    }

    // Checkpoint 1
    z += 5; y += 0.5;
    const cp1 = this._makeCheckpoint(z, y);
    scene.add(cp1);
    this.collidables.push(cp1);
    this.checkpoints.push({ mesh: cp1, stage: 1, x: 0, y, z });

    // ── Group 2: Moving left/right (platforms 6–10) ───────────────────────
    for (let i = 0; i < 5; i++) {
      z += 5 + i * 0.3;
      y += 0.4;
      const p = makePlatform(3, 0.5, 3, COLORS[(i + 3) % COLORS.length]);
      p.position.set(0, y, z);
      const range   = 3 + i;
      const speed   = 1.5 + i * 0.3;
      const startX  = p.position.x;
      p.userData.velocity  = new THREE.Vector3();
      p.userData.moveRange = range;
      p.userData.moveDir   = 1;
      p.userData.moveSpeed = speed;
      p.userData.startX    = startX;
      p.userData.startZ    = z;
      p.userData.moveAxis  = 'x';
      scene.add(p);
      this.collidables.push(p);
      this._movingPlatforms.push(p);
    }

    // Checkpoint 2
    z += 6; y += 0.5;
    const cp2 = this._makeCheckpoint(z, y);
    scene.add(cp2);
    this.collidables.push(cp2);
    this.checkpoints.push({ mesh: cp2, stage: 2, x: 0, y, z });

    // ── Group 3: Rotating discs (platforms 11–15) ─────────────────────────
    for (let i = 0; i < 5; i++) {
      z += 5;
      y += 0.3;
      const p = makePlatform(4, 0.4, 1.2, COLORS[(i + 5) % COLORS.length]);
      p.position.set(0, y, z);
      p.userData.rotateY = 0.6 + i * 0.15;
      scene.add(p);
      this.collidables.push(p);
      this._rotatingPlatforms.push(p);
    }

    // Checkpoint 3
    z += 6; y += 0.5;
    const cp3 = this._makeCheckpoint(z, y);
    scene.add(cp3);
    this.collidables.push(cp3);
    this.checkpoints.push({ mesh: cp3, stage: 3, x: 0, y, z });

    // ── Group 4: Disappearing (platforms 16–20) ───────────────────────────
    for (let i = 0; i < 5; i++) {
      z += 4 + i * 0.5;
      y += 0.4;
      const p = makePlatform(3, 0.4, 3, COLORS[(i + 2) % COLORS.length]);
      p.position.set((i % 2 === 0 ? 0 : 2), y, z);
      p.userData.disappear     = true;
      p.userData.disappearPhase= i * 0.7; // stagger
      scene.add(p);
      this.collidables.push(p);
      this._disappearing.push(p);
    }

    // Checkpoint 4
    z += 6; y += 0.5;
    const cp4 = this._makeCheckpoint(z, y);
    scene.add(cp4);
    this.collidables.push(cp4);
    this.checkpoints.push({ mesh: cp4, stage: 4, x: 0, y, z });

    // ── Group 5: Mixed narrow fast (platforms 21–25) ──────────────────────
    for (let i = 0; i < 5; i++) {
      z += 5 + i * 0.5;
      y += 0.6;
      const p = makePlatform(2, 0.4, 2, COLORS[(i + 7) % COLORS.length]);
      p.position.set((i % 3 - 1) * 3, y, z);
      if (i % 2 === 0) {
        p.userData.velocity  = new THREE.Vector3();
        p.userData.moveRange = 4;
        p.userData.moveDir   = 1;
        p.userData.moveSpeed = 3 + i;
        p.userData.startX    = p.position.x;
        p.userData.startZ    = p.position.z;
        p.userData.moveAxis  = 'x';
        this._movingPlatforms.push(p);
      }
      scene.add(p);
      this.collidables.push(p);
    }

    // ── Final platform ────────────────────────────────────────────────────
    z += 8; y += 1;
    const finish = makePlatform(8, 1, 8, 0xffd700);
    finish.position.set(0, y, z);
    finish.material.emissive = new THREE.Color(0x443300);
    scene.add(finish);
    this.collidables.push(finish);
    this._finishPos = new THREE.Vector3(0, y, z);

    // Trophy pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 3, 8),
      new THREE.MeshLambertMaterial({ color: 0xaaaaaa })
    );
    pole.position.set(0, y + 2, z);
    scene.add(pole);

    // Trophy
    const trophy = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0x443300 })
    );
    trophy.position.set(0, y + 4, z);
    trophy.userData.trophy = true;
    this._trophy = trophy;
    scene.add(trophy);

    // Lava sections every ~5 platforms (visual only)
    for (let lz = 8; lz < z; lz += 20) {
      const lava = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 10),
        new THREE.MeshLambertMaterial({ color: 0xff3300, emissive: 0x441100 })
      );
      lava.rotation.x = -Math.PI / 2;
      lava.position.set(0, -0.1, lz);
      scene.add(lava);
    }

    this._totalStages = 5;
    this._updateHUD();
  }

  _makeCheckpoint(z, y) {
    const mesh = makePlatform(5, 1, 5, 0xffd700);
    mesh.position.set(0, y, z);
    mesh.material.emissive = new THREE.Color(0x221100);
    mesh.userData.checkpoint = true;
    return mesh;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt) {
    const elapsed = performance.now() / 1000;

    // Moving platforms
    for (const p of this._movingPlatforms) {
      const speed = p.userData.moveSpeed;
      const range = p.userData.moveRange;
      const axis  = p.userData.moveAxis;
      const startV= axis === 'x' ? p.userData.startX : p.userData.startZ;
      const currV = axis === 'x' ? p.position.x : p.position.z;

      if (currV > startV + range)     p.userData.moveDir = -1;
      else if (currV < startV - range) p.userData.moveDir =  1;

      const delta = p.userData.moveDir * speed * dt;
      if (axis === 'x') {
        p.userData.velocity.set(delta, 0, 0);
        p.position.x += delta;
      } else {
        p.userData.velocity.set(0, 0, delta);
        p.position.z += delta;
      }
      p.updateMatrixWorld(true);
    }

    // Rotating discs
    for (const p of this._rotatingPlatforms) {
      p.rotation.y += p.userData.rotateY * dt;
      p.updateMatrixWorld(true);
    }

    // Disappearing platforms (toggle every 2s, staggered)
    for (const p of this._disappearing) {
      const phase  = p.userData.disappearPhase;
      const period = 2;
      p.visible = Math.floor((elapsed + phase) / period) % 2 === 0;
    }

    // Trophy spin
    if (this._trophy) this._trophy.rotation.y += dt;

    // Player update
    this.player.update(dt, this.input, this.camera, this.collidables);

    // Checkpoint detection
    if (!this._wonGame) {
      for (const cp of this.checkpoints) {
        const d = this.player.position.distanceTo(
          new THREE.Vector3(cp.x, cp.y, cp.z)
        );
        if (d < 4 && this.currentStage <= cp.stage) {
          this.currentStage = cp.stage + 1;
          this.player.setSpawn(cp.x, cp.y, cp.z);
          window.showToast(`Checkpoint ${cp.stage}!`);
          this._updateHUD();
        }
      }

      // Win detection
      if (this._finishPos) {
        const dFin = this.player.position.distanceTo(this._finishPos);
        if (dFin < 5) {
          this._wonGame = true;
          this._showWin();
        }
      }
    }
  }

  _updateHUD() {
    this.hudStats.innerHTML = `
      <div>Stage: <strong>${Math.min(this.currentStage, this._totalStages)} / ${this._totalStages}</strong></div>
      <div style="color:#ffd700">Reach the golden platform!</div>
    `;
  }

  _showWin() {
    const div = document.createElement('div');
    div.className = 'win-overlay';
    div.innerHTML = `
      <h1>You Win! 🏆</h1>
      <p>You completed the Obby!</p>
      <button id="restart-btn">Play Again</button>
    `;
    this.gameUI.appendChild(div);
    this.gameUI.style.pointerEvents = 'all';
    document.getElementById('restart-btn').addEventListener('click', () => {
      div.remove();
      this.gameUI.style.pointerEvents = 'none';
      this._wonGame = false;
      this.currentStage = 1;
      this.player.setSpawn(0, 1, 0);
      this.player.respawn();
      this._updateHUD();
    });
  }

  destroy() {
    // scene cleanup handled by GameManager
  }
}
