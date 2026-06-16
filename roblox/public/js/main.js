import { GameManager } from './engine/GameManager.js';

const lobby        = document.getElementById('lobby');
const loading      = document.getElementById('loading');
const gameContainer= document.getElementById('game-container');
const canvas       = document.getElementById('game-canvas');
const hudStats     = document.getElementById('hud-stats');
const hudGameName  = document.getElementById('hud-game-name');
const playerCount  = document.getElementById('player-count');
const gameUI       = document.getElementById('game-ui');
const leaveBtn     = document.getElementById('leave-btn');
const usernameInput= document.getElementById('username-input');

let gameManager = null;

// ─── Toast helper ─────────────────────────────────────────────────────────────

window.showToast = (msg, duration = 3000) => {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), duration);
};

// ─── Game card click ──────────────────────────────────────────────────────────

document.querySelectorAll('.game-card').forEach(card => {
  const playBtn = card.querySelector('.play-btn');

  const startGame = async () => {
    const username = usernameInput.value.trim();
    if (!username) {
      usernameInput.focus();
      usernameInput.style.borderColor = '#e63946';
      setTimeout(() => (usernameInput.style.borderColor = ''), 1000);
      return;
    }

    const gameName = card.dataset.game;

    // Show loading
    lobby.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
      gameManager = new GameManager(canvas, hudStats, playerCount, gameUI);
      await gameManager.start(username, gameName);

      // Map game name to display label
      const labels = { obby: 'Obby ⛩️', tycoon: 'Tycoon 🏗️', simulator: 'Mining Simulator ⛏️' };
      hudGameName.textContent = labels[gameName] || gameName;

      loading.classList.add('hidden');
      gameContainer.classList.remove('hidden');
    } catch (err) {
      console.error('Failed to start game:', err);
      loading.classList.add('hidden');
      lobby.classList.remove('hidden');
      alert('Failed to connect. Is the server running?');
    }
  };

  playBtn.addEventListener('click', e => { e.stopPropagation(); startGame(); });
  card.addEventListener('click', startGame);
});

// ─── Leave button ─────────────────────────────────────────────────────────────

leaveBtn.addEventListener('click', () => {
  if (gameManager) {
    gameManager.destroy();
    gameManager = null;
  }
  gameUI.innerHTML = '';
  hudStats.innerHTML = '';
  gameContainer.classList.add('hidden');
  lobby.classList.remove('hidden');
});

// ─── Prevent context menu on canvas ──────────────────────────────────────────

canvas.addEventListener('contextmenu', e => e.preventDefault());
