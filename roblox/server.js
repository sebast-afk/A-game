const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

// ─── Server State ───────────────────────────────────────────────────────────

const state = {
  obby: { players: {} },
  tycoon: {
    players: {},
    plots: Array.from({ length: 4 }, (_, i) => ({
      id: i,
      owner: null,
      ownerName: null,
      upgrades: { dropper: 0, conveyor: 0, robot: 0 },
      money: 0,
    })),
  },
  simulator: {
    players: {},
    resources: Array.from({ length: 25 }, (_, i) => {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const type = i % 3 === 0 ? 'rock' : 'tree';
      return {
        id: i,
        type,
        x: -30 + col * 15 + (Math.random() * 6 - 3),
        z: -30 + row * 15 + (Math.random() * 6 - 3),
        health: 100,
        maxHealth: 100,
        depleted: false,
      };
    }),
  },
};

// ─── Upgrade Costs ───────────────────────────────────────────────────────────

const UPGRADE_COSTS = {
  dropper: [0, 100, 300, 800],   // cost to upgrade TO level 1,2,3,4
  conveyor: [50, 200, 600],
  robot: [150, 400, 1000],
};

const DROPPER_INCOME = [0, 2, 5, 12, 25];  // per second per dropper level

// ─── Money tick ──────────────────────────────────────────────────────────────

setInterval(() => {
  state.tycoon.plots.forEach(plot => {
    if (plot.owner && plot.upgrades.dropper > 0) {
      const income = DROPPER_INCOME[plot.upgrades.dropper];
      plot.money = Math.min(9999, plot.money + income);
      io.to('tycoon').emit('plotMoneyUpdate', { plotId: plot.id, money: plot.money });
    }
  });
}, 1000);

// ─── Socket Events ───────────────────────────────────────────────────────────

io.on('connection', socket => {
  let currentGame = null;
  let currentUsername = null;

  socket.on('join', ({ username, game }) => {
    currentGame = game;
    currentUsername = username;
    const color = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

    const gameState = state[game];
    if (!gameState) return;

    gameState.players[socket.id] = { id: socket.id, username, x: 0, y: 2, z: 0, rotY: 0, color };
    socket.join(game);

    // Build init payload
    let initData = { playerId: socket.id, color, players: gameState.players };
    if (game === 'tycoon') initData.plots = state.tycoon.plots;
    if (game === 'simulator') initData.resources = state.simulator.resources;

    socket.emit('init', initData);
    socket.to(game).emit('playerJoined', gameState.players[socket.id]);
  });

  socket.on('move', ({ x, y, z, rotY }) => {
    if (!currentGame) return;
    const p = state[currentGame].players[socket.id];
    if (!p) return;
    p.x = x; p.y = y; p.z = z; p.rotY = rotY;
    socket.to(currentGame).emit('playerMoved', { id: socket.id, x, y, z, rotY });
  });

  // ── Tycoon events ──────────────────────────────────────────────────────────

  socket.on('claimPlot', plotId => {
    const plot = state.tycoon.plots[plotId];
    if (!plot || plot.owner) return;
    plot.owner = socket.id;
    plot.ownerName = currentUsername;
    io.to('tycoon').emit('plotClaimed', { plotId, owner: socket.id, ownerName: currentUsername });
  });

  socket.on('buyUpgrade', ({ plotId, type }) => {
    const plot = state.tycoon.plots[plotId];
    if (!plot || plot.owner !== socket.id) return;
    const costs = UPGRADE_COSTS[type];
    if (!costs) return;
    const currentLevel = plot.upgrades[type];
    if (currentLevel >= costs.length) return; // already max
    const cost = costs[currentLevel];
    if (plot.money < cost) return;
    plot.money -= cost;
    plot.upgrades[type] = currentLevel + 1;
    io.to('tycoon').emit('plotUpgraded', {
      plotId,
      type,
      level: plot.upgrades[type],
      money: plot.money,
    });
  });

  socket.on('collectMoney', plotId => {
    const plot = state.tycoon.plots[plotId];
    if (!plot || plot.owner !== socket.id) return;
    const amount = plot.money;
    plot.money = 0;
    socket.emit('moneyReceived', { amount });
    io.to('tycoon').emit('plotMoneyUpdate', { plotId, money: 0 });
  });

  // ── Simulator events ────────────────────────────────────────────────────────

  socket.on('hitResource', ({ id, damage }) => {
    const res = state.simulator.resources[id];
    if (!res || res.depleted) return;
    res.health = Math.max(0, res.health - (damage || 10));
    if (res.health <= 0) {
      res.depleted = true;
      io.to('simulator').emit('resourceDepleted', { id });
      setTimeout(() => {
        res.health = res.maxHealth;
        res.depleted = false;
        io.to('simulator').emit('resourceRespawned', { id });
      }, 15000);
    } else {
      io.to('simulator').emit('resourceHit', { id, health: res.health });
    }
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────

  socket.on('disconnect', () => {
    if (!currentGame) return;
    delete state[currentGame].players[socket.id];
    io.to(currentGame).emit('playerLeft', { id: socket.id });

    // Release tycoon plots
    state.tycoon.plots.forEach(plot => {
      if (plot.owner === socket.id) {
        plot.owner = null;
        plot.ownerName = null;
        plot.money = 0;
        plot.upgrades = { dropper: 0, conveyor: 0, robot: 0 };
        io.to('tycoon').emit('plotReleased', { plotId: plot.id });
      }
    });
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Roblox clone running on http://localhost:${PORT}`));
