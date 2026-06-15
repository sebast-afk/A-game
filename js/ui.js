// One Piece Legends - UI Manager

class UIManager {
  constructor() {
    this.floatingTexts = [];
    this.notificationQueue = [];
    this.notificationActive = false;
    this.comboElement = null;
    this.grandRushSymbolModal = null;
  }

  // =================== Screen Navigation ===================

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.style.display = 'flex';
      requestAnimationFrame(() => screen.classList.add('active'));
    }
  }

  // =================== Battle HUD ===================

  updateHealthBar(charId, hp, maxHp, isPlayer, slotIndex) {
    const prefix = isPlayer ? 'player' : 'enemy';
    const bar = document.getElementById(`${prefix}-hp-bar-${slotIndex}`);
    const text = document.getElementById(`${prefix}-hp-text-${slotIndex}`);
    if (bar) {
      const pct = Math.max(0, (hp / maxHp) * 100);
      bar.style.width = pct + '%';
      if (pct > 50) bar.style.background = 'linear-gradient(90deg, #44FF44, #88FF44)';
      else if (pct > 25) bar.style.background = 'linear-gradient(90deg, #FFAA00, #FF8800)';
      else bar.style.background = 'linear-gradient(90deg, #FF2200, #FF4400)';
    }
    if (text) text.textContent = `${Math.ceil(hp)} / ${maxHp}`;
  }

  markCharacterDefeated(isPlayer, slotIndex) {
    const prefix = isPlayer ? 'player' : 'enemy';
    const portrait = document.getElementById(`${prefix}-portrait-${slotIndex}`);
    if (portrait) {
      portrait.classList.add('defeated');
      portrait.querySelector('.portrait-defeat')?.classList.remove('hidden');
    }
  }

  setActivePortrait(isPlayer, slotIndex) {
    const prefix = isPlayer ? 'player' : 'enemy';
    document.querySelectorAll(`.${prefix}-portrait`).forEach(p => p.classList.remove('active-portrait'));
    const portrait = document.getElementById(`${prefix}-portrait-${slotIndex}`);
    if (portrait) portrait.classList.add('active-portrait');
  }

  updateStaminaBar(ratio) {
    const bar = document.getElementById('stamina-fill');
    const text = document.getElementById('stamina-text');
    if (bar) bar.style.width = (ratio * 100) + '%';
    if (text) text.textContent = Math.ceil(ratio * 100);
  }

  updateDodgeGauge(ratio) {
    const fill = document.getElementById('dodge-fill');
    const btn = document.getElementById('dodge-btn');
    if (fill) fill.style.width = (ratio * 100) + '%';
    if (btn) {
      btn.classList.toggle('dodge-ready', ratio >= 1);
      btn.style.opacity = ratio >= 1 ? '1' : '0.5';
    }
  }

  updateGrandRushMeter(ratio) {
    const fill = document.getElementById('grand-rush-fill');
    const btn = document.getElementById('grand-rush-btn');
    if (fill) {
      fill.style.width = (ratio * 100) + '%';
      if (ratio >= 1) {
        fill.style.background = 'linear-gradient(90deg, #FFD700, #FF8800, #FFD700)';
        fill.style.animation = 'pulse 0.6s ease-in-out infinite';
      } else {
        fill.style.background = 'linear-gradient(90deg, #DD8800, #FFAA00)';
        fill.style.animation = 'none';
      }
    }
    if (btn) {
      btn.classList.toggle('ready', ratio >= 1);
      btn.style.opacity = ratio >= 1 ? '1' : '0.5';
    }
  }

  // =================== Arts Cards ===================

  renderCards(hand, canPlayFn, staminaRatio) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    container.innerHTML = '';

    hand.forEach((card, i) => {
      const canPlay = canPlayFn(card);
      const cardEl = document.createElement('div');
      cardEl.className = `arts-card card-${card.type}`;
      cardEl.setAttribute('data-card-index', i);

      const colorMap = { strike: '#FF3333', skill: '#33CC33', special: '#3366FF', ultimate: '#FFD700' };
      const typeLabels = { strike: 'STRIKE', skill: 'SKILL', special: 'SPECIAL', ultimate: 'ULTIMATE' };

      cardEl.innerHTML = `
        <div class="card-glow"></div>
        <div class="card-type-label" style="color:${colorMap[card.type]}">${typeLabels[card.type]}</div>
        <div class="card-icon">${card.icon || '💥'}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-cost">
          <span class="stamina-icon">⚡</span>
          <span>${card.staminaCost}</span>
        </div>
        ${!canPlay ? '<div class="card-overlay"></div>' : ''}
      `;

      if (!canPlay) {
        cardEl.classList.add('card-disabled');
        cardEl.style.filter = 'grayscale(60%) brightness(0.7)';
      }

      cardEl.addEventListener('click', () => {
        if (canPlay) {
          cardEl.classList.add('card-used');
          this.triggerCardFlash(card.color || colorMap[card.type]);
        }
      });

      container.appendChild(cardEl);
    });
  }

  triggerCardFlash(color) {
    const flash = document.getElementById('screen-flash');
    if (flash) {
      flash.style.background = color;
      flash.style.opacity = '0.35';
      setTimeout(() => { flash.style.opacity = '0'; }, 200);
    }
  }

  // =================== Switch Buttons ===================

  renderSwitchButtons(playerTeam, activeIndex, switchCooldowns) {
    const container = document.getElementById('switch-container');
    if (!container) return;
    container.innerHTML = '';

    playerTeam.forEach((char, i) => {
      if (i === activeIndex || !char) return;
      const btn = document.createElement('div');
      btn.className = 'switch-btn';
      btn.setAttribute('data-switch-index', i);

      const cooldown = switchCooldowns[char.id] || 0;
      const isDefeated = char.currentHp <= 0;
      const isOnCooldown = cooldown > 0;

      btn.innerHTML = `
        <div class="switch-portrait" style="background:${char.modelColor}">
          <span style="font-size:12px;font-weight:bold;color:white">${char.name.split(' ').pop()}</span>
        </div>
        <div class="switch-hp-bar">
          <div class="switch-hp-fill" style="width:${(char.currentHp/char.maxHp)*100}%;background:${char.currentHp/char.maxHp > 0.5 ? '#44FF44' : '#FFAA00'}"></div>
        </div>
        ${isOnCooldown ? `<div class="switch-cooldown">${Math.ceil(cooldown)}s</div>` : ''}
        ${isDefeated ? '<div class="switch-defeated">✕</div>' : ''}
      `;

      if (isDefeated || isOnCooldown) {
        btn.classList.add('switch-disabled');
      }

      container.appendChild(btn);
    });
  }

  // =================== Notifications ===================

  showNotification(data) {
    this.notificationQueue.push(data);
    if (!this.notificationActive) this.processNotificationQueue();
  }

  processNotificationQueue() {
    if (this.notificationQueue.length === 0) {
      this.notificationActive = false;
      return;
    }
    this.notificationActive = true;
    const data = this.notificationQueue.shift();
    this.displayNotification(data);
    setTimeout(() => this.processNotificationQueue(), data.big ? 900 : 700);
  }

  displayNotification(data) {
    if (data.text && (data.text.startsWith('-') || data.big)) {
      this.showFloatingText(data);
    } else {
      this.showStatusNotification(data);
    }
  }

  showFloatingText(data) {
    const container = document.getElementById('floating-text-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'floating-dmg' + (data.big ? ' dmg-big' : '');
    el.style.color = data.color || '#FF4444';
    el.style.left = data.isEnemy ? '65%' : '25%';
    el.style.top = '35%';
    el.textContent = data.text;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  showStatusNotification(data) {
    const el = document.getElementById('status-notification');
    if (!el) return;
    el.textContent = data.text;
    el.style.color = data.color || '#FFFFFF';
    el.classList.remove('fade-out');
    el.classList.add('visible');
    setTimeout(() => {
      el.classList.remove('visible');
      el.classList.add('fade-out');
    }, 1500);
  }

  showSpecialAnnounce(name) {
    const el = document.getElementById('special-announce');
    if (!el) return;
    el.textContent = name.toUpperCase();
    el.classList.remove('hidden');
    el.classList.add('announce-active');
    setTimeout(() => {
      el.classList.remove('announce-active');
      el.classList.add('hidden');
    }, 1800);
  }

  showUltimateAnnounce(name) {
    const el = document.getElementById('ultimate-announce');
    if (!el) return;
    el.textContent = '★ ' + name.toUpperCase() + ' ★';
    el.classList.remove('hidden');
    el.classList.add('announce-active');
    setTimeout(() => {
      el.classList.remove('announce-active');
      el.classList.add('hidden');
    }, 2200);
  }

  updateCombo(count) {
    const el = document.getElementById('combo-counter');
    if (!el) return;
    if (count > 1) {
      el.textContent = `${count} HIT COMBO`;
      el.classList.remove('hidden');
      el.classList.add('combo-pop');
      setTimeout(() => el.classList.remove('combo-pop'), 300);
    } else {
      el.classList.add('hidden');
    }
  }

  // =================== Grand Rush Symbol Selector ===================

  showGrandRushSelector(callback) {
    const modal = document.getElementById('grand-rush-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.add('active');

    const symbols = [
      { id: 'sword', icon: '⚔️', name: 'Sword' },
      { id: 'devilfruit', icon: '🍇', name: 'Devil Fruit' },
      { id: 'haki', icon: '🖤', name: 'Haki' },
      { id: 'fist', icon: '👊', name: 'Fist' }
    ];

    const container = modal.querySelector('.grand-rush-symbols');
    if (!container) return;
    container.innerHTML = '';
    symbols.forEach(sym => {
      const btn = document.createElement('div');
      btn.className = 'symbol-btn';
      btn.innerHTML = `<span class="symbol-icon">${sym.icon}</span><span class="symbol-name">${sym.name}</span>`;
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
        callback(sym.id);
      });
      container.appendChild(btn);
    });
  }

  // =================== Result Screen ===================

  showResult(isVictory, stats) {
    const screen = document.getElementById('result-screen');
    const title = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');
    const statsEl = document.getElementById('result-stats');

    if (title) {
      title.textContent = isVictory ? 'VICTORY!' : 'DEFEATED!';
      title.className = isVictory ? 'result-victory' : 'result-defeat';
    }
    if (subtitle) {
      subtitle.textContent = isVictory
        ? 'The seas tremble at your name, pirate!'
        : 'A true pirate never gives up — try again!';
    }
    if (statsEl && stats) {
      statsEl.innerHTML = `
        <div class="stat-row"><span>Total Damage Dealt</span><span>${stats.damageDealt || 0}</span></div>
        <div class="stat-row"><span>Combos Hit</span><span>${stats.maxCombo || 0} hit max</span></div>
        <div class="stat-row"><span>Grand Rush</span><span>${stats.grandRushUsed ? 'Used' : 'Not Used'}</span></div>
        <div class="stat-row"><span>Rating</span><span>${isVictory ? '★★★' : '★☆☆'}</span></div>
      `;
    }
    this.showScreen('result-screen');
  }

  // =================== Character Select ===================

  buildCharacterSelect(characters, selectedTeam, onSelect, onReady) {
    const grid = document.getElementById('character-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Update count display
    const countEl = document.getElementById('selected-count');
    if (countEl) countEl.textContent = selectedTeam.length;

    // Update synergy display
    const synergies = getTeamSynergies(selectedTeam);
    const synergyEl = document.getElementById('synergy-text');
    if (synergyEl) {
      synergyEl.textContent = synergies.length > 0
        ? synergies.map(s => s.name).join(' + ')
        : '—';
    }

    Object.values(characters).forEach(char => {
      const card = document.createElement('div');
      card.className = 'char-select-card';
      card.setAttribute('data-char-id', char.id);
      const isSelected = selectedTeam.includes(char.id);
      const slotNum = selectedTeam.indexOf(char.id) + 1;

      card.innerHTML = `
        <div class="char-card-portrait" style="background: linear-gradient(135deg, ${char.modelColor}, #000)">
          <div class="char-card-icon" style="font-size:32px">${char.arts.strike.icon}</div>
        </div>
        <div class="char-card-name">${char.name}</div>
        <div class="char-card-title">${char.title}</div>
        <div class="char-card-tags">
          ${char.tags.slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="char-stats-row">
          <span>ATK ${char.power}</span>
          <span>SPD ${char.speed}</span>
          <span>DEF ${char.defense}</span>
        </div>
        ${isSelected ? `<div class="char-selected-badge">${slotNum}</div>` : ''}
      `;
      if (isSelected) card.classList.add('selected');
      card.addEventListener('click', () => onSelect(char.id));
      grid.appendChild(card);
    });

    this.updateTeamSlots(selectedTeam, characters);
    const readyBtn = document.getElementById('ready-btn');
    if (readyBtn) {
      readyBtn.disabled = selectedTeam.length < 3;
      readyBtn.style.opacity = selectedTeam.length >= 3 ? '1' : '0.5';
      if (readyBtn.onclick === null || true) readyBtn.onclick = onReady;
    }
  }

  updateTeamSlots(selectedTeam, characters) {
    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`team-slot-${i}`);
      if (!slot) continue;
      const charId = selectedTeam[i];
      if (charId) {
        const char = characters[charId];
        slot.style.background = `linear-gradient(135deg, ${char.modelColor}, #111)`;
        slot.innerHTML = `<span style="font-size:11px;color:white;font-weight:bold">${char.name.split(' ').pop()}</span>`;
      } else {
        slot.style.background = '#111';
        slot.innerHTML = '<span style="color:#555">Empty</span>';
      }
    }
  }

  // =================== Effect Indicators ===================

  updateEffectIndicators(activeEffects) {
    const container = document.getElementById('effect-indicators');
    if (!container) return;
    container.innerHTML = '';
    Object.entries(activeEffects).forEach(([key, effect]) => {
      if (!effect) return;
      const icons = {
        attackBoost: { icon: '⬆️', color: '#FF8888', label: 'ATK UP' },
        defenseUp: { icon: '🛡️', color: '#88FF88', label: 'DEF UP' },
        armor: { icon: '🔒', color: '#88FFFF', label: 'ARMOR' },
        cardSpeedUp: { icon: '⚡', color: '#FFFF44', label: 'SPEED' },
        powerShot: { icon: '⚡', color: '#FFFF44', label: 'CHARGED' }
      };
      const data = icons[key];
      if (!data) return;
      const ind = document.createElement('div');
      ind.className = 'effect-indicator';
      ind.style.color = data.color;
      ind.innerHTML = `${data.icon} <small>${data.label}</small>`;
      container.appendChild(ind);
    });
  }

  // =================== Transitions ===================

  flashScreen(color, duration = 300) {
    const flash = document.getElementById('screen-flash');
    if (flash) {
      flash.style.background = color;
      flash.style.opacity = '0.6';
      flash.style.transition = `opacity ${duration}ms ease-out`;
      setTimeout(() => { flash.style.opacity = '0'; }, 50);
    }
  }

  showBattleIntro(playerTeam, enemyTeam, characters, callback) {
    const intro = document.getElementById('battle-intro');
    if (!intro) { callback(); return; }

    const pl = playerTeam.map(id => characters[id]?.name || id).join(', ');
    const en = enemyTeam.map(id => characters[id]?.name || id).join(', ');
    const titleEl = intro.querySelector('.intro-vs-text');
    const p1El = intro.querySelector('.intro-player');
    const p2El = intro.querySelector('.intro-enemy');
    if (p1El) p1El.textContent = pl;
    if (p2El) p2El.textContent = en;

    intro.style.display = 'flex';
    intro.classList.add('active');
    setTimeout(() => {
      intro.classList.remove('active');
      setTimeout(() => {
        intro.style.display = 'none';
        callback();
      }, 600);
    }, 2500);
  }
}
