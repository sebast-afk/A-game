// One Piece Legends - Enemy AI System

class EnemyAI {
  constructor(scene, combat) {
    this.scene = scene;
    this.combat = combat;

    // AI state
    this.stamina = 60;
    this.maxStamina = 100;
    this.staminaRegen = 10;

    this.hand = [];
    this.maxHandSize = 4;
    this.cardDrawTimer = 0;
    this.cardDrawInterval = 3.0;

    this.actionTimer = 0;
    this.minActionInterval = 1.8;
    this.maxActionInterval = 3.5;
    this.nextActionTime = 2.5;

    this.grandRushMeter = 0;
    this.maxGrandRushMeter = 100;
    this.grandRushReady = false;

    this.isAttacking = false;
    this.stunTimer = 0;

    this.difficulty = 'normal'; // easy, normal, hard
    this.difficultyMultipliers = {
      easy:   { reactionTime: 1.8, missFactor: 0.35, staminaRegen: 0.7 },
      normal: { reactionTime: 1.0, missFactor: 0.15, staminaRegen: 1.0 },
      hard:   { reactionTime: 0.7, missFactor: 0.05, staminaRegen: 1.3 }
    };

    this.callbacks = {};
  }

  on(event, cb) { this.callbacks[event] = cb; }
  emit(event, data) { if (this.callbacks[event]) this.callbacks[event](data); }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  initHand(charData) {
    this.hand = [];
    const types = ['strike', 'strike', 'skill', 'special'];
    types.forEach(type => {
      if (this.hand.length < this.maxHandSize) {
        this.hand.push(this.createCard(charData, type));
      }
    });
  }

  createCard(charData, forceType = null) {
    const weights = { strike: 45, skill: 20, special: 25, ultimate: 10 };
    let type = forceType;
    if (!type) {
      const roll = Math.random() * 100;
      let acc = 0;
      for (const [t, w] of Object.entries(weights)) {
        acc += w;
        if (roll < acc) { type = t; break; }
      }
      if (!type) type = 'strike';
    }
    const arts = charData.arts[type];
    if (!arts) return this.createCard(charData, 'strike');
    return { ...arts, type };
  }

  update(delta, enemyTeam, activeEnemyIdx, playerTeam, activePlayerIdx) {
    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      return;
    }

    const mult = this.difficultyMultipliers[this.difficulty];

    // Stamina regen
    this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegen * mult.staminaRegen * delta);

    // Card draw
    this.cardDrawTimer += delta;
    if (this.cardDrawTimer >= this.cardDrawInterval && this.hand.length < this.maxHandSize) {
      this.cardDrawTimer = 0;
      const activeChar = enemyTeam[activeEnemyIdx];
      if (activeChar) this.hand.push(this.createCard(activeChar));
    }

    // Action decision
    this.actionTimer += delta;
    const adjustedInterval = this.nextActionTime * mult.reactionTime;

    if (this.actionTimer >= adjustedInterval && !this.isAttacking) {
      this.actionTimer = 0;
      this.nextActionTime = this.minActionInterval + Math.random() * (this.maxActionInterval - this.minActionInterval);
      this.decideAction(enemyTeam, activeEnemyIdx, playerTeam, activePlayerIdx);
    }

    // Grand Rush
    if (this.grandRushReady && !this.isAttacking && Math.random() < 0.3 * delta) {
      this.activateGrandRush(enemyTeam, playerTeam, activePlayerIdx);
    }
  }

  decideAction(enemyTeam, activeEnemyIdx, playerTeam, activePlayerIdx) {
    const enemyChar = enemyTeam[activeEnemyIdx];
    const playerChar = playerTeam[activePlayerIdx];
    if (!enemyChar || !playerChar || enemyChar.currentHp <= 0) return;

    // Miss chance
    const mult = this.difficultyMultipliers[this.difficulty];
    if (Math.random() < mult.missFactor) return;

    const hpRatio = enemyChar.currentHp / enemyChar.maxHp;

    // Consider switching if health is low and another character has more HP
    if (hpRatio < 0.3) {
      const canSwitch = enemyTeam.some((c, i) => i !== activeEnemyIdx && c && c.currentHp > enemyChar.currentHp);
      if (canSwitch && Math.random() < 0.5) {
        this.switchToStronger(enemyTeam, activeEnemyIdx);
        return;
      }
    }

    // Choose best card to play
    const bestCard = this.chooseBestCard(enemyChar, playerChar);
    if (bestCard !== null) {
      this.executeAICard(bestCard, enemyTeam, activeEnemyIdx, playerTeam, activePlayerIdx);
    }
  }

  chooseBestCard(enemyChar, playerChar) {
    if (this.hand.length === 0) return null;

    const playerHpRatio = playerChar.currentHp / playerChar.maxHp;
    const enemyHpRatio = enemyChar.currentHp / enemyChar.maxHp;

    // Prefer ultimate/special when player is low
    let priority = ['strike', 'skill', 'special', 'ultimate'];
    if (playerHpRatio < 0.4) priority = ['special', 'ultimate', 'strike', 'skill'];
    if (playerHpRatio < 0.2) priority = ['ultimate', 'special', 'strike', 'skill'];
    if (enemyHpRatio < 0.4) priority = ['skill', 'special', 'ultimate', 'strike'];

    for (const type of priority) {
      const idx = this.hand.findIndex(c => c.type === type && this.stamina >= c.staminaCost);
      if (idx !== -1) return idx;
    }

    // Use any affordable card
    const idx = this.hand.findIndex(c => this.stamina >= c.staminaCost);
    return idx !== -1 ? idx : null;
  }

  async executeAICard(cardIndex, enemyTeam, activeEnemyIdx, playerTeam, activePlayerIdx) {
    const card = this.hand[cardIndex];
    const enemyChar = enemyTeam[activeEnemyIdx];
    const playerChar = playerTeam[activePlayerIdx];
    if (!card || !enemyChar || !playerChar) return;
    if (this.stamina < card.staminaCost) return;

    this.stamina -= card.staminaCost;
    this.isAttacking = true;
    this.hand.splice(cardIndex, 1);

    // Grand Rush meter
    const grGain = { strike: 6, skill: 3, special: 15, ultimate: 0 }[card.type] || 5;
    this.grandRushMeter = Math.min(this.maxGrandRushMeter, this.grandRushMeter + grGain);
    this.grandRushReady = this.grandRushMeter >= this.maxGrandRushMeter;

    let damage = card.damage || 0;
    damage = Math.floor(damage * (enemyChar.power / 80));

    switch (card.type) {
      case 'strike': await this.executeAIStrike(card, damage, enemyChar, playerChar, playerTeam, activePlayerIdx); break;
      case 'skill': await this.executeAISkill(card, enemyChar); break;
      case 'special': await this.executeAISpecial(card, damage, enemyChar, playerChar, playerTeam, activePlayerIdx); break;
      case 'ultimate': await this.executeAIUltimate(card, damage, enemyChar, playerChar, playerTeam, activePlayerIdx); break;
    }

    this.isAttacking = false;
    // Replenish hand
    setTimeout(() => {
      if (this.hand.length < this.maxHandSize) {
        this.hand.push(this.createCard(enemyChar));
      }
    }, 500);
  }

  async executeAIStrike(card, damage, enemyChar, playerChar, playerTeam, activePlayerIdx) {
    const rushX = this.scene.basePlayerPos.x + 2.5;
    await this.scene.moveCharacterTo(true, rushX, 0.22);

    const comboHits = card.comboCount || 3;
    const dmgPerHit = Math.floor(damage / comboHits);

    for (let i = 0; i < comboHits; i++) {
      // Check if player dodged
      if (this.combat.playerInvincible) {
        await new Promise(r => setTimeout(r, 150));
        continue;
      }
      await new Promise(r => setTimeout(r, 150));

      const hitPos = this.scene.characterMeshes.player?.position || this.scene.basePlayerPos;
      this.scene.createSlashEffect(hitPos.clone(), new THREE.Color(card.color || '#FF4444'), 1);
      this.scene.createImpactEffect(hitPos.clone(), new THREE.Color(card.color || '#FF4444'), 0.6);
      this.scene.shakeCharacter(false, 0.18);

      const defReduction = 0.15 + (playerChar.defense / 100) * 0.2;
      const finalDmg = Math.max(1, Math.floor(dmgPerHit * (1 - defReduction)));
      playerChar.currentHp = Math.max(0, playerChar.currentHp - finalDmg);

      this.emit('playerDamaged', { charId: playerChar.id, damage: finalDmg, hp: playerChar.currentHp });
    }

    await this.scene.returnCharacterToBase(true, 0.3);
  }

  async executeAISkill(card, enemyChar) {
    this.scene.spawnEffect(
      this.scene.characterMeshes.enemy?.position || this.scene.baseEnemyPos,
      new THREE.Color(card.color || '#44FF44'), 1.0
    );
    await new Promise(r => setTimeout(r, 500));
    // Skill effects for AI are mostly visual
    this.emit('aiSkillUsed', card.name);
  }

  async executeAISpecial(card, damage, enemyChar, playerChar, playerTeam, activePlayerIdx) {
    if (this.combat.playerInvincible) { await new Promise(r => setTimeout(r, 800)); return; }

    const enemyPos = this.scene.characterMeshes.enemy?.position || this.scene.baseEnemyPos;
    const playerPos = this.scene.characterMeshes.player?.position || this.scene.basePlayerPos;

    this.scene.createBeamEffect(enemyPos.clone(), playerPos.clone(), new THREE.Color(card.color || '#FF4400'));
    await new Promise(r => setTimeout(r, 500));
    this.scene.createImpactEffect(playerPos.clone(), new THREE.Color(card.color || '#FF4400'), 1.4);
    this.scene.shakeCharacter(false, 0.5);

    const defReduction = 0.15 + (playerChar.defense / 100) * 0.2;
    const finalDmg = Math.max(1, Math.floor(damage * (1 - defReduction)));
    playerChar.currentHp = Math.max(0, playerChar.currentHp - finalDmg);
    this.emit('playerDamaged', { charId: playerChar.id, damage: finalDmg, hp: playerChar.currentHp });
  }

  async executeAIUltimate(card, damage, enemyChar, playerChar, playerTeam, activePlayerIdx) {
    if (this.combat.playerInvincible) { await new Promise(r => setTimeout(r, 1200)); return; }

    this.scene.startCinematicMode('ultimate');
    await new Promise(r => setTimeout(r, 500));

    const playerPos = this.scene.characterMeshes.player?.position || this.scene.basePlayerPos;
    this.scene.createUltimateEffect(playerPos.clone(), new THREE.Color(card.color || '#FFAA00'));
    await new Promise(r => setTimeout(r, 700));

    const defReduction = 0.15 + (playerChar.defense / 100) * 0.2;
    const finalDmg = Math.max(1, Math.floor(damage * (1 - defReduction)));
    playerChar.currentHp = Math.max(0, playerChar.currentHp - finalDmg);
    this.scene.shakeCharacter(false, 0.8);
    this.emit('playerDamaged', { charId: playerChar.id, damage: finalDmg, hp: playerChar.currentHp });
  }

  activateGrandRush(enemyTeam, playerTeam, activePlayerIdx) {
    this.grandRushMeter = 0;
    this.grandRushReady = false;
    const symbols = ['sword', 'devilfruit', 'haki', 'fist'];
    const chosenSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    this.emit('enemyGrandRush', { symbol: chosenSymbol, enemyTeam, playerTeam, activePlayerIdx });
  }

  switchToStronger(enemyTeam, currentIndex) {
    let bestIdx = -1;
    let bestHp = 0;
    enemyTeam.forEach((c, i) => {
      if (i !== currentIndex && c && c.currentHp > bestHp) {
        bestHp = c.currentHp;
        bestIdx = i;
      }
    });
    if (bestIdx !== -1) {
      this.emit('aiSwitch', bestIdx);
    }
  }

  applyStun(duration) {
    this.stunTimer = duration / 1000;
    this.isAttacking = false;
  }

  reset(charData) {
    this.stamina = 60;
    this.grandRushMeter = 0;
    this.grandRushReady = false;
    this.isAttacking = false;
    this.stunTimer = 0;
    this.actionTimer = 0;
    this.cardDrawTimer = 0;
    this.hand = [];
    if (charData) this.initHand(charData);
  }
}
