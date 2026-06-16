// Upgrade costs must match server.js / Tycoon.js
const UPGRADE_COSTS = {
  dropper:  [0, 100, 300, 800],
  conveyor: [50, 200, 600],
  robot:    [150, 400, 1000],
};
const DROPPER_INCOME = [0, 2, 5, 12, 25]; // per second, indexed by upgrade level

export class Network {
  constructor() {
    this.socket        = null;   // real socket OR fake { id, connected }
    this.offline       = false;
    this._handlers     = new Map();
    this._lastMove     = 0;
    this._moveThrottle = 50;
    this._username     = '';
    this._game         = '';

    // Offline-mode game state (mirrors server state)
    this._offlinePlots     = null;
    this._offlineResources = null;
    this._offlineTick      = null;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  connect(username, game) {
    this._username = username;
    this._game     = game;

    if (typeof window.io !== 'function') {
      this._goOffline();
      return;
    }

    try {
      this.socket = window.io({ timeout: 2000, reconnection: false });

      // Connection timeout fallback
      const timer = setTimeout(() => {
        if (!this.socket?.connected && !this.offline) this._goOffline();
      }, 2500);

      this.socket.on('connect', () => {
        clearTimeout(timer);
        this.socket.emit('join', { username, game });
      });

      this.socket.on('connect_error', () => {
        clearTimeout(timer);
        if (!this.offline) this._goOffline();
      });

      // Route every socket event through the _handlers map
      const EVENTS = [
        'init', 'playerJoined', 'playerMoved', 'playerLeft',
        'plotClaimed', 'plotUpgraded', 'plotReleased', 'moneyReceived', 'plotMoneyUpdate',
        'resourceDepleted', 'resourceHit', 'resourceRespawned',
      ];
      for (const ev of EVENTS) {
        this.socket.on(ev, data => this._fire(ev, data));
      }
    } catch {
      this._goOffline();
    }
  }

  /** Register a listener.  Works in both online and offline mode. */
  on(event, cb) {
    if (!this._handlers.has(event)) this._handlers.set(event, []);
    this._handlers.get(event).push(cb);
  }

  /** Send player movement (throttled, no-op offline). */
  sendMove(x, y, z, rotY) {
    if (this.offline || !this.socket?.connected) return;
    const now = Date.now();
    if (now - this._lastMove < this._moveThrottle) return;
    this._lastMove = now;
    this.socket.emit('move', { x, y, z, rotY });
  }

  /** Send a game event.  Offline mode simulates the server response locally. */
  emit(event, data) {
    if (!this.offline) {
      if (this.socket?.connected) this.socket.emit(event, data);
      return;
    }
    this._handleOffline(event, data);
  }

  disconnect() {
    if (this._offlineTick) { clearInterval(this._offlineTick); this._offlineTick = null; }
    if (this.socket && !this.offline) this.socket.disconnect();
    this.socket = null;
  }

  // ─── Offline bootstrap ─────────────────────────────────────────────────────

  _goOffline() {
    if (this.offline) return;
    this.offline = true;

    // Fake socket so game code can read socket.id without crashing
    this.socket = { id: 'local-player', connected: false };

    // Generate game state locally
    this._offlinePlots = Array.from({ length: 4 }, (_, i) => ({
      id: i, owner: null, ownerName: null,
      upgrades: { dropper: 0, conveyor: 0, robot: 0 }, money: 0,
    }));

    this._offlineResources = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      type: i % 3 === 0 ? 'rock' : 'tree',
      x: (Math.random() - 0.5) * 80,
      z: (Math.random() - 0.5) * 80,
      health: 100, maxHealth: 100, depleted: false,
    }));

    // Start tycoon income tick (no-op until a plot has a dropper)
    this._offlineTick = setInterval(() => {
      for (const plot of this._offlinePlots) {
        if (plot.owner && plot.upgrades.dropper > 0) {
          plot.money = Math.min(plot.money + DROPPER_INCOME[plot.upgrades.dropper], 9999);
          this._fire('plotMoneyUpdate', { plotId: plot.id, money: plot.money });
        }
      }
    }, 1000);

    // Dispatch init after on() calls have been registered (GameManager registers right after connect())
    setTimeout(() => {
      this._fire('init', {
        playerId: 'local-player',
        color:    null,
        players:  { 'local-player': { id: 'local-player', username: this._username, color: null } },
        plots:    this._offlinePlots,
        resources: this._offlineResources,
      });
    }, 120);
  }

  // ─── Offline event simulation ──────────────────────────────────────────────

  _handleOffline(event, data) {
    switch (event) {

      case 'claimPlot': {
        const plot = this._offlinePlots[data];
        if (!plot || plot.owner) return;
        plot.owner     = 'local-player';
        plot.ownerName = this._username;
        this._fire('plotClaimed', { plotId: data, owner: 'local-player', ownerName: this._username });
        break;
      }

      case 'buyUpgrade': {
        const { plotId, type } = data;
        const plot  = this._offlinePlots[plotId];
        const costs = UPGRADE_COSTS[type];
        if (!plot || plot.owner !== 'local-player' || !costs) return;
        const level = plot.upgrades[type];
        if (level >= costs.length) return;
        const cost = costs[level];
        if (plot.money < cost) return;
        plot.money -= cost;
        plot.upgrades[type]++;
        this._fire('plotUpgraded', { plotId, type, level: plot.upgrades[type], money: plot.money });
        break;
      }

      case 'collectMoney': {
        const plot = this._offlinePlots[data];
        if (!plot || plot.owner !== 'local-player') return;
        const amount = Math.floor(plot.money);
        plot.money = 0;
        this._fire('moneyReceived', { amount });
        this._fire('plotMoneyUpdate', { plotId: data, money: 0 });
        break;
      }

      case 'hitResource': {
        const { id, damage } = data;
        const res = this._offlineResources?.[id];
        if (!res || res.depleted) return;
        res.health = Math.max(0, res.health - damage);
        if (res.health === 0) {
          res.depleted = true;
          this._fire('resourceDepleted', { id });
          setTimeout(() => {
            res.health   = res.maxHealth;
            res.depleted = false;
            this._fire('resourceRespawned', { id });
          }, 15000);
        } else {
          this._fire('resourceHit', { id, health: res.health });
        }
        break;
      }
    }
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  _fire(event, data) {
    for (const cb of (this._handlers.get(event) || [])) cb(data);
  }
}
