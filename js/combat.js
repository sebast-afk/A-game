// One Piece Legends - Combat System

class CombatSystem {
  constructor(gameScene, ui) {
    this.scene = gameScene;
    this.ui = ui;

    // Stamina
    this.stamina = 60;
    this.maxStamina = 100;
    this.staminaRegen = 12; // per second
    this.staminaRegenMultiplier = 1.0;

    // Grand Rush
    this.grandRushMeter = 0;
    this.maxGrandRushMeter = 100;
    this.grandRushReady = false;
    this.grandRushActive = false;

    // Vanish / Dodge
    this.dodgeGauge = 0;
    this.maxDodgeGauge = 100;
    this.dodgeFillRate = 25; // per second
    this.dodgeReady = false;
    this.dodgeCooldown = 0;
    this.dodgeActive = false;

    // Cards
    this.hand = [];
    this.maxHandSize = 4;
    this.cardDrawTimer = 0;
    this.cardDrawInterval = 2.5; // seconds between new cards
    this.cardDrawMultiplier = 1.0;
    this.powerShotActive = false;
    this.piercingShot = false;

    // Status effects (player)
    this.activeEffects = {
      attackBoost: null,
      defenseUp: null,
      speedUp: null,
      armor: null,
      cardSpeedUp: null,
      powerShot: null
    };

    // Combo
    this.comboCount = 0;
    this.comboTimer = 0;
    this.maxComboTime = 3.0;
    this.playerInvincible = false;

    // Attack state
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.switchCooldowns = {}; // charId -> seconds remaining
    this.activeSwitchEffect = null;

    this.callbacks = {};
  }

  on(event, cb) { this.callbacks[event] = cb; }
  emit(event, data) { if (this.callbacks[event]) this.callbacks[event](data); }

  initHand(charData) {
    this.hand = [];
    // Start with 2 strike cards + 1 skill + 1 special
    const types = ['strike', 'strike', 'skill', 'special'];
    types.forEach(type => {
      if (this.hand.length < this.maxHandSize) {
        this.hand.push(this.createCard(charData, type));
      }
    });
    this.emit('handUpdate', this.hand);
  }

  createCard(charData, forceType = null) {
    const weights = { strike: 45, skill: 25, special: 20, ultimate: 10 };
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
    return { ...arts, type, charId: charData.id };
  }

  drawCard(charData) {
    if (this.hand.length >= this.maxHandSize) return;
    this.hand.push(this.createCard(charData));
    this.emit('handUpdate', this.hand);
  }

  removeCard(index) {
    this.hand.splice(index, 1);
    this.emit('handUpdate', this.hand);
  }

  canPlayCard(card) {
    if (this.isAttacking) return false;
    if (this.attackCooldown > 0) return false;
    if (this.stamina < card.staminaCost) return false;
    if (card.type === 'ultimate') return true; // already filtered upstream
    return true;
  }

  canUseUltimate(charData) {
    const ult = charData.arts.ultimate;
    if (!ult) return false;
    if (ult.condition === 'always') return true;
    if (ult.condition === 'hpBelow50') return (charData.currentHp / charData.maxHp) < 0.5;
    if (ult.condition === 'hpBelow30') return (charData.currentHp / charData.maxHp) < 0.3;
    return false;
  }

  update(delta, playerTeam, activePlayerIdx, enemyTeam, activeEnemyIdx) {
    // Stamina regen
    const regenRate = this.staminaRegen * this.staminaRegenMultiplier * delta;
    this.stamina = Math.min(this.maxStamina, this.stamina + regenRate);

    // Card draw
    this.cardDrawTimer += delta * this.cardDrawMultiplier;
    if (this.cardDrawTimer >= this.cardDrawInterval && this.hand.length < this.maxHandSize) {
      this.cardDrawTimer = 0;
      const activeChar = playerTeam[activePlayerIdx];
      if (activeChar) this.drawCard(activeChar);
    }

    // Dodge gauge
    if (this.dodgeCooldown > 0) {
      this.dodgeCooldown -= delta;
      if (this.dodgeCooldown <= 0) {
        this.dodgeCooldown = 0;
        this.dodgeGauge = 0;
      }
    } else {
      this.dodgeGauge = Math.min(this.maxDodgeGauge, this.dodgeGauge + this.dodgeFillRate * delta);
      this.dodgeReady = this.dodgeGauge >= this.maxDodgeGauge;
    }

    // Attack cooldown
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.attackCooldown < 0) this.attackCooldown = 0;

    // Combo timer
    if (this.comboCount > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.emit('comboEnd', 0);
      }
    }

    // Switch cooldowns
    Object.keys(this.switchCooldowns).forEach(id => {
      if (this.switchCooldowns[id] > 0) {
        this.switchCooldowns[id] -= delta;
        if (this.switchCooldowns[id] < 0) this.switchCooldowns[id] = 0;
      }
    });

    // Active effects timers
    Object.entries(this.activeEffects).forEach(([key, effect]) => {
      if (effect && effect.duration > 0) {
        effect.duration -= delta * 1000;
        if (effect.duration <= 0) {
          this.activeEffects[key] = null;
          this.emit('effectExpired', key);
          // Revert
          if (key === 'cardSpeedUp') this.cardDrawMultiplier = 1.0;
          if (key === 'cardSpeedUp') this.staminaRegenMultiplier = 1.0;
        }
      }
    });

    // Update UI
    this.emit('staminaUpdate', this.stamina / this.maxStamina);
    this.emit('dodgeGaugeUpdate', this.dodgeGauge / this.maxDodgeGauge);
    this.emit('grandRushUpdate', this.grandRushMeter / this.maxGrandRushMeter);
  }

  async executeCard(cardIndex, playerTeam, activePlayerIdx, enemyTeam, activeEnemyIdx) {
    if (cardIndex >= this.hand.length) return false;
    const card = this.hand[cardIndex];
    if (!this.canPlayCard(card)) return false;

    const playerChar = playerTeam[activePlayerIdx];
    const enemyChar = enemyTeam[activeEnemyIdx];
    if (!playerChar || !enemyChar) return false;

    // Ultimate check
    if (card.type === 'ultimate' && !this.canUseUltimate(playerChar)) {
      this.emit('notification', { text: 'Not ready!', color: '#FF4444' });
      return false;
    }

    // Deduct stamina
    this.stamina -= card.staminaCost;
    this.isAttacking = true;
    this.removeCard(cardIndex);

    // Calculate base damage
    let damage = card.damage || 0;
    const powerMult = (playerChar.power / 80);

    // Apply active attack boost
    if (this.activeEffects.attackBoost) damage *= (1 + this.activeEffects.attackBoost.value);
    if (this.activeEffects.powerShot && card.type === 'special') {
      damage *= 2;
      this.activeEffects.powerShot = null;
      this.emit('notification', { text: 'Thunder Charged!', color: '#FFFF00' });
    }

    damage = Math.floor(damage * powerMult);

    // Execute based on type
    switch (card.type) {
      case 'strike': await this.executeStrike(card, damage, playerChar, enemyChar); break;
      case 'skill': await this.executeSkill(card, playerChar, enemyChar); break;
      case 'special': await this.executeSpecial(card, damage, playerChar, enemyChar); break;
      case 'ultimate': await this.executeUltimate(card, damage, playerChar, enemyChar); break;
    }

    this.isAttacking = false;
    this.attackCooldown = 0.3;

    // Grand Rush meter fill
    const grandRushGain = { strike: 6, skill: 3, special: 15, ultimate: 0 }[card.type] || 5;
    this.grandRushMeter = Math.min(this.maxGrandRushMeter, this.grandRushMeter + grandRushGain);
    this.grandRushReady = this.grandRushMeter >= this.maxGrandRushMeter;

    // Draw replacement card
    const interval = setTimeout(() => {
      this.drawCard(playerChar);
    }, 400 / this.cardDrawMultiplier);

    return true;
  }

  async executeStrike(card, damage, playerChar, enemyChar) {
    const rushX = this.scene.baseEnemyPos.x - 2.5;
    await this.scene.moveCharacterTo(false, rushX, 0.22);

    const comboHits = card.comboCount || 3;
    const dmgPerHit = Math.floor(damage / comboHits);

    for (let i = 0; i < comboHits; i++) {
      await new Promise(r => setTimeout(r, 130));
      const hitPos = this.scene.characterMeshes.enemy?.position || this.scene.baseEnemyPos;
      this.scene.createSlashEffect(hitPos.clone(), new THREE.Color(card.color || '#FF4444'), -1);
      this.scene.createImpactEffect(hitPos.clone(), new THREE.Color(card.color || '#FF4444'), 0.7);
      this.scene.shakeCharacter(true, 0.2);

      const finalDmg = this.applyDefense(dmgPerHit, enemyChar);
      this.dealDamage(finalDmg, enemyChar, false);
      this.emit('notification', { text: `-${finalDmg}`, color: card.color || '#FF4444', isEnemy: true });

      this.comboCount++;
      this.comboTimer = this.maxComboTime;
      this.emit('comboUpdate', this.comboCount);
    }

    await this.scene.returnCharacterToBase(false, 0.3);
  }

  async executeSkill(card, playerChar, enemyChar) {
    this.scene.spawnEffect(
      this.scene.characterMeshes.player?.position || this.scene.basePlayerPos,
      new THREE.Color(card.color || '#44FF44'),
      1.2
    );
    await new Promise(r => setTimeout(r, 300));

    switch (card.effect) {
      case 'attackBoost':
        this.activeEffects.attackBoost = { value: card.effectValue || 0.3, duration: card.duration };
        this.emit('notification', { text: `ATK +${Math.floor((card.effectValue || 0.3) * 100)}%!`, color: '#FF8888' });
        break;
      case 'armor':
        this.activeEffects.armor = { duration: card.duration };
        this.emit('notification', { text: 'Super Armor!', color: '#88FF88' });
        break;
      case 'cardSpeedUp':
        this.activeEffects.cardSpeedUp = { duration: card.duration };
        this.cardDrawMultiplier = 1.8;
        this.staminaRegenMultiplier = 1.4;
        this.emit('notification', { text: 'Speed Cook!', color: '#FFCC00' });
        break;
      case 'teleportStun':
        this.scene.shakeCharacter(true, 0.5);
        this.scene.spawnEffect(this.scene.characterMeshes.enemy?.position || this.scene.baseEnemyPos, 0x6666FF, 1.5);
        this.emit('notification', { text: 'Stunned!', color: '#9999FF', isEnemy: true });
        // Enemy stun
        this.emit('enemyStunned', card.stunDuration || 2000);
        break;
      case 'powerShot':
        this.activeEffects.powerShot = { duration: 15000 };
        this.emit('notification', { text: 'Thunder Charged!', color: '#FFFF00' });
        break;
      case 'piercingShot':
        this.piercingShot = true;
        this.emit('notification', { text: 'Piercing Shot!', color: '#AACC44' });
        break;
    }
    this.emit('effectUpdate', this.activeEffects);
  }

  async executeSpecial(card, damage, playerChar, enemyChar) {
    this.scene.startCinematicMode('special');
    await new Promise(r => setTimeout(r, 300));

    const playerPos = this.scene.characterMeshes.player?.position || this.scene.basePlayerPos;
    const enemyPos = this.scene.characterMeshes.enemy?.position || this.scene.baseEnemyPos;

    // Visual effect based on character
    this.scene.createBeamEffect(playerPos.clone(), enemyPos.clone(), new THREE.Color(card.color || '#FF4400'));
    await new Promise(r => setTimeout(r, 200));
    this.scene.createImpactEffect(enemyPos.clone(), new THREE.Color(card.color || '#FF4400'), 1.5);

    await new Promise(r => setTimeout(r, 400));

    const finalDmg = this.applyDefense(damage, enemyChar);
    this.dealDamage(finalDmg, enemyChar, false);
    this.scene.shakeCharacter(true, 0.5);
    this.emit('notification', { text: `-${finalDmg}`, color: card.color || '#FF4400', isEnemy: true, big: true });
    this.emit('specialAnnounce', card.name);
  }

  async executeUltimate(card, damage, playerChar, enemyChar) {
    this.scene.startCinematicMode('ultimate');
    await new Promise(r => setTimeout(r, 400));

    const enemyPos = this.scene.characterMeshes.enemy?.position || this.scene.baseEnemyPos;
    this.scene.createUltimateEffect(enemyPos.clone(), new THREE.Color(card.color || '#FFAA00'));

    await new Promise(r => setTimeout(r, 600));

    const finalDmg = this.applyDefense(damage, enemyChar);
    this.dealDamage(finalDmg, enemyChar, false);
    this.scene.shakeCharacter(true, 0.8);
    this.emit('notification', { text: `-${finalDmg}`, color: card.color || '#FFAA00', isEnemy: true, big: true });
    this.emit('ultimateAnnounce', card.name);
  }

  async executeGrandRush(playerTeam, enemyTeam, activeEnemyIdx, playerSymbol, enemySymbol) {
    if (!this.grandRushReady || this.grandRushActive) return;
    this.grandRushActive = true;
    this.grandRushReady = false;
    this.grandRushMeter = 0;

    this.scene.startCinematicMode('grandRush');
    this.scene.createGrandRushEffect();
    this.emit('grandRushStart', { playerSymbol, enemySymbol });

    await new Promise(r => setTimeout(r, 800));

    const enemyChar = enemyTeam[activeEnemyIdx];
    const symbols = ['sword', 'devilfruit', 'haki', 'fist'];
    const matchPenalty = playerSymbol === enemySymbol;

    let totalDamage = 0;
    for (let i = 0; i < playerTeam.length; i++) {
      const char = playerTeam[i];
      if (char && char.currentHp > 0) {
        await new Promise(r => setTimeout(r, 400));
        const dmg = Math.floor(180 * (char.power / 80) * (matchPenalty ? 0.5 : 1.0));
        const finalDmg = this.applyDefense(dmg, enemyChar);
        totalDamage += finalDmg;
        this.dealDamage(finalDmg, enemyChar, false);
        const enemyPos = this.scene.characterMeshes.enemy?.position || this.scene.baseEnemyPos;
        this.scene.createImpactEffect(enemyPos.clone(), new THREE.Color(char.accentColor || 0xFFAA00), 2);
        this.scene.shakeCharacter(true, 0.6);
        this.emit('grandRushHit', { charName: char.name, damage: finalDmg, index: i });
      }
    }

    await new Promise(r => setTimeout(r, 600));
    this.grandRushActive = false;
    this.emit('grandRushEnd', { totalDamage, matchPenalty });
  }

  applyDefense(damage, targetChar) {
    const def = targetChar.defense / 100;
    let reduction = 0.15 + def * 0.25;
    if (this.activeEffects.armor && targetChar.isPlayer) reduction += 0.3;
    return Math.max(1, Math.floor(damage * (1 - reduction)));
  }

  dealDamage(amount, targetChar, isPlayer) {
    targetChar.currentHp = Math.max(0, targetChar.currentHp - amount);
    this.emit('hpUpdate', { isPlayer, charId: targetChar.id, hp: targetChar.currentHp, maxHp: targetChar.maxHp });
    if (targetChar.currentHp <= 0) {
      this.emit('characterDefeated', { isPlayer, charId: targetChar.id });
    }
  }

  healCharacter(charData, amount) {
    charData.currentHp = Math.min(charData.maxHp, charData.currentHp + amount);
    this.emit('hpUpdate', { isPlayer: true, charId: charData.id, hp: charData.currentHp, maxHp: charData.maxHp });
  }

  attemptDodge() {
    if (!this.dodgeReady || this.dodgeActive) return false;
    this.dodgeActive = true;
    this.dodgeGauge = 0;
    this.dodgeReady = false;
    this.dodgeCooldown = 3.0;

    this.scene.spawnEffect(
      this.scene.characterMeshes.player?.position || this.scene.basePlayerPos,
      0x00FFFF, 0.8
    );
    this.playerInvincible = true;
    this.emit('dodgeActivated', true);

    setTimeout(() => {
      this.playerInvincible = false;
      this.dodgeActive = false;
    }, 600);

    // Counterattack window
    setTimeout(() => {
      this.emit('counterAttackWindow', true);
      setTimeout(() => this.emit('counterAttackWindow', false), 1200);
    }, 300);

    return true;
  }

  switchCharacter(newIndex, playerTeam, currentIndex) {
    const newChar = playerTeam[newIndex];
    if (!newChar || newChar.currentHp <= 0) return false;
    if (newIndex === currentIndex) return false;
    if (this.switchCooldowns[newChar.id] && this.switchCooldowns[newChar.id] > 0) return false;

    const oldChar = playerTeam[currentIndex];
    if (oldChar) {
      this.switchCooldowns[oldChar.id] = 5; // 5 second cooldown
    }

    // Apply switch-in effect
    this.applySwitchEffect(newChar, playerTeam);

    // Reset hand for new character
    this.hand = [];
    this.initHand(newChar);

    this.emit('characterSwitched', { newIndex, newChar });
    return true;
  }

  applySwitchEffect(charData, team) {
    switch (charData.switchInEffect) {
      case 'attackUp':
        this.activeEffects.attackBoost = { value: 0.20, duration: 10000 };
        this.emit('notification', { text: `${charData.name}: ATK UP!`, color: '#FF8888' });
        break;
      case 'defenseUp':
        this.activeEffects.defenseUp = { value: 0.25, duration: 10000 };
        this.emit('notification', { text: `${charData.name}: DEF UP!`, color: '#88FF88' });
        break;
      case 'speedUp':
        this.cardDrawMultiplier = 1.5;
        setTimeout(() => { this.cardDrawMultiplier = 1.0; }, 10000);
        this.emit('notification', { text: `${charData.name}: SPEED UP!`, color: '#FFFF44' });
        break;
      case 'debuffClear':
        Object.keys(this.activeEffects).forEach(k => {
          if (k.includes('Down') || k.includes('Slow')) this.activeEffects[k] = null;
        });
        this.emit('notification', { text: `${charData.name}: Debuffs Cleared!`, color: '#9999FF' });
        break;
      case 'healTeam':
        const lowestHp = team.reduce((lowest, c) =>
          (!lowest || (c && c.currentHp < lowest.currentHp && c.currentHp > 0)) ? c : lowest, null);
        if (lowestHp) {
          this.healCharacter(lowestHp, 80);
          this.emit('notification', { text: `${charData.name}: Healed 80 HP!`, color: '#88FF88' });
        }
        break;
      case 'drawCard':
        setTimeout(() => this.drawCard(charData), 500);
        this.emit('notification', { text: `${charData.name}: Extra Card!`, color: '#DDAA00' });
        break;
    }
    this.scene.spawnEffect(
      this.scene.characterMeshes.player?.position || this.scene.basePlayerPos,
      0x00FFFF, 1.0
    );
  }

  getCardDrawInterval() {
    return this.cardDrawInterval / this.cardDrawMultiplier;
  }

  getSwitchCooldown(charId) {
    return this.switchCooldowns[charId] || 0;
  }

  reset() {
    this.stamina = 60;
    this.grandRushMeter = 0;
    this.grandRushReady = false;
    this.grandRushActive = false;
    this.dodgeGauge = 0;
    this.dodgeReady = false;
    this.dodgeCooldown = 0;
    this.hand = [];
    this.comboCount = 0;
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.switchCooldowns = {};
    this.activeEffects = {
      attackBoost: null, defenseUp: null, speedUp: null,
      armor: null, cardSpeedUp: null, powerShot: null
    };
    this.cardDrawMultiplier = 1.0;
    this.staminaRegenMultiplier = 1.0;
    this.playerInvincible = false;
  }
}
