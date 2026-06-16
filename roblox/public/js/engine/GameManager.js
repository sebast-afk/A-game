import { Renderer }     from './Renderer.js';
import { InputManager } from './InputManager.js';
import { Player }       from './Player.js';
import { RemotePlayer } from './RemotePlayer.js';
import { Network }      from './Network.js';
import { Obby }         from '../games/Obby.js';
import { Tycoon }       from '../games/Tycoon.js';
import { Simulator }    from '../games/Simulator.js';

export class GameManager {
  constructor(canvas, hudStats, playerCountEl, gameUI) {
    this.canvas        = canvas;
    this.hudStats      = hudStats;
    this.playerCountEl = playerCountEl;
    this.gameUI        = gameUI;

    this.renderer      = null;
    this.input         = null;
    this.network       = null;
    this.player        = null;
    this.currentGame   = null;
    this.remotePlayers = new Map();

    this._rafId  = null;
    this._lastTs = null;
  }

  async start(username, gameName) {
    this.username = username;
    this.gameName = gameName;

    this.renderer = new Renderer(this.canvas);
    this.input    = new InputManager();
    this.network  = new Network();

    // Wait for server init
    await new Promise(resolve => {
      this.network.connect(username, gameName);

      this.network.on('init', data => {
        const { playerId, color, players } = data;
        this._myId = playerId;

        // Create local player
        this.player = new Player(this.renderer.scene, username, color);

        // Populate existing remote players
        for (const [id, pdata] of Object.entries(players)) {
          if (id === playerId) continue;
          const rp = new RemotePlayer(this.renderer.scene, pdata);
          this.remotePlayers.set(id, rp);
        }

        // Load game mode
        this.currentGame = this._loadGame(gameName, data);

        // Update player count
        this._updatePlayerCount(Object.keys(players).length);

        resolve();
      });
    });

    // Wire multiplayer events
    this.network.on('playerJoined', data => {
      if (data.id === this._myId) return;
      if (!this.remotePlayers.has(data.id)) {
        const rp = new RemotePlayer(this.renderer.scene, data);
        this.remotePlayers.set(data.id, rp);
      }
      this._updatePlayerCount(this.remotePlayers.size + 1);
    });

    this.network.on('playerMoved', data => {
      const rp = this.remotePlayers.get(data.id);
      if (rp) rp.setTarget(data.x, data.y, data.z, data.rotY);
    });

    this.network.on('playerLeft', data => {
      const rp = this.remotePlayers.get(data.id);
      if (rp) { rp.destroy(); this.remotePlayers.delete(data.id); }
      this._updatePlayerCount(this.remotePlayers.size + 1);
    });

    // Start loop
    this._loop(performance.now());
  }

  _loadGame(name, initData) {
    switch (name) {
      case 'obby':
        return new Obby(
          this.renderer.scene,
          this.player,
          this.input,
          this.renderer.camera,
          this.hudStats,
          this.gameUI
        );
      case 'tycoon':
        return new Tycoon(
          this.renderer.scene,
          this.player,
          this.input,
          this.renderer.camera,
          this.network,
          this.hudStats,
          this.gameUI,
          initData
        );
      case 'simulator':
        return new Simulator(
          this.renderer.scene,
          this.player,
          this.input,
          this.renderer.camera,
          this.network,
          this.hudStats,
          this.gameUI,
          initData
        );
      default:
        throw new Error('Unknown game: ' + name);
    }
  }

  _loop(ts) {
    this._rafId = requestAnimationFrame(t => this._loop(t));

    const dt = this._lastTs === null ? 0.016 : Math.min((ts - this._lastTs) / 1000, 0.05);
    this._lastTs = ts;

    // Update input
    this.input.update();

    // Update game (includes player.update internally)
    if (this.currentGame) this.currentGame.update(dt);

    // Update remote players
    for (const rp of this.remotePlayers.values()) rp.update(dt);

    // Render
    this.renderer.render();

    // Send position
    if (this.player) {
      this.network.sendMove(
        this.player.position.x,
        this.player.position.y,
        this.player.position.z,
        this.player.mesh.rotation.y
      );
    }
  }

  _updatePlayerCount(n) {
    this.playerCountEl.textContent = `Players: ${n}`;
  }

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._lastTs = null;

    if (this.network)  this.network.disconnect();
    if (this.renderer) this.renderer.dispose();

    if (this.player)   this.player.destroy();
    for (const rp of this.remotePlayers.values()) rp.destroy();
    this.remotePlayers.clear();

    if (this.currentGame && this.currentGame.destroy) this.currentGame.destroy();
    this.gameUI.innerHTML = '';
  }
}
