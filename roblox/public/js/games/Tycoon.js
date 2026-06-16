import * as THREE from 'three';

// ─── Constants ────────────────────────────────────────────────────────────────

const UPGRADE_COSTS = {
  dropper:  [0, 100, 300, 800],
  conveyor: [50, 200, 600],
  robot:    [150, 400, 1000],
};

const DROPPER_INCOME = [0, 2, 5, 12, 25];

const PLOT_POSITIONS = [
  { x: -15, z: -15 },
  { x:  15, z: -15 },
  { x: -15, z:  15 },
  { x:  15, z:  15 },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeBox(w, h, d, color, emissive = 0x000000) {
  const mat  = new THREE.MeshLambertMaterial({ color, emissive });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeLabelSprite(text, bgColor = '#1a1a2e', textColor = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width  = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgColor;
  ctx.roundRect(4, 4, 504, 120, 12);
  ctx.fill();
  ctx.fillStyle = textColor;
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  const sp  = new THREE.Sprite(mat);
  sp.scale.set(3.5, 0.9, 1);
  return { sprite: sp, canvas, ctx, tex };
}

// ─── Plot visual data ─────────────────────────────────────────────────────────

class PlotVisual {
  constructor(scene, plotData, pos) {
    this.scene    = scene;
    this.plotData = plotData;
    this.pos      = pos;
    this.group    = new THREE.Group();
    this.group.position.set(pos.x, 0, pos.z);
    scene.add(this.group);

    this._moneyBalls   = [];
    this._buttons      = [];

    this._buildBase();
    this._buildClaimSign();
  }

  _buildBase() {
    // Plot floor
    const floor = makeBox(25, 0.2, 25, 0x3a7d44);
    floor.receiveShadow = true;
    floor.position.y = 0.1;
    this.group.add(floor);

    // Border fences
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
    const posts = [
      [-12.5, 0, 0], [12.5, 0, 0], [0, 0, -12.5], [0, 0, 12.5],
    ];
    for (const [fx, , fz] of posts) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.5, 0.3), fenceMat);
      post.position.set(fx, 0.75, fz);
      post.castShadow = true;
      this.group.add(post);
    }
  }

  _buildClaimSign() {
    this._claimGroup = new THREE.Group();

    const signPost = makeBox(0.2, 3, 0.2, 0x8b6914);
    signPost.position.set(0, 1.5, 0);
    this._claimGroup.add(signPost);

    const { sprite, canvas, ctx, tex } = makeLabelSprite('CLAIM PLOT', '#0f3460', '#ffd700');
    sprite.position.set(0, 3.5, 0);
    this._claimSprite = { sprite, canvas, ctx, tex };
    this._claimGroup.add(sprite);

    this.group.add(this._claimGroup);
  }

  showOwned(ownerName, isMyPlot) {
    // Remove claim sign
    if (this._claimGroup) {
      this.group.remove(this._claimGroup);
      this._claimGroup = null;
    }

    // Name sign
    if (!this._nameSprite) {
      const { sprite, canvas, ctx, tex } = makeLabelSprite(
        ownerName + "'s Plot",
        isMyPlot ? '#0f3460' : '#1a1a2e',
        isMyPlot ? '#ffd700' : '#aaaaaa'
      );
      sprite.position.set(0, 5, -10);
      this._nameSprite = { sprite, canvas, ctx, tex };
      this.group.add(sprite);
    }

    // Dropper machine
    if (!this._dropperMesh) {
      const dropper = makeBox(2, 3, 2, 0x4444cc, 0x001133);
      dropper.position.set(-7, 1.7, -7);
      this._dropperMesh = dropper;
      this.group.add(dropper);

      const dropLabel = makeBox(1.8, 0.8, 0.2, 0x222266);
      dropLabel.position.set(-7, 2.8, -5.9);
      this.group.add(dropLabel);

      // Conveyor belt visual
      const belt = makeBox(6, 0.3, 1.5, 0x222222);
      belt.position.set(-4, 0.45, -7);
      this.group.add(belt);
      this._beltMesh = belt;

      // Collection bin
      const bin = makeBox(2, 1.5, 2, 0x995500, 0x331100);
      bin.position.set(0, 0.95, -7);
      this.group.add(bin);
    }

    if (isMyPlot) this._buildUpgradeButtons();
  }

  _buildUpgradeButtons() {
    if (this._buttonsBuilt) return;
    this._buttonsBuilt = true;
    this._buttonData   = [];

    const btns = [
      { key: 'dropper',  label: 'Upgrade Dropper', x:  6, z: -9 },
      { key: 'conveyor', label: 'Upgrade Conveyor', x:  6, z: -6 },
      { key: 'robot',    label: 'Upgrade Robot',    x:  6, z: -3 },
      { key: 'collect',  label: 'Collect Money',    x:  6, z:  0 },
    ];

    for (const btn of btns) {
      const board = makeBox(3, 1, 0.2, 0x003366);
      board.position.set(btn.x, 1.5, btn.z);
      board.userData.btnKey = btn.key;
      this.group.add(board);

      const { sprite, canvas, ctx, tex } = makeLabelSprite(btn.label, '#003366', '#ffffff');
      sprite.position.set(btn.x, 2.6, btn.z);
      sprite.scale.set(3, 0.7, 1);
      this.group.add(sprite);
      this._buttonData.push({ key: btn.key, board, sprite, canvas, ctx, tex });
    }
  }

  updateButtonLabels(plotData, wallet) {
    if (!this._buttonData) return;
    for (const bd of this._buttonData) {
      let text = '';
      if (bd.key === 'collect') {
        text = `Collect $${plotData.money}`;
      } else {
        const costs = UPGRADE_COSTS[bd.key];
        const level = plotData.upgrades[bd.key];
        const maxLev= costs.length;
        if (level >= maxLev) text = `${bd.key} MAX`;
        else {
          const cost = costs[level];
          text = `Upgrade ${bd.key} ($${cost})`;
        }
      }
      const { ctx, tex, canvas } = bd;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#003366';
      ctx.roundRect(4, 4, 504, 120, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 64);
      tex.needsUpdate = true;
    }
  }

  getButtonNear(playerWorldPos) {
    if (!this._buttonData) return null;
    const localPos = playerWorldPos.clone().sub(
      new THREE.Vector3(this.pos.x, 0, this.pos.z)
    );
    for (const bd of this._buttonData) {
      const dx = localPos.x - bd.board.position.x;
      const dz = localPos.z - bd.board.position.z;
      if (Math.sqrt(dx*dx + dz*dz) < 3) return bd.key;
    }
    return null;
  }

  isClaimNear(playerWorldPos) {
    if (!this._claimGroup) return false;
    const dx = playerWorldPos.x - this.pos.x;
    const dz = playerWorldPos.z - this.pos.z;
    return Math.sqrt(dx*dx + dz*dz) < 5;
  }

  // Money ball particle system
  spawnMoneyBall() {
    if (!this._dropperMesh) return;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0x443300 })
    );
    sphere.position.set(-7, 3.3, -7);
    this.group.add(sphere);
    this._moneyBalls.push({ mesh: sphere, t: 0 });
  }

  updateMoneyBalls(dt) {
    for (let i = this._moneyBalls.length - 1; i >= 0; i--) {
      const ball = this._moneyBalls[i];
      ball.t += dt;
      // Fall then slide along conveyor
      if (ball.t < 0.5) {
        ball.mesh.position.y = 3.3 - ball.t * 4;
      } else {
        ball.mesh.position.y = 0.6;
        ball.mesh.position.x = -7 + (ball.t - 0.5) * 6;
      }
      if (ball.t > 2) {
        this.group.remove(ball.mesh);
        this._moneyBalls.splice(i, 1);
      }
    }
  }

  // Dropper animation tick
  _ballTimer = 0;
  tickDropper(dt, dropperLevel) {
    if (dropperLevel < 1) return;
    const rate = 1 / dropperLevel; // seconds between balls
    this._ballTimer += dt;
    if (this._ballTimer > rate) {
      this._ballTimer = 0;
      this.spawnMoneyBall();
    }
    this.updateMoneyBalls(dt);
  }
}

// ─── Tycoon Game ──────────────────────────────────────────────────────────────

export class Tycoon {
  constructor(scene, player, input, camera, network, hudStats, gameUI, initData) {
    this.scene    = scene;
    this.player   = player;
    this.input    = input;
    this.camera   = camera;
    this.network  = network;
    this.hudStats = hudStats;
    this.gameUI   = gameUI;

    this.wallet   = 0;
    this.myPlotId = null;
    this.plots    = initData.plots || [];

    this.collidables = [];
    this._plotVisuals= [];
    this._promptEl   = document.getElementById('interact-prompt');

    this._buildWorld();
    this._initPlots();
    this._wireNetwork();

    player.setSpawn(0, 1, 0);
    player.position.set(0, 2, 0);
    player.velocity.set(0, 0, 0);
  }

  _buildWorld() {
    // Large grass ground
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(120, 0.2, 120),
      new THREE.MeshLambertMaterial({ color: 0x3a7d44 })
    );
    ground.receiveShadow = true;
    ground.position.set(0, -0.1, 0);
    this.scene.add(ground);
    this.collidables.push(ground);
  }

  _initPlots() {
    for (let i = 0; i < 4; i++) {
      const pos    = PLOT_POSITIONS[i];
      const pData  = this.plots[i];
      const vis    = new PlotVisual(this.scene, pData, pos);
      this._plotVisuals.push(vis);

      if (pData.owner) {
        const isMyPlot = (pData.owner === null); // will be updated via network
        vis.showOwned(pData.ownerName, false);
      }
    }
  }

  _wireNetwork() {
    this.network.on('plotClaimed', ({ plotId, owner, ownerName }) => {
      this.plots[plotId].owner     = owner;
      this.plots[plotId].ownerName = ownerName;
      const isMyPlot = (owner === this.network.socket.id);
      if (isMyPlot) this.myPlotId = plotId;
      this._plotVisuals[plotId].showOwned(ownerName, isMyPlot);
    });

    this.network.on('plotUpgraded', ({ plotId, type, level, money }) => {
      this.plots[plotId].upgrades[type] = level;
      this.plots[plotId].money          = money;
      if (plotId === this.myPlotId) {
        this._plotVisuals[plotId].updateButtonLabels(this.plots[plotId], this.wallet);
      }
    });

    this.network.on('plotReleased', ({ plotId }) => {
      // Rebuild plot visual from scratch
      const vis = this._plotVisuals[plotId];
      this.scene.remove(vis.group);
      this.plots[plotId] = {
        id: plotId, owner: null, ownerName: null,
        upgrades: { dropper: 0, conveyor: 0, robot: 0 }, money: 0
      };
      if (plotId === this.myPlotId) this.myPlotId = null;
      const pos  = PLOT_POSITIONS[plotId];
      const newVis = new PlotVisual(this.scene, this.plots[plotId], pos);
      this._plotVisuals[plotId] = newVis;
    });

    this.network.on('moneyReceived', ({ amount }) => {
      this.wallet += amount;
      this._updateHUD();
      window.showToast(`+$${amount} collected!`);
    });

    this.network.on('plotMoneyUpdate', ({ plotId, money }) => {
      this.plots[plotId].money = money;
      if (plotId === this.myPlotId) {
        this._plotVisuals[plotId].updateButtonLabels(this.plots[plotId], this.wallet);
      }
    });

    this._updateHUD();
  }

  update(dt) {
    // Dropper particles on my plot
    if (this.myPlotId !== null) {
      const vis  = this._plotVisuals[this.myPlotId];
      const plot = this.plots[this.myPlotId];
      vis.tickDropper(dt, plot.upgrades.dropper);
      vis.updateButtonLabels(plot, this.wallet);
    }

    // Interact detection
    const ppos   = this.player.position;
    let nearAction = null;
    let nearPlotId = null;

    for (let i = 0; i < 4; i++) {
      const vis  = this._plotVisuals[i];
      const plot = this.plots[i];

      if (!plot.owner && vis.isClaimNear(ppos)) {
        nearAction = 'claim';
        nearPlotId = i;
        break;
      }
      if (plot.owner && this.myPlotId === i) {
        const btnKey = vis.getButtonNear(ppos);
        if (btnKey) {
          nearAction = btnKey;
          nearPlotId = i;
          break;
        }
      }
    }

    // Show/hide prompt
    if (nearAction) {
      this._promptEl.classList.remove('hidden');
      const labels = {
        claim:   'Press E to Claim Plot',
        dropper: 'Press E to Upgrade Dropper',
        conveyor:'Press E to Upgrade Conveyor',
        robot:   'Press E to Upgrade Robot',
        collect: 'Press E to Collect Money',
      };
      this._promptEl.innerHTML = (labels[nearAction] || 'Press E to interact')
        .replace('E', '<kbd>E</kbd>');
    } else {
      this._promptEl.classList.add('hidden');
    }

    // Handle E interact
    if (this.input.interact && nearAction !== null) {
      this.input.consumeInteract();
      if (nearAction === 'claim') {
        this.network.emit('claimPlot', nearPlotId);
      } else if (nearAction === 'collect') {
        this.network.emit('collectMoney', nearPlotId);
      } else {
        this.network.emit('buyUpgrade', { plotId: nearPlotId, type: nearAction });
      }
    }

    this.player.update(dt, this.input, this.camera, this.collidables);
  }

  _updateHUD() {
    this.hudStats.innerHTML = `
      <div>Wallet: <strong style="color:#ffd700">$${this.wallet}</strong></div>
      <div style="color:#aaa">Claim a plot and build!</div>
    `;
  }

  destroy() {}
}
