// One Piece Legends - Main Game Controller

class OnePieceLegends {
  constructor() {
    // Game state
    this.state = 'MENU'; // MENU, CHARACTER_SELECT, BATTLE, RESULT
    this.gameMode = 'story'; // story, pvp, event, training

    // Teams
    this.playerTeam = []; // array of charIds (selected)
    this.enemyTeamIds = [];
    this.playerTeamData = []; // deep copies of char data with currentHp
    this.enemyTeamData = [];
    this.activePlayerIdx = 0;
    this.activeEnemyIdx = 0;

    // Battle stats
    this.stats = { damageDealt: 0, maxCombo: 0, grandRushUsed: false };
    this.battleActive = false;
    this.battleTimer = 0;

    // Systems (initialized after DOM ready)
    this.gameScene = null;
    this.combat = null;
    this.ai = null;
    this.ui = null;

    // Touch/input
    this.touchStart = null;
    this.lastTap = 0;

    // Enemy team configurations
    this.enemyRosters = [
      { name: 'Marine Trio', ids: ['usopp', 'nami', 'law'], difficulty: 'easy' },
      { name: 'Rival Pirates', ids: ['sanji', 'nami', 'usopp'], difficulty: 'normal' },
      { name: 'Straw Hat Rivals', ids: ['zoro', 'sanji', 'nami'], difficulty: 'normal' },
      { name: 'Worst Generation', ids: ['law', 'zoro', 'luffy'], difficulty: 'hard' },
    ];

    // Grand Rush state
    this.grandRushPending = false;
    this.playerGrandRushSymbol = null;

    // Enemy stun tracking
    this.enemyStunTimer = 0;

    this.init();
  }

  init() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    // Init systems
    this.gameScene = new GameScene(canvas);
    this.ui = new UIManager();
    this.combat = new CombatSystem(this.gameScene, this.ui);
    this.ai = new EnemyAI(this.gameScene, this.combat);

    // Wire up events
    this.wireEvents();

    // Input
    this.setupInput();

    // Start
    this.ui.showScreen('main-menu');
    this.state = 'MENU';

    // Game loop
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  wireEvents() {
    // Combat events -> UI
    this.combat.on('staminaUpdate', r => this.ui.updateStaminaBar(r));
    this.combat.on('dodgeGaugeUpdate', r => this.ui.updateDodgeGauge(r));
    this.combat.on('grandRushUpdate', r => {
      this.ui.updateGrandRushMeter(r);
      if (r >= 1 && !this.grandRushPending) {
        this.combat.grandRushReady = true;
      }
    });
    this.combat.on('handUpdate', hand => {
      if (this.state !== 'BATTLE') return;
      this.ui.renderCards(hand, card => this.combat.canPlayCard(card), this.combat.stamina / 100);
    });
    this.combat.on('hpUpdate', data => {
      const isPlayer = data.isPlayer;
      const team = isPlayer ? this.playerTeamData : this.enemyTeamData;
      const idx = team.findIndex(c => c.id === data.charId);
      if (idx !== -1) {
        team[idx].currentHp = data.hp;
        this.ui.updateHealthBar(data.charId, data.hp, data.maxHp, isPlayer, idx);
      }
      if (isPlayer && data.charId === this.playerTeamData[this.activePlayerIdx]?.id) {
        this.stats.damageDealt += 0; // track on enemy damage
      }
    });
    this.combat.on('characterDefeated', data => this.handleCharacterDefeated(data));
    this.combat.on('notification', data => {
      this.ui.showNotification(data);
    });
    this.combat.on('specialAnnounce', name => this.ui.showSpecialAnnounce(name));
    this.combat.on('ultimateAnnounce', name => this.ui.showUltimateAnnounce(name));
    this.combat.on('comboUpdate', count => {
      if (count > this.stats.maxCombo) this.stats.maxCombo = count;
      this.ui.updateCombo(count);
    });
    this.combat.on('comboEnd', () => this.ui.updateCombo(0));
    this.combat.on('effectUpdate', effects => this.ui.updateEffectIndicators(effects));
    this.combat.on('effectExpired', key => this.ui.updateEffectIndicators(this.combat.activeEffects));
    this.combat.on('dodgeActivated', () => {
      this.ui.flashScreen('#00FFFF', 200);
      this.ui.showNotification({ text: 'VANISH!', color: '#00FFFF' });
    });
    this.combat.on('counterAttackWindow', open => {
      const btn = document.getElementById('counter-indicator');
      if (btn) btn.classList.toggle('active', open);
    });
    this.combat.on('characterSwitched', data => {
      this.activePlayerIdx = data.newIndex;
      this.gameScene.setPlayerCharacter(data.newChar.id, false);
      this.ui.setActivePortrait(true, this.activePlayerIdx);
      this.ui.renderSwitchButtons(this.playerTeamData, this.activePlayerIdx, this.combat.switchCooldowns);
      this.ui.flashScreen('#00BBFF', 250);
    });
    this.combat.on('enemyStunned', duration => {
      this.enemyStunTimer = duration;
      this.ai.applyStun(duration);
    });
    this.combat.on('grandRushStart', data => {
      this.stats.grandRushUsed = true;
      this.ui.flashScreen('#FFD700', 300);
    });
    this.combat.on('grandRushEnd', data => {
      this.ui.showNotification({
        text: `GRAND RUSH! -${data.totalDamage}`,
        color: '#FFD700',
        big: true,
        isEnemy: true
      });
      this.checkBattleEnd();
    });

    // AI events
    this.ai.on('playerDamaged', data => {
      const char = this.playerTeamData.find(c => c.id === data.charId);
      if (char) {
        char.currentHp = data.hp;
        const idx = this.playerTeamData.indexOf(char);
        this.ui.updateHealthBar(data.charId, data.hp, char.maxHp, true, idx);
        if (data.hp <= 0) {
          this.handleCharacterDefeated({ isPlayer: true, charId: data.charId });
        }
      }
    });
    this.ai.on('aiSwitch', newIdx => {
      if (newIdx >= 0 && newIdx < this.enemyTeamData.length && this.enemyTeamData[newIdx].currentHp > 0) {
        this.activeEnemyIdx = newIdx;
        this.gameScene.setPlayerCharacter(this.enemyTeamData[newIdx].id, true);
        this.ui.setActivePortrait(false, this.activeEnemyIdx);
        this.ai.initHand(this.enemyTeamData[newIdx]);
        this.ui.flashScreen('#FF4400', 200);
      }
    });
    this.ai.on('enemyGrandRush', async data => {
      if (!this.battleActive) return;
      const playerChar = this.playerTeamData[this.activePlayerIdx];
      if (!playerChar) return;

      const symbols = ['sword', 'devilfruit', 'haki', 'fist'];
      const enemySymbol = data.symbol;

      // AI Grand Rush
      let totalDmg = 0;
      this.gameScene.startCinematicMode('grandRush');
      this.gameScene.createGrandRushEffect();
      this.ui.flashScreen('#FF4400', 400);

      for (const char of this.enemyTeamData) {
        if (char && char.currentHp > 0) {
          await new Promise(r => setTimeout(r, 500));
          const dmg = Math.floor(150 * (char.power / 80));
          const defRed = 0.15 + (playerChar.defense / 100) * 0.2;
          const finalDmg = Math.max(1, Math.floor(dmg * (1 - defRed)));
          totalDmg += finalDmg;
          playerChar.currentHp = Math.max(0, playerChar.currentHp - finalDmg);
          this.ui.updateHealthBar(playerChar.id, playerChar.currentHp, playerChar.maxHp, true, this.activePlayerIdx);
          this.gameScene.shakeCharacter(false, 0.6);
          this.gameScene.createImpactEffect(this.gameScene.characterMeshes.player?.position || this.gameScene.basePlayerPos, new THREE.Color(0xFF4400), 2);
        }
      }
      this.ui.showNotification({ text: `ENEMY GRAND RUSH! -${totalDmg}`, color: '#FF4400', big: true });
      if (playerChar.currentHp <= 0) {
        this.handleCharacterDefeated({ isPlayer: true, charId: playerChar.id });
      }
      this.checkBattleEnd();
    });
    this.ai.on('aiSkillUsed', name => {
      this.ui.showNotification({ text: `Enemy: ${name}`, color: '#FF8888', isEnemy: false });
    });
  }

  setupInput() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    // Touch
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      if (!this.touchStart) return;
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20) {
        // Tap - move toward enemy
        if (this.state === 'BATTLE' && this.battleActive) {
          this.handleTap();
        }
      } else if (dist > 40) {
        // Swipe
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) this.handleSwipeLeft();
          else this.handleSwipeRight();
        } else {
          if (dy > 0) this.handleSwipeDown();
        }
      }
      this.touchStart = null;
    }, { passive: false });

    // Mouse (desktop)
    canvas.addEventListener('click', e => {
      if (this.state === 'BATTLE' && this.battleActive) this.handleTap();
    });

    // Card clicks
    document.addEventListener('click', e => {
      const cardEl = e.target.closest('.arts-card');
      if (cardEl && this.state === 'BATTLE') {
        const idx = parseInt(cardEl.getAttribute('data-card-index'));
        this.handleCardPlay(idx);
        return;
      }
      const switchBtn = e.target.closest('.switch-btn');
      if (switchBtn && this.state === 'BATTLE') {
        const idx = parseInt(switchBtn.getAttribute('data-switch-index'));
        this.handleSwitch(idx);
        return;
      }
    });

    // Dodge button
    document.getElementById('dodge-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      if (this.state === 'BATTLE') this.handleDodge();
    });

    // Grand Rush button
    document.getElementById('grand-rush-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      if (this.state === 'BATTLE' && this.combat.grandRushReady && !this.grandRushPending) {
        this.handleGrandRush();
      }
    });

    // Menu buttons
    document.getElementById('play-btn')?.addEventListener('click', () => this.startCharacterSelect());
    document.getElementById('training-btn')?.addEventListener('click', () => {
      this.gameMode = 'training';
      this.startCharacterSelect();
    });
    document.getElementById('ready-btn')?.addEventListener('click', () => {
      if (this.playerTeam.length >= 3) this.startBattle();
    });
    document.getElementById('retry-btn')?.addEventListener('click', () => this.startBattle());
    document.getElementById('menu-btn')?.addEventListener('click', () => {
      this.state = 'MENU';
      this.battleActive = false;
      this.ui.showScreen('main-menu');
    });
    document.getElementById('back-to-menu')?.addEventListener('click', () => {
      this.state = 'MENU';
      this.ui.showScreen('main-menu');
    });
  }

  // =================== GAME FLOW ===================

  startCharacterSelect() {
    this.playerTeam = [];
    this.state = 'CHARACTER_SELECT';
    this.ui.showScreen('character-select');
    this.ui.buildCharacterSelect(CHARACTERS, this.playerTeam,
      charId => this.handleCharacterSelect(charId),
      () => this.startBattle()
    );
  }

  handleCharacterSelect(charId) {
    const idx = this.playerTeam.indexOf(charId);
    if (idx !== -1) {
      this.playerTeam.splice(idx, 1);
    } else if (this.playerTeam.length < 3) {
      this.playerTeam.push(charId);
    }
    this.ui.buildCharacterSelect(CHARACTERS, this.playerTeam,
      charId => this.handleCharacterSelect(charId),
      () => this.startBattle()
    );
  }

  startBattle() {
    if (this.playerTeam.length < 3) {
      this.ui.showNotification({ text: 'Select 3 characters!', color: '#FF4444' });
      return;
    }

    // Pick enemy team
    const roster = this.enemyRosters[Math.floor(Math.random() * this.enemyRosters.length)];
    this.enemyTeamIds = roster.ids;

    // Deep copy character data
    this.playerTeamData = this.playerTeam.map(id => {
      const c = CHARACTERS[id];
      return { ...c, arts: { ...c.arts }, currentHp: c.maxHp, isPlayer: true };
    });
    this.enemyTeamData = this.enemyTeamIds.map(id => {
      const c = CHARACTERS[id];
      return { ...c, arts: { ...c.arts }, currentHp: c.maxHp, isPlayer: false };
    });

    this.activePlayerIdx = 0;
    this.activeEnemyIdx = 0;
    this.stats = { damageDealt: 0, maxCombo: 0, grandRushUsed: false };
    this.grandRushPending = false;
    this.battleTimer = 0;
    this.enemyStunTimer = 0;

    // Reset systems
    this.combat.reset();
    this.ai.reset(this.enemyTeamData[0]);
    this.ai.setDifficulty(roster.difficulty || 'normal');

    // Set up scene
    this.gameScene.setPlayerCharacter(this.playerTeamData[0].id, false);
    this.gameScene.setPlayerCharacter(this.enemyTeamData[0].id, true);

    // Init combat
    this.combat.initHand(this.playerTeamData[0]);

    // Setup UI
    this.state = 'BATTLE';
    this.ui.showScreen('battle-screen');
    this.buildBattleHUD();

    // Battle intro
    this.battleActive = false;
    this.ui.showBattleIntro(this.playerTeam, this.enemyTeamIds, CHARACTERS, () => {
      this.battleActive = true;
      this.ui.showNotification({ text: 'BATTLE START!', color: '#FFD700' });
    });
  }

  buildBattleHUD() {
    // Player team portraits
    const playerPortraitContainer = document.getElementById('player-portraits');
    if (playerPortraitContainer) {
      playerPortraitContainer.innerHTML = '';
      this.playerTeamData.forEach((char, i) => {
        const div = document.createElement('div');
        div.id = `player-portrait-${i}`;
        div.className = `player-portrait ${i === 0 ? 'active-portrait' : ''}`;
        div.style.borderColor = char.modelColor;
        div.innerHTML = `
          <div class="portrait-inner" style="background:linear-gradient(135deg,${char.modelColor},#000)">
            <div class="portrait-icon">${char.arts.strike.icon}</div>
            <div class="portrait-defeat hidden">✕</div>
          </div>
          <div class="hp-bar-container">
            <div id="player-hp-bar-${i}" class="hp-fill" style="width:100%;background:linear-gradient(90deg,#44FF44,#88FF44)"></div>
          </div>
          <div id="player-hp-text-${i}" class="hp-text">${char.maxHp}</div>
        `;
        playerPortraitContainer.appendChild(div);
      });
    }

    // Enemy team portraits
    const enemyPortraitContainer = document.getElementById('enemy-portraits');
    if (enemyPortraitContainer) {
      enemyPortraitContainer.innerHTML = '';
      this.enemyTeamData.forEach((char, i) => {
        const div = document.createElement('div');
        div.id = `enemy-portrait-${i}`;
        div.className = `enemy-portrait ${i === 0 ? 'active-portrait' : ''}`;
        div.style.borderColor = char.modelColor;
        div.innerHTML = `
          <div class="portrait-inner" style="background:linear-gradient(135deg,${char.modelColor},#000)">
            <div class="portrait-icon">${char.arts.strike.icon}</div>
            <div class="portrait-defeat hidden">✕</div>
          </div>
          <div class="hp-bar-container">
            <div id="enemy-hp-bar-${i}" class="hp-fill" style="width:100%;background:linear-gradient(90deg,#44FF44,#88FF44)"></div>
          </div>
          <div id="enemy-hp-text-${i}" class="hp-text">${char.maxHp}</div>
        `;
        enemyPortraitContainer.appendChild(div);
      });
    }

    // Switch buttons
    this.ui.renderSwitchButtons(this.playerTeamData, this.activePlayerIdx, this.combat.switchCooldowns);

    // Timer display
    this.updateBattleTimer();
  }

  // =================== INPUT HANDLERS ===================

  handleTap() {
    if (!this.battleActive || this.combat.isAttacking) return;
    // Tap to rush at enemy / move toward them
    const rushX = this.gameScene.baseEnemyPos.x - 3;
    this.gameScene.moveCharacterTo(false, rushX, 0.3).then(() => {
      setTimeout(() => this.gameScene.returnCharacterToBase(false, 0.4), 600);
    });
  }

  handleSwipeLeft() {
    if (this.state === 'BATTLE' && this.battleActive) this.handleDodge();
  }

  handleSwipeRight() {
    if (this.state === 'BATTLE' && this.battleActive) this.handleDodge();
  }

  handleSwipeDown() {
    // Swipe down to switch character
    if (this.state === 'BATTLE' && this.battleActive) {
      const nextIdx = this.findNextAvailableCharacter();
      if (nextIdx !== -1) this.handleSwitch(nextIdx);
    }
  }

  findNextAvailableCharacter() {
    for (let i = 0; i < this.playerTeamData.length; i++) {
      if (i !== this.activePlayerIdx &&
          this.playerTeamData[i].currentHp > 0 &&
          !this.combat.switchCooldowns[this.playerTeamData[i].id]) {
        return i;
      }
    }
    return -1;
  }

  async handleCardPlay(cardIndex) {
    if (!this.battleActive) return;
    if (cardIndex >= this.combat.hand.length) return;

    const card = this.combat.hand[cardIndex];
    if (!this.combat.canPlayCard(card)) return;

    if (card.type === 'ultimate' && !this.combat.canUseUltimate(this.playerTeamData[this.activePlayerIdx])) {
      this.ui.showNotification({ text: 'Condition not met!', color: '#FF8888' });
      return;
    }

    const hpBefore = this.enemyTeamData[this.activeEnemyIdx]?.currentHp || 0;
    const success = await this.combat.executeCard(
      cardIndex,
      this.playerTeamData,
      this.activePlayerIdx,
      this.enemyTeamData,
      this.activeEnemyIdx
    );

    if (success) {
      const enemyChar = this.enemyTeamData[this.activeEnemyIdx];
      this.stats.damageDealt += hpBefore - (enemyChar?.currentHp || 0);
      this.ui.updateHealthBar(
        enemyChar.id, enemyChar.currentHp, enemyChar.maxHp,
        false, this.activeEnemyIdx
      );
      this.ui.renderSwitchButtons(this.playerTeamData, this.activePlayerIdx, this.combat.switchCooldowns);
      this.checkBattleEnd();
    }
  }

  handleDodge() {
    if (!this.battleActive) return;
    this.combat.attemptDodge();
  }

  handleSwitch(newIndex) {
    if (!this.battleActive) return;
    const success = this.combat.switchCharacter(newIndex, this.playerTeamData, this.activePlayerIdx);
    if (success) {
      this.ui.renderSwitchButtons(this.playerTeamData, newIndex, this.combat.switchCooldowns);
    }
  }

  handleGrandRush() {
    if (!this.battleActive || !this.combat.grandRushReady || this.grandRushPending) return;
    this.grandRushPending = true;

    this.ui.showGrandRushSelector(symbol => {
      this.playerGrandRushSymbol = symbol;
      // Enemy picks simultaneously
      const enemySymbols = ['sword', 'devilfruit', 'haki', 'fist'];
      const enemySymbol = enemySymbols[Math.floor(Math.random() * enemySymbols.length)];

      this.combat.executeGrandRush(
        this.playerTeamData,
        this.enemyTeamData,
        this.activeEnemyIdx,
        symbol,
        enemySymbol
      ).then(() => {
        this.grandRushPending = false;
        this.ui.updateGrandRushMeter(0);
        this.checkBattleEnd();

        // Update all HP bars
        this.enemyTeamData.forEach((c, i) => {
          this.ui.updateHealthBar(c.id, c.currentHp, c.maxHp, false, i);
          if (c.currentHp <= 0) this.ui.markCharacterDefeated(false, i);
        });
      });
    });
  }

  // =================== BATTLE LOGIC ===================

  handleCharacterDefeated(data) {
    const { isPlayer, charId } = data;
    const team = isPlayer ? this.playerTeamData : this.enemyTeamData;
    const idx = team.findIndex(c => c.id === charId);
    if (idx === -1) return;

    team[idx].currentHp = 0;
    this.ui.updateHealthBar(charId, 0, team[idx].maxHp, isPlayer, idx);
    this.ui.markCharacterDefeated(isPlayer, idx);

    this.gameScene.createImpactEffect(
      isPlayer ? this.gameScene.basePlayerPos : this.gameScene.baseEnemyPos,
      0xFF4400, 1.5
    );

    if (isPlayer) {
      this.ui.showNotification({ text: `${team[idx].name} is down!`, color: '#FF4444' });
      // Auto-switch to next available
      const nextIdx = this.playerTeamData.findIndex((c, i) => i !== idx && c.currentHp > 0);
      if (nextIdx !== -1) {
        setTimeout(() => {
          this.activePlayerIdx = nextIdx;
          this.gameScene.setPlayerCharacter(this.playerTeamData[nextIdx].id, false);
          this.ui.setActivePortrait(true, nextIdx);
          this.combat.initHand(this.playerTeamData[nextIdx]);
          this.ui.renderSwitchButtons(this.playerTeamData, nextIdx, this.combat.switchCooldowns);
        }, 600);
      }
    } else {
      this.ui.showNotification({ text: `${team[idx].name} defeated!`, color: '#FFD700', isEnemy: true });
      const nextIdx = this.enemyTeamData.findIndex((c, i) => i !== idx && c.currentHp > 0);
      if (nextIdx !== -1) {
        setTimeout(() => {
          this.activeEnemyIdx = nextIdx;
          this.gameScene.setPlayerCharacter(this.enemyTeamData[nextIdx].id, true);
          this.ui.setActivePortrait(false, nextIdx);
          this.ai.reset(this.enemyTeamData[nextIdx]);
        }, 800);
      }
    }

    this.checkBattleEnd();
  }

  checkBattleEnd() {
    const playerAlive = this.playerTeamData.some(c => c.currentHp > 0);
    const enemyAlive = this.enemyTeamData.some(c => c.currentHp > 0);

    if (!playerAlive || !enemyAlive) {
      setTimeout(() => this.endBattle(!playerAlive ? 'lose' : 'win'), 1200);
    }
  }

  endBattle(result) {
    this.battleActive = false;
    this.state = 'RESULT';
    this.ui.showResult(result === 'win', this.stats);

    if (result === 'win') {
      this.gameScene.createGrandRushEffect();
      this.ui.flashScreen('#FFD700', 500);
    } else {
      this.ui.flashScreen('#FF0000', 500);
    }
  }

  updateBattleTimer() {
    const el = document.getElementById('battle-timer');
    if (!el) return;
    const min = Math.floor(this.battleTimer / 60);
    const sec = Math.floor(this.battleTimer % 60);
    el.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  // =================== MAIN LOOP ===================

  loop(timestamp) {
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    // Always render scene
    if (this.gameScene) {
      this.gameScene.update(delta);
    }

    // Battle update
    if (this.state === 'BATTLE' && this.battleActive) {
      this.battleTimer += delta;
      if (Math.floor(this.battleTimer) > Math.floor(this.battleTimer - delta)) {
        this.updateBattleTimer();
      }

      const activePlayer = this.playerTeamData[this.activePlayerIdx];
      const activeEnemy = this.enemyTeamData[this.activeEnemyIdx];

      // Update combat system
      this.combat.update(delta, this.playerTeamData, this.activePlayerIdx, this.enemyTeamData, this.activeEnemyIdx);

      // Update switch cooldown display
      if (Math.random() < 0.1) {
        this.ui.renderSwitchButtons(this.playerTeamData, this.activePlayerIdx, this.combat.switchCooldowns);
      }

      // Update AI
      if (activeEnemy && activeEnemy.currentHp > 0 && !this.grandRushPending) {
        this.ai.update(delta, this.enemyTeamData, this.activeEnemyIdx, this.playerTeamData, this.activePlayerIdx);
      }
    }

    requestAnimationFrame(t => this.loop(t));
  }
}

// Start game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new OnePieceLegends();
});
