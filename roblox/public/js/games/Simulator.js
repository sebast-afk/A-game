import * as THREE from 'three';

// ─── Shop upgrade definitions ─────────────────────────────────────────────────

const POWER_UPGRADES = [10, 20, 40, 80, 160];      // damage values per level
const POWER_COSTS    = [50, 150, 400, 1000];        // cost to upgrade TO level 1,2,3,4
const SPEED_LEVELS   = [1, 1.5, 2.5, 4];            // swing cooldown divisors
const SPEED_COSTS    = [75, 200, 500];
const MULTI_LEVELS   = [1, 2, 4];                   // coin multipliers
const MULTI_COSTS    = [300, 1000];

// ─── Health-bar sprite ────────────────────────────────────────────────────────

function makeHealthBar(health, maxHealth) {
  const canvas = document.createElement('canvas');
  canvas.width  = 128;
  canvas.height = 20;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, 128, 20);
  ctx.fillStyle = '#e63946';
  ctx.fillRect(2, 2, Math.round(124 * health / maxHealth), 16);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  const sp  = new THREE.Sprite(mat);
  sp.scale.set(2, 0.3, 1);
  return { sprite: sp, canvas, ctx, tex };
}

// ─── Simulator Game ───────────────────────────────────────────────────────────

export class Simulator {
  constructor(scene, player, input, camera, network, hudStats, gameUI, initData) {
    this.scene    = scene;
    this.player   = player;
    this.input    = input;
    this.camera   = camera;
    this.network  = network;
    this.hudStats = hudStats;
    this.gameUI   = gameUI;

    this.coins       = 0;
    this.powerLevel  = 0;
    this.speedLevel  = 0;
    this.multiLevel  = 0;
    this.prestige    = 0;

    this._swingCooldown  = 0;
    this._shopOpen       = false;
    this._promptEl       = document.getElementById('interact-prompt');

    this.resources    = initData.resources || [];
    this.collidables  = [];
    this._resMeshes   = [];   // { group, healthBar, resData }
    this._floatTexts  = [];

    this._buildWorld();
    this._buildResources();
    this._buildShop();
    this._wireNetwork();

    player.setSpawn(0, 1, 0);
    player.position.set(0, 2, 0);
    player.velocity.set(0, 0, 0);

    this._updateHUD();
  }

  // ─── World ───────────────────────────────────────────────────────────────

  _buildWorld() {
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(100, 0.2, 100),
      new THREE.MeshLambertMaterial({ color: 0x3a7d44 })
    );
    ground.receiveShadow = true;
    ground.position.set(0, -0.1, 0);
    this.scene.add(ground);
    this.collidables.push(ground);
  }

  _buildResources() {
    for (const res of this.resources) {
      const group = new THREE.Group();
      group.position.set(res.x, 0, res.z);

      if (res.type === 'tree') {
        // Trunk
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.4, 2, 8),
          new THREE.MeshLambertMaterial({ color: 0x8b5e3c })
        );
        trunk.position.y = 1;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves
        const leaves = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 8, 6),
          new THREE.MeshLambertMaterial({ color: 0x2dc653 })
        );
        leaves.position.y = 3;
        leaves.castShadow = true;
        group.add(leaves);

        // Collidable trunk
        trunk.userData.collidable = true;
        this.collidables.push(trunk);
        trunk.userData.resId = res.id;

      } else {
        // Rock
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(1 + Math.random() * 0.4),
          new THREE.MeshLambertMaterial({ color: 0x888899 })
        );
        rock.position.y = 0.8;
        rock.rotation.y = Math.random() * Math.PI;
        rock.castShadow = true;
        group.add(rock);

        rock.userData.collidable = true;
        this.collidables.push(rock);
        rock.userData.resId = res.id;
      }

      // Health bar
      const hb = makeHealthBar(res.health, res.maxHealth);
      hb.sprite.position.set(0, res.type === 'tree' ? 5 : 2.5, 0);
      group.add(hb.sprite);

      this.scene.add(group);
      this._resMeshes.push({ group, healthBar: hb, resData: res });
    }
  }

  _buildShop() {
    // Shop building in corner
    const shopGroup = new THREE.Group();
    shopGroup.position.set(35, 0, 35);

    const building = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0x457b9d })
    );
    building.position.y = 3;
    building.castShadow = true;
    shopGroup.add(building);

    // Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5, 2, 4),
      new THREE.MeshLambertMaterial({ color: 0xe63946 })
    );
    roof.position.y = 7;
    roof.rotation.y = Math.PI / 4;
    shopGroup.add(roof);

    // Sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width  = 256;
    signCanvas.height = 64;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SHOP', 128, 32);
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.SpriteMaterial({ map: signTex, depthTest: false });
    const sign    = new THREE.Sprite(signMat);
    sign.scale.set(3, 0.75, 1);
    sign.position.set(0, 7.5, 0);
    shopGroup.add(sign);

    this.scene.add(shopGroup);
    this._shopPos = new THREE.Vector3(35, 0, 35);

    // Collidable building box
    building.userData.collidable = true;
    // We need world-space collidable — add the mesh after adding to scene
    // so its world matrix is set
    this.collidables.push(building);
    // Update building world position by baking group transform
    building.updateMatrixWorld(true);
  }

  // ─── Network events ───────────────────────────────────────────────────────

  _wireNetwork() {
    this.network.on('resourceHit', ({ id, health }) => {
      const rm = this._resMeshes[id];
      if (!rm) return;
      rm.resData.health = health;
      this._updateHealthBar(rm);
    });

    this.network.on('resourceDepleted', ({ id }) => {
      const rm = this._resMeshes[id];
      if (!rm) return;
      rm.resData.health  = 0;
      rm.resData.depleted = true;
      rm.group.visible    = false;
      this._updateHealthBar(rm);
    });

    this.network.on('resourceRespawned', ({ id }) => {
      const rm = this._resMeshes[id];
      if (!rm) return;
      rm.resData.health   = rm.resData.maxHealth;
      rm.resData.depleted = false;
      rm.group.visible    = true;
      this._updateHealthBar(rm);
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt) {
    // Swing cooldown
    if (this._swingCooldown > 0) this._swingCooldown -= dt;

    // Check proximity to resources
    const ppos    = this.player.position;
    let nearRes   = null;
    let nearResId = -1;

    if (!this._shopOpen) {
      for (let i = 0; i < this._resMeshes.length; i++) {
        const rm = this._resMeshes[i];
        if (rm.resData.depleted) continue;
        const dx = ppos.x - rm.resData.x;
        const dz = ppos.z - rm.resData.z;
        if (Math.sqrt(dx*dx + dz*dz) < 3) {
          nearRes   = rm;
          nearResId = i;
          break;
        }
      }
    }

    // Check proximity to shop
    const shopDist = ppos.distanceTo(this._shopPos);
    const nearShop = shopDist < 6 && !this._shopOpen;

    // Prompt
    if (nearRes) {
      this._promptEl.classList.remove('hidden');
      this._promptEl.innerHTML = 'Press <kbd>E</kbd> to mine';
    } else if (nearShop) {
      this._promptEl.classList.remove('hidden');
      this._promptEl.innerHTML = 'Press <kbd>E</kbd> to open Shop';
    } else {
      this._promptEl.classList.add('hidden');
    }

    // E interact
    if (this.input.interact) {
      this.input.consumeInteract();
      if (nearRes && !nearRes.resData.depleted && this._swingCooldown <= 0) {
        this._hitResource(nearResId, nearRes);
      } else if (nearShop) {
        this._openShop();
      }
    }

    // Floating text cleanup
    for (let i = this._floatTexts.length - 1; i >= 0; i--) {
      const ft = this._floatTexts[i];
      ft.el.style.setProperty('--elapsed', ft.elapsed);
      ft.elapsed += dt;
      if (ft.elapsed > 1.2) {
        ft.el.remove();
        this._floatTexts.splice(i, 1);
      }
    }

    this.player.update(dt, this.input, this.camera, this.collidables);
  }

  _hitResource(id, rm) {
    const damage  = POWER_UPGRADES[this.powerLevel];
    const speedMul= SPEED_LEVELS[this.speedLevel];
    this._swingCooldown = 0.4 / speedMul;

    // Swing arm animation
    this.player.armRGroup.rotation.x = -1.2;
    setTimeout(() => { if (this.player) this.player.armRGroup.rotation.x = 0; }, 300);

    // Send to server
    this.network.emit('hitResource', { id, damage });

    // Client-side coins
    const coinGain = damage * MULTI_LEVELS[this.multiLevel];
    this.coins += coinGain;
    this._updateHUD();

    // Floating text
    this._spawnFloatText(`+${coinGain}`);
  }

  _spawnFloatText(text) {
    const el = document.createElement('div');
    el.className   = 'float-text';
    el.textContent = text;
    el.style.left  = (window.innerWidth  / 2 + (Math.random() * 60 - 30)) + 'px';
    el.style.top   = (window.innerHeight / 2 - 40) + 'px';
    document.body.appendChild(el);
    this._floatTexts.push({ el, elapsed: 0 });
    setTimeout(() => el.remove(), 1200);
  }

  _updateHealthBar(rm) {
    const { ctx, tex, canvas } = rm.healthBar;
    const pct = rm.resData.health / rm.resData.maxHealth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 128, 20);
    ctx.fillStyle = pct > 0.5 ? '#2dc653' : pct > 0.25 ? '#f4a261' : '#e63946';
    ctx.fillRect(2, 2, Math.round(124 * pct), 16);
    tex.needsUpdate = true;
  }

  // ─── Shop UI ─────────────────────────────────────────────────────────────

  _openShop() {
    this._shopOpen = true;
    this._promptEl.classList.add('hidden');

    const panel = document.createElement('div');
    panel.className = 'overlay-panel';
    panel.style.pointerEvents = 'all';

    const renderShop = () => {
      panel.innerHTML = `
        <h2>⛏️ Shop</h2>
        <p style="color:#ffd700;font-size:1rem;margin-bottom:20px">Coins: ${this.coins}</p>
        ${this._shopItemHTML('Power', this.powerLevel, POWER_UPGRADES, POWER_COSTS, 'power')}
        ${this._shopItemHTML('Speed', this.speedLevel, SPEED_LEVELS, SPEED_COSTS, 'speed')}
        ${this._shopItemHTML('Multiplier', this.multiLevel, MULTI_LEVELS, MULTI_COSTS, 'multi')}
        <button class="close-btn" id="shop-close">Close</button>
      `;

      panel.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.type;
          this._buyUpgrade(type);
          renderShop();
        });
      });

      panel.querySelector('#shop-close').addEventListener('click', () => {
        panel.remove();
        this._shopOpen = false;
      });
    };

    renderShop();
    this.gameUI.appendChild(panel);
    this.gameUI.style.pointerEvents = 'all';
  }

  _shopItemHTML(name, level, levels, costs, type) {
    const maxLevel = levels.length - 1;
    const atMax    = level >= maxLevel;
    const cost     = atMax ? 0 : costs[level];
    const canAfford= this.coins >= cost;
    const current  = levels[level];
    const next     = atMax ? '—' : levels[level + 1];

    return `
      <div class="shop-item">
        <span>${name}: <strong>${current}</strong>${atMax ? ' (MAX)' : ` → ${next}`}</span>
        ${atMax
          ? '<button class="buy-btn" disabled>MAX</button>'
          : `<button class="buy-btn" data-type="${type}" ${canAfford ? '' : 'disabled'}>$${cost}</button>`
        }
      </div>
    `;
  }

  _buyUpgrade(type) {
    if (type === 'power') {
      const maxLevel = POWER_UPGRADES.length - 1;
      if (this.powerLevel >= maxLevel) return;
      const cost = POWER_COSTS[this.powerLevel];
      if (this.coins < cost) return;
      this.coins -= cost;
      this.powerLevel++;
      window.showToast(`Power upgraded to ${POWER_UPGRADES[this.powerLevel]}!`);
    } else if (type === 'speed') {
      const maxLevel = SPEED_LEVELS.length - 1;
      if (this.speedLevel >= maxLevel) return;
      const cost = SPEED_COSTS[this.speedLevel];
      if (this.coins < cost) return;
      this.coins -= cost;
      this.speedLevel++;
      window.showToast(`Speed upgraded!`);
    } else if (type === 'multi') {
      const maxLevel = MULTI_LEVELS.length - 1;
      if (this.multiLevel >= maxLevel) return;
      const cost = MULTI_COSTS[this.multiLevel];
      if (this.coins < cost) return;
      this.coins -= cost;
      this.multiLevel++;
      window.showToast(`Multiplier: x${MULTI_LEVELS[this.multiLevel]}!`);
    }
    this._updateHUD();
  }

  _updateHUD() {
    this.hudStats.innerHTML = `
      <div>Coins: <strong style="color:#ffd700">${this.coins}</strong></div>
      <div>Power: <strong>${POWER_UPGRADES[this.powerLevel]}</strong></div>
      <div>Speed: <strong>x${SPEED_LEVELS[this.speedLevel]}</strong></div>
      <div>Multi: <strong>x${MULTI_LEVELS[this.multiLevel]}</strong></div>
    `;
  }

  destroy() {}
}
