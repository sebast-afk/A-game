// One Piece Legends - Main Game Controller

class OnePieceLegends {
  constructor() {
    // Save & Systems
    this.save = null;
    this.gacha = null;
    this.progression = null;
    this.story = null;
    this.pvpSystem = null;
    this.missions = null;
    this.eventsSystem = null;

    // Game state
    this.state = 'MENU';
    this.gameMode = 'story';

    // Battle state
    this.playerTeam = [];
    this.selectableChars = {};
    this.enemyTeamIds = [];
    this.playerTeamData = [];
    this.enemyTeamData = [];
    this.activePlayerIdx = 0;
    this.activeEnemyIdx = 0;
    this.stats = { damageDealt: 0, maxCombo: 0, grandRushUsed: false, specialsUsed: 0, switchCount: 0, vanishCount: 0 };
    this.battleActive = false;
    this.battleTimer = 0;
    this.grandRushPending = false;
    this.playerGrandRushSymbol = null;
    this.enemyStunTimer = 0;

    // Three.js systems (may be null in screens without canvas)
    this.gameScene = null;
    this.combat = null;
    this.ai = null;
    this.ui = null;

    // Context
    this.currentSagaId = null;
    this.currentChapter = null;
    this.pvpOpponent = null;
    this.missionTab = 'daily';
    this._pendingEventId = null;
    this._pendingStageIdx = 0;

    this.enemyRosters = [
      { name: 'Marine Trio',       ids: ['usopp', 'nami', 'law'],   difficulty: 'easy' },
      { name: 'Rival Pirates',     ids: ['sanji', 'nami', 'usopp'], difficulty: 'normal' },
      { name: 'Straw Hat Rivals',  ids: ['zoro', 'sanji', 'nami'],  difficulty: 'normal' },
      { name: 'Worst Generation',  ids: ['law', 'zoro', 'luffy'],   difficulty: 'hard' },
    ];

    this.init();
  }

  init() {
    // Load save data first
    this.save = SaveState.load();

    // Instantiate all game systems
    this.gacha       = new GachaSystem(this.save);
    this.progression = new ProgressionSystem(this.save);
    this.story       = new StorySystem(this.save);
    this.pvpSystem   = new PVPSystem(this.save);
    this.missions    = new MissionsSystem(this.save);
    this.eventsSystem = new EventsSystem(this.save);
    this.ui          = new UIManager();

    // Reset daily/weekly missions
    this.missions.checkAndResetDaily();
    this.missions.checkAndResetWeekly();

    // Initialize Three.js only if canvas exists
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      this.gameScene = new GameScene(canvas);
      this.combat    = new CombatSystem(this.gameScene, this.ui);
      this.ai        = new EnemyAI(this.gameScene, this.combat);
      this.wireEvents();
      this.setupInput();
      this.gameScene.update(0);
    }

    // Show main menu
    this.ui.showScreen('main-menu');
    this.state = 'MENU';
    this.ui.updateResources(this.save);

    // Mission badge
    this.updateMissionBadge();

    // Login bonus (check if new day)
    const loginResult = SaveState.checkLoginBonus(this.save);
    if (loginResult) {
      // Show the banner hint
      const loginBar = document.getElementById('login-bonus-bar');
      if (loginBar) loginBar.classList.remove('hidden');
      // Auto-show modal after short delay
      setTimeout(() => this.showLoginBonus(), 800);
    }

    // Game loop
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  updateMissionBadge() {
    const badge = document.getElementById('nav-mission-badge');
    if (badge) {
      const hasUnclaimed = this.missions.hasUnclaimedRewards();
      badge.style.display = hasUnclaimed ? 'flex' : 'none';
    }
  }

  // =================== NAVIGATION ===================

  nav(screenId) {
    switch (screenId) {
      case 'main-menu':
        this.state = 'MENU';
        this.battleActive = false;
        this.ui.showScreen('main-menu');
        this.ui.updateResources(this.save);
        this.updateMissionBadge();
        break;

      case 'story':
        this.ui.showScreen('story');
        this.ui.renderStoryScreen(this.save, this.story, sagaId => this.openSaga(sagaId));
        break;

      case 'character-select':
        // Called from main menu battle button directly
        this.gameMode = 'story';
        this.startCharacterSelect();
        break;

      case 'battle':
        this.gameMode = 'story';
        this.startCharacterSelect();
        break;

      case 'pvp':
        this.ui.showScreen('pvp');
        this.ui.renderPvPScreen(this.save, this.pvpSystem);
        break;

      case 'summons':
        this.ui.showScreen('summons');
        this.ui.renderSummonsScreen(BANNERS, this.save);
        this.ui.updateResources(this.save);
        break;

      case 'crew':
        this.ui.showScreen('crew');
        this.ui.renderCrewScreen(this.save, charId => this.openCharDetail(charId));
        break;

      case 'missions':
        this.ui.showScreen('missions');
        this.ui.renderMissionsScreen(this.save, this.missions, this.missionTab);
        break;

      case 'events':
        this.ui.showScreen('events');
        this.ui.renderEventsScreen(
          this.eventsSystem.getActiveEvents(),
          this.save,
          this.eventsSystem,
          eventId => this.openEvent(eventId)
        );
        break;

      case 'shop':
        this.ui.showScreen('shop');
        this.ui.updateResources(this.save);
        break;

      default:
        this.ui.showScreen(screenId);
    }
  }

  // =================== LOGIN BONUS ===================

  showLoginBonus() {
    this.ui.showLoginBonus(
      this.save,
      () => this.claimLoginBonus(),
      () => this.closeLoginBonus()
    );
  }

  claimLoginBonus() {
    const result = this.missions.claimLoginBonus();
    this.ui.closeLoginBonusModal();
    if (result) {
      let msg = '🎁 Login Bonus: ';
      if (result.gems) msg += `💎${result.gems} `;
      if (result.tickets) msg += `🎫×${result.tickets} `;
      if (result.stones) msg += `🪨×${result.stones}`;
      this.ui.showToast(msg.trim(), '#FFD700');
      this.ui.updateResources(this.save);
      const loginBar = document.getElementById('login-bonus-bar');
      if (loginBar) loginBar.classList.add('hidden');
    } else {
      this.ui.showToast('Already claimed today!', '#FF8888');
    }
  }

  closeLoginBonus() {
    this.ui.closeLoginBonusModal();
  }

  // =================== STORY ===================

  openSaga(sagaId) {
    this.currentSagaId = sagaId;
    this.ui.renderChapterSelect(sagaId, this.save, this.story,
      (sid, chapter) => this.startStoryChapter(sid, chapter)
    );
    this.ui.showScreen('chapter-select');
  }

  startStoryChapter(sagaId, chapter) {
    this.currentSagaId = sagaId;
    this.currentChapter = chapter;
    this.gameMode = 'story';

    if (chapter.dialogue && chapter.dialogue.length > 0) {
      this.ui.showDialogue(chapter.dialogue, () => this.launchStoryBattle(chapter));
    } else {
      this.launchStoryBattle(chapter);
    }
  }

  launchStoryBattle(chapter) {
    const enemyIds = (chapter.enemies || ['usopp', 'nami', 'chopper']).slice(0, 3);
    while (enemyIds.length < 3) enemyIds.push(enemyIds[0]);
    this.enemyTeamIds = enemyIds.map(id => ALL_CHARACTERS[id] ? id : 'usopp');
    this.startCharacterSelect();
  }

  onStoryBattleComplete(won) {
    if (!won || !this.currentChapter || !this.currentSagaId) return;
    // completeChapter already applies rewards internally and returns the rewards object
    const rewards = this.story.completeChapter(this.currentSagaId, this.currentChapter.id);
    if (rewards) {
      let msg = '📖 Chapter Complete! ';
      if (rewards.gems) msg += `💎${rewards.gems}`;
      if (rewards.tickets) msg += ` 🎫×${rewards.tickets}`;
      this.ui.showToast(msg.trim());
      this.ui.updateResources(this.save);
    }
    this.missions.trackEvent('chapters', 1);
  }

  // =================== PVP ===================

  startPvPBattle() {
    this.gameMode = 'pvp';
    this.pvpOpponent = this.pvpSystem.getOpponent(this.save.pvp.rating);
    const ids = this.pvpOpponent.team.slice(0, 3);
    while (ids.length < 3) ids.push(ids[0]);
    this.enemyTeamIds = ids.map(id => ALL_CHARACTERS[id] ? id : 'zoro');
    this.startCharacterSelect();
  }

  onPvPBattleComplete(playerWon) {
    if (!this.pvpOpponent) return;
    const result = this.pvpSystem.recordResult(playerWon, this.pvpOpponent);
    this.ui.updateResources(this.save);
    this.missions.trackEvent('pvp_wins', playerWon ? 1 : 0);

    this.ui.showPvPResult(result,
      () => this.startPvPBattle(),
      () => this.nav('pvp')
    );
  }

  claimSeasonRewards() {
    const rewards = this.pvpSystem.claimSeasonRewards();
    if (!rewards) {
      this.ui.showToast('Season rewards already claimed!', '#FF8888');
      return;
    }
    let msg = '🏆 Season Reward: ';
    if (rewards.gems) msg += `💎${rewards.gems} `;
    if (rewards.tickets) msg += `🎫×${rewards.tickets}`;
    this.ui.showToast(msg.trim());
    this.ui.updateResources(this.save);
  }

  // =================== SUMMONS ===================

  doSummon(bannerId, count) {
    const banner = BANNERS.find(b => b.id === bannerId);
    if (!banner) return;
    const cost = count === 1 ? (banner.singleCost || 100) : (banner.tenCost || 1000);

    if (this.save.gems < cost) {
      this.ui.showToast(`Not enough gems! Need ${cost}💎`, '#FF4444');
      return;
    }

    const results = this.gacha.summon(bannerId, count);
    if (!results) {
      this.ui.showToast('Summon failed!', '#FF4444');
      return;
    }

    // Process each result
    results.forEach(r => {
      const alreadyOwned = !!this.save.ownedCharacters[r.id];
      SaveState.addCharacter(this.save, r.id);
      r.isNew = !alreadyOwned;
      r.isDuplicate = alreadyOwned;
    });

    this.ui.updateResources(this.save);
    this.ui.showSummonResults(results, banner);
    this.missions.trackEvent('summons', count);
    SaveState.save(this.save);
  }

  doStepUp(bannerId) {
    const results = this.gacha.summonStepUp(bannerId);
    if (!results) {
      this.ui.showToast('Step-Up failed or complete!', '#FF8888');
      return;
    }
    const banner = BANNERS.find(b => b.id === bannerId);
    results.forEach(r => {
      const alreadyOwned = !!this.save.ownedCharacters[r.id];
      SaveState.addCharacter(this.save, r.id);
      r.isNew = !alreadyOwned;
      r.isDuplicate = alreadyOwned;
    });
    this.ui.updateResources(this.save);
    this.ui.showSummonResults(results, banner);
    this.missions.trackEvent('summons', 10);
    SaveState.save(this.save);
  }

  // =================== CREW & CHAR DETAIL ===================

  openCharDetail(charId) {
    this.ui.renderCharDetail(charId, this.save, this.progression);
    this.ui.showScreen('char-detail');
  }

  starUpCharacter(charId) {
    const result = SaveState.starUp(this.save, charId);
    if (result) {
      this.ui.showToast(`⭐ Star Up! Now ${this.save.ownedCharacters[charId].stars}★`, '#FFD700');
      this.ui.renderCharDetail(charId, this.save, this.progression);
    } else {
      this.ui.showToast('Not enough fragments!', '#FF8888');
    }
  }

  unlockSoulBoostNode(charId, nodeId) {
    const ok = this.progression.unlockNode(charId, nodeId);
    if (ok) {
      const stones = this.save.inventory.upgradeStones;
      this.ui.showToast(`Soul Boost unlocked! 🪨 ${stones} stones remaining`, '#44AAFF');
      this.ui.renderCharDetail(charId, this.save, this.progression);
    } else {
      this.ui.showToast('Cannot unlock — check requirements!', '#FF8888');
    }
  }

  // =================== MISSIONS ===================

  showMissionTab(tab, btnEl) {
    this.missionTab = tab;
    if (btnEl) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btnEl.classList.add('active');
    }
    this.ui.activateMissionTab(tab);
  }

  claimDailyMission(missionId) {
    const result = this.missions.claimDailyReward(missionId);
    if (result) {
      const gems = result.gems || 0;
      const stones = result.stones || 0;
      let msg = 'Mission claimed!';
      if (gems) msg += ` 💎${gems}`;
      if (stones) msg += ` 🪨${stones}`;
      this.ui.showToast(msg, '#44FF44');
      this.ui.updateResources(this.save);
      this.ui.renderMissionsScreen(this.save, this.missions, 'daily');
      this.updateMissionBadge();
    } else {
      this.ui.showToast('Mission not completed yet!', '#FF8888');
    }
  }

  claimWeeklyMission(missionId) {
    const result = this.missions.claimWeeklyReward(missionId);
    if (result) {
      let msg = `Weekly reward: 💎${result.gems || 0}`;
      if (result.tickets) msg += ` 🎫×${result.tickets}`;
      this.ui.showToast(msg, '#44FF44');
      this.ui.updateResources(this.save);
      this.ui.renderMissionsScreen(this.save, this.missions, 'weekly');
    } else {
      this.ui.showToast('Mission not completed yet!', '#FF8888');
    }
  }

  // =================== EVENTS ===================

  openEvent(eventId) {
    this.ui.renderEventDetail(eventId, this.save, this.eventsSystem,
      (eid, stageIdx) => this.startEventStage(eid, stageIdx)
    );
    this.ui.showScreen('event-detail');
  }

  startEventStage(eventId, stageIdx) {
    this.gameMode = 'event';
    this._pendingEventId = eventId;
    this._pendingStageIdx = stageIdx;
    const stageInfo = this.eventsSystem.startEventStage(eventId, stageIdx);
    if (!stageInfo) return;
    this.enemyTeamIds = ['zoro', 'sanji', 'nami'];
    this.startCharacterSelect();
  }

  onEventBattleComplete(won) {
    if (!won || !this._pendingEventId) return;
    const event = EVENTS.find(e => e.id === this._pendingEventId);
    const stages = event?.stages || event?.floors || [];
    const stage = stages[this._pendingStageIdx];
    const stageId = stage?.id || `stage_${this._pendingStageIdx}`;
    this.eventsSystem.completeEventStage(this._pendingEventId, stageId, true);
    if (stage?.rewards) {
      this.eventsSystem.claimEventReward(this._pendingEventId, stageId, stage.rewards);
      let msg = 'Event stage complete!';
      if (stage.rewards.gems) msg += ` 💎${stage.rewards.gems}`;
      this.ui.showToast(msg, '#FFD700');
      this.ui.updateResources(this.save);
    }
  }

  claimEventReward(eventId, stageId, reward) {
    try {
      const rewardObj = typeof reward === 'string' ? JSON.parse(reward) : reward;
      const ok = this.eventsSystem.claimEventReward(eventId, stageId, rewardObj);
      if (ok) {
        let msg = 'Reward claimed!';
        if (rewardObj.gems) msg += ` 💎${rewardObj.gems}`;
        if (rewardObj.tickets) msg += ` 🎫×${rewardObj.tickets}`;
        this.ui.showToast(msg, '#FFD700');
        this.ui.updateResources(this.save);
        this.openEvent(eventId);
      }
    } catch (e) {
      this.ui.showToast('Claim failed', '#FF4444');
    }
  }

  // =================== SHOP ===================

  buyGems(amount, price) {
    // Simulate purchase (in production this would trigger a payment flow)
    SaveState.addGems(this.save, amount);
    this.ui.showToast(`💎 +${amount} Gems added!`, '#FFD700');
    this.ui.updateResources(this.save);
  }

  claimFreeGems() {
    const today = new Date().toDateString();
    if (this.save.freeGemsClaimed === today) {
      this.ui.showToast('Free gems already claimed today! Come back tomorrow.', '#FF8888');
      return;
    }
    this.save.freeGemsClaimed = today;
    SaveState.addGems(this.save, 30);
    this.ui.showToast('💎 +30 Free Gems!', '#FFD700');
    this.ui.updateResources(this.save);
    SaveState.save(this.save);
  }

  // =================== CHARACTER SELECT ===================

  startCharacterSelect() {
    this.playerTeam = [];
    this.state = 'CHARACTER_SELECT';

    // Only allow owned characters
    const ownedIds = Object.keys(this.save.ownedCharacters || {});
    this.selectableChars = {};
    ownedIds.forEach(id => {
      if (ALL_CHARACTERS[id]) this.selectableChars[id] = ALL_CHARACTERS[id];
    });

    // Fallback: give starter chars if nothing owned
    if (Object.keys(this.selectableChars).length === 0) {
      ['luffy', 'zoro', 'sanji'].forEach(id => {
        if (ALL_CHARACTERS[id]) {
          this.selectableChars[id] = ALL_CHARACTERS[id];
          this.save.ownedCharacters[id] = { stars: 1, level: 1, fragments: 0, exp: 0 };
        }
      });
      SaveState.save(this.save);
    }

    this.ui.showScreen('character-select');
    this.ui.buildCharacterSelect(
      this.selectableChars,
      this.playerTeam,
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
    } else {
      this.ui.showToast('Team is full! Deselect a character first.', '#FF8888');
      return;
    }
    this.ui.buildCharacterSelect(
      this.selectableChars,
      this.playerTeam,
      charId => this.handleCharacterSelect(charId),
      () => this.startBattle()
    );
  }

  startBattle() {
    if (this.playerTeam.length < 3) {
      this.ui.showToast('Select 3 characters first!', '#FF4444');
      return;
    }

    if (!this.gameScene) {
      this.ui.showToast('Battle system not ready. Reload the page.', '#FF4444');
      return;
    }

    // Pick enemy team if not already set
    if (!this.enemyTeamIds || this.enemyTeamIds.length < 3) {
      const roster = this.enemyRosters[Math.floor(Math.random() * this.enemyRosters.length)];
      this.enemyTeamIds = roster.ids.map(id => ALL_CHARACTERS[id] ? id : 'zoro');
    }

    // Build player team data with scaled stats
    this.playerTeamData = this.playerTeam.map(id => {
      const base = ALL_CHARACTERS[id];
      const charSave = this.save.ownedCharacters?.[id] || {};
      const scaled = typeof getCharacterScaledStats === 'function'
        ? getCharacterScaledStats(id, charSave.level || 1, charSave.stars || 1)
        : {};
      const maxHp = scaled.hp || base.maxHp;
      return { ...base, power: scaled.power || base.power, speed: scaled.speed || base.speed, defense: scaled.defense || base.defense, maxHp, currentHp: maxHp, isPlayer: true };
    });

    // Build enemy team data
    this.enemyTeamData = this.enemyTeamIds.map(id => {
      const base = ALL_CHARACTERS[id] || ALL_CHARACTERS['zoro'];
      return { ...base, currentHp: base.maxHp, isPlayer: false };
    });

    this.activePlayerIdx = 0;
    this.activeEnemyIdx = 0;
    this.stats = { damageDealt: 0, maxCombo: 0, grandRushUsed: false, specialsUsed: 0, switchCount: 0, vanishCount: 0 };
    this.grandRushPending = false;
    this.battleTimer = 0;
    this.enemyStunTimer = 0;

    this.combat.reset();
    this.ai.reset(this.enemyTeamData[0]);

    const roster = this.enemyRosters[Math.floor(Math.random() * this.enemyRosters.length)];
    this.ai.setDifficulty(roster.difficulty || 'normal');

    this.gameScene.setPlayerCharacter(this.playerTeamData[0].id, false);
    this.gameScene.setPlayerCharacter(this.enemyTeamData[0].id, true);
    this.combat.initHand(this.playerTeamData[0]);

    this.state = 'BATTLE';
    this.ui.showScreen('battle-screen');
    this.buildBattleHUD();

    // Clear pending enemy team so next battle picks fresh
    this.enemyTeamIds = [];

    this.battleActive = false;
    this.ui.showBattleIntro(this.playerTeam, this.enemyTeamData.map(c => c.id), ALL_CHARACTERS, () => {
      this.battleActive = true;
      this.ui.showNotification({ text: 'BATTLE START!', color: '#FFD700' });
    });
  }

  buildBattleHUD() {
    const playerContainer = document.getElementById('player-portraits');
    if (playerContainer) {
      playerContainer.innerHTML = '';
      this.playerTeamData.forEach((char, i) => {
        const div = document.createElement('div');
        div.id = `player-portrait-${i}`;
        div.className = `player-portrait ${i === 0 ? 'active-portrait' : ''}`;
        div.style.borderColor = char.modelColor;
        div.innerHTML = `
          <div class="portrait-inner" style="background:linear-gradient(135deg,${char.modelColor},#000)">
            <div class="portrait-icon">${char.arts?.strike?.icon || char.icon || '?'}</div>
            <div class="portrait-defeat hidden">✕</div>
          </div>
          <div class="hp-bar-container">
            <div id="player-hp-bar-${i}" class="hp-fill" style="width:100%;background:linear-gradient(90deg,#44FF44,#88FF44)"></div>
          </div>
          <div id="player-hp-text-${i}" class="hp-text">${char.maxHp}</div>
        `;
        playerContainer.appendChild(div);
      });
    }

    const enemyContainer = document.getElementById('enemy-portraits');
    if (enemyContainer) {
      enemyContainer.innerHTML = '';
      this.enemyTeamData.forEach((char, i) => {
        const div = document.createElement('div');
        div.id = `enemy-portrait-${i}`;
        div.className = `enemy-portrait ${i === 0 ? 'active-portrait' : ''}`;
        div.style.borderColor = char.modelColor;
        div.innerHTML = `
          <div class="portrait-inner" style="background:linear-gradient(135deg,${char.modelColor},#000)">
            <div class="portrait-icon">${char.arts?.strike?.icon || char.icon || '?'}</div>
            <div class="portrait-defeat hidden">✕</div>
          </div>
          <div class="hp-bar-container">
            <div id="enemy-hp-bar-${i}" class="hp-fill" style="width:100%;background:linear-gradient(90deg,#44FF44,#88FF44)"></div>
          </div>
          <div id="enemy-hp-text-${i}" class="hp-text">${char.maxHp}</div>
        `;
        enemyContainer.appendChild(div);
      });
    }

    this.ui.renderSwitchButtons(this.playerTeamData, this.activePlayerIdx, this.combat.switchCooldowns);
    this.updateBattleTimer();
  }

  // =================== EVENT WIRING ===================

  wireEvents() {
    this.combat.on('staminaUpdate', r => this.ui.updateStaminaBar(r));
    this.combat.on('dodgeGaugeUpdate', r => this.ui.updateDodgeGauge(r));
    this.combat.on('grandRushUpdate', r => {
      this.ui.updateGrandRushMeter(r);
      if (r >= 1 && !this.grandRushPending) this.combat.grandRushReady = true;
    });
    this.combat.on('handUpdate', hand => {
      if (this.state !== 'BATTLE') return;
      this.ui.renderCards(hand, card => this.combat.canPlayCard(card), this.combat.stamina / 100);
    });
    this.combat.on('hpUpdate', data => {
      const team = data.isPlayer ? this.playerTeamData : this.enemyTeamData;
      const idx = team.findIndex(c => c.id === data.charId);
      if (idx !== -1) {
        team[idx].currentHp = data.hp;
        this.ui.updateHealthBar(data.charId, data.hp, data.maxHp, data.isPlayer, idx);
      }
    });
    this.combat.on('characterDefeated', data => this.handleCharacterDefeated(data));
    this.combat.on('notification', data => this.ui.showNotification(data));
    this.combat.on('specialAnnounce', name => this.ui.showSpecialAnnounce(name));
    this.combat.on('ultimateAnnounce', name => this.ui.showUltimateAnnounce(name));
    this.combat.on('comboUpdate', count => {
      if (count > this.stats.maxCombo) this.stats.maxCombo = count;
      this.ui.updateCombo(count);
    });
    this.combat.on('comboEnd', () => this.ui.updateCombo(0));
    this.combat.on('effectUpdate', effects => this.ui.updateEffectIndicators(effects));
    this.combat.on('effectExpired', () => this.ui.updateEffectIndicators(this.combat.activeEffects));
    this.combat.on('dodgeActivated', () => {
      this.ui.flashScreen('#00FFFF', 200);
      this.ui.showNotification({ text: 'VANISH!', color: '#00FFFF' });
      this.stats.vanishCount++;
      this.missions.trackEvent('vanishes', 1);
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
      this.stats.switchCount++;
      this.missions.trackEvent('switches', 1);
    });
    this.combat.on('enemyStunned', duration => {
      this.enemyStunTimer = duration;
      this.ai.applyStun(duration);
    });
    this.combat.on('grandRushStart', () => {
      this.stats.grandRushUsed = true;
      this.ui.flashScreen('#FFD700', 300);
      this.missions.trackEvent('grand_rush', 1);
    });
    this.combat.on('grandRushEnd', data => {
      this.ui.showNotification({ text: `GRAND RUSH! -${data.totalDamage}`, color: '#FFD700', big: true, isEnemy: true });
      this.checkBattleEnd();
    });

    this.ai.on('playerDamaged', data => {
      const char = this.playerTeamData.find(c => c.id === data.charId);
      if (char) {
        char.currentHp = data.hp;
        const idx = this.playerTeamData.indexOf(char);
        this.ui.updateHealthBar(data.charId, data.hp, char.maxHp, true, idx);
        if (data.hp <= 0) this.handleCharacterDefeated({ isPlayer: true, charId: data.charId });
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
          this.gameScene.createImpactEffect(
            this.gameScene.characterMeshes.player?.position || this.gameScene.basePlayerPos,
            new THREE.Color(0xFF4400), 2
          );
        }
      }
      this.ui.showNotification({ text: `ENEMY GRAND RUSH! -${totalDmg}`, color: '#FF4400', big: true });
      if (playerChar.currentHp <= 0) this.handleCharacterDefeated({ isPlayer: true, charId: playerChar.id });
      this.checkBattleEnd();
    });
    this.ai.on('aiSkillUsed', name => {
      this.ui.showNotification({ text: `Enemy: ${name}`, color: '#FF8888', isEnemy: false });
    });
  }

  // =================== INPUT ===================

  setupInput() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      if (!this.touchStart) return;
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20) {
        if (this.state === 'BATTLE' && this.battleActive) this.handleTap();
      } else if (dist > 40) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.handleDodge();
        } else if (dy > 0) {
          this.handleSwipeDown();
        }
      }
      this.touchStart = null;
    }, { passive: false });

    canvas.addEventListener('click', () => {
      if (this.state === 'BATTLE' && this.battleActive) this.handleTap();
    });

    // Global click delegation for all dynamic UI
    document.addEventListener('click', e => {
      // Arts card
      const cardEl = e.target.closest('.arts-card');
      if (cardEl && this.state === 'BATTLE') {
        this.handleCardPlay(parseInt(cardEl.getAttribute('data-card-index')));
        return;
      }
      // Switch button
      const switchBtn = e.target.closest('.switch-btn');
      if (switchBtn && this.state === 'BATTLE') {
        this.handleSwitch(parseInt(switchBtn.getAttribute('data-switch-index')));
        return;
      }
      // Banner pull buttons (summons list)
      const singleBtn = e.target.closest('.banner-single-btn');
      if (singleBtn) { this.doSummon(singleBtn.dataset.banner, 1); return; }
      const tenBtn = e.target.closest('.banner-ten-btn');
      if (tenBtn) { this.doSummon(tenBtn.dataset.banner, 10); return; }
      // Mission claim
      const missionClaimBtn = e.target.closest('.mission-claim-btn');
      if (missionClaimBtn && !missionClaimBtn.disabled) {
        const id = missionClaimBtn.dataset.missionId;
        if (missionClaimBtn.classList.contains('weekly-claim')) {
          this.claimWeeklyMission(id);
        } else {
          this.claimDailyMission(id);
        }
        return;
      }
      // Event stage play
      const stagePlayBtn = e.target.closest('.stage-play-btn');
      if (stagePlayBtn) {
        this.startEventStage(stagePlayBtn.dataset.event, parseInt(stagePlayBtn.dataset.stage));
        return;
      }
      // Event stage claim
      const stageClaimBtn = e.target.closest('.stage-claim-btn');
      if (stageClaimBtn) {
        this.claimEventReward(stageClaimBtn.dataset.event, stageClaimBtn.dataset.stage, stageClaimBtn.dataset.reward);
        return;
      }
      // Soul boost node
      const sbCell = e.target.closest('.sb-cell.sb-available');
      if (sbCell) {
        const charId = document.getElementById('char-detail')?.dataset?.charId;
        if (charId) this.unlockSoulBoostNode(charId, sbCell.dataset.node);
        return;
      }
      // Star up button
      const starUpBtn = e.target.closest('.star-up-btn');
      if (starUpBtn && !starUpBtn.disabled) {
        const charId = document.getElementById('char-detail')?.dataset?.charId;
        if (charId) this.starUpCharacter(charId);
        return;
      }
    });

    // Static buttons
    document.getElementById('dodge-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      if (this.state === 'BATTLE') this.handleDodge();
    });
    document.getElementById('grand-rush-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      if (this.state === 'BATTLE' && this.combat?.grandRushReady && !this.grandRushPending) this.handleGrandRush();
    });
    document.getElementById('play-btn')?.addEventListener('click', () => {
      this.gameMode = 'story';
      this.startCharacterSelect();
    });
    document.getElementById('training-btn')?.addEventListener('click', () => {
      this.gameMode = 'training';
      this.startCharacterSelect();
    });
    document.getElementById('retry-btn')?.addEventListener('click', () => {
      if (this.playerTeam.length >= 3) this.startBattle();
      else this.startCharacterSelect();
    });
  }

  // =================== INPUT HANDLERS ===================

  handleTap() {
    if (!this.battleActive || this.combat.isAttacking) return;
    const rushX = this.gameScene.baseEnemyPos.x - 3;
    this.gameScene.moveCharacterTo(false, rushX, 0.3).then(() => {
      setTimeout(() => this.gameScene.returnCharacterToBase(false, 0.4), 600);
    });
  }

  handleSwipeDown() {
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
    if (!this.battleActive || cardIndex >= this.combat.hand.length) return;
    const card = this.combat.hand[cardIndex];
    if (!this.combat.canPlayCard(card)) {
      this.ui.showNotification({ text: 'Not enough stamina!', color: '#FF8888' });
      return;
    }
    if (card.type === 'ultimate' && !this.combat.canUseUltimate(this.playerTeamData[this.activePlayerIdx])) {
      this.ui.showNotification({ text: 'Condition not met!', color: '#FF8888' });
      return;
    }
    const hpBefore = this.enemyTeamData[this.activeEnemyIdx]?.currentHp || 0;
    const success = await this.combat.executeCard(
      cardIndex, this.playerTeamData, this.activePlayerIdx,
      this.enemyTeamData, this.activeEnemyIdx
    );
    if (success) {
      const enemyChar = this.enemyTeamData[this.activeEnemyIdx];
      this.stats.damageDealt += Math.max(0, hpBefore - (enemyChar?.currentHp || 0));
      if (card.type === 'special' || card.type === 'ultimate') {
        this.stats.specialsUsed++;
        this.missions.trackEvent('specials_used', 1);
      }
      this.ui.updateHealthBar(enemyChar.id, enemyChar.currentHp, enemyChar.maxHp, false, this.activeEnemyIdx);
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
    this.combat.switchCharacter(newIndex, this.playerTeamData, this.activePlayerIdx);
  }

  handleGrandRush() {
    if (!this.battleActive || !this.combat.grandRushReady || this.grandRushPending) return;
    this.grandRushPending = true;
    this.ui.showGrandRushSelector(symbol => {
      this.playerGrandRushSymbol = symbol;
      const enemySymbols = ['sword', 'devilfruit', 'haki', 'fist'];
      const enemySymbol = enemySymbols[Math.floor(Math.random() * enemySymbols.length)];
      this.combat.executeGrandRush(
        this.playerTeamData, this.enemyTeamData,
        this.activeEnemyIdx, symbol, enemySymbol
      ).then(() => {
        this.grandRushPending = false;
        this.ui.updateGrandRushMeter(0);
        this.checkBattleEnd();
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
    const enemyAlive  = this.enemyTeamData.some(c => c.currentHp > 0);
    if (!playerAlive || !enemyAlive) {
      setTimeout(() => this.endBattle(!playerAlive ? 'lose' : 'win'), 1200);
    }
  }

  endBattle(result) {
    this.battleActive = false;
    this.state = 'RESULT';
    const won = result === 'win';

    // Track missions
    this.missions.trackEvent('battles_won', won ? 1 : 0);
    if (won) {
      if (this.stats.maxCombo >= 5) this.missions.trackEvent('combo5', 1);
      if (this.stats.maxCombo >= 10) this.missions.trackEvent('combo10', 1);
      if (this.stats.grandRushUsed) this.missions.trackEvent('grand_rush', 0); // already tracked on use
    }
    this.updateMissionBadge();
    SaveState.save(this.save);

    // Mode-specific completion
    if (this.gameMode === 'pvp') {
      this.onPvPBattleComplete(won);
      return;
    }
    if (this.gameMode === 'event') {
      this.onEventBattleComplete(won);
    }
    if (this.gameMode === 'story' && won) {
      this.onStoryBattleComplete(won);
    }

    this.ui.showResult(won, this.stats);
    if (won) {
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

    if (this.gameScene) this.gameScene.update(delta);

    if (this.state === 'BATTLE' && this.battleActive) {
      this.battleTimer += delta;
      if (Math.floor(this.battleTimer) > Math.floor(this.battleTimer - delta)) {
        this.updateBattleTimer();
      }
      this.combat.update(delta, this.playerTeamData, this.activePlayerIdx, this.enemyTeamData, this.activeEnemyIdx);

      if (Math.random() < 0.1) {
        this.ui.renderSwitchButtons(this.playerTeamData, this.activePlayerIdx, this.combat.switchCooldowns);
      }

      const activeEnemy = this.enemyTeamData[this.activeEnemyIdx];
      if (activeEnemy && activeEnemy.currentHp > 0 && !this.grandRushPending) {
        this.ai.update(delta, this.enemyTeamData, this.activeEnemyIdx, this.playerTeamData, this.activePlayerIdx);
      }
    }

    requestAnimationFrame(t => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new OnePieceLegends();
});
