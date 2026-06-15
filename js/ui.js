// One Piece Legends - UI Manager

class UIManager {
  constructor() {
    this.notificationQueue = [];
    this.notificationActive = false;
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

  // =================== Resource Bar ===================

  updateResources(save) {
    const gems = (save.gems || 0).toLocaleString();
    const tickets = save.inventory?.recruitTickets || 0;
    // Update every gem display across all screens
    ['menu-gems', 'summon-gems', 'banner-detail-gems', 'shop-gems'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = gems;
    });
    const ticketEl = document.getElementById('menu-tickets');
    if (ticketEl) ticketEl.textContent = tickets;

    // Update PvP rank badge on main menu
    const pvpBadge = document.getElementById('nav-pvp-rank');
    if (pvpBadge && save.pvp?.rank) pvpBadge.textContent = save.pvp.rank;
  }

  showToast(message, color = '#FFD700') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.style.color = color;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // =================== Login Bonus Modal ===================

  showLoginBonus(save, onClaim, onClose) {
    const modal = document.getElementById('login-bonus-modal');
    if (!modal) return;

    const dayIndex = (save.loginBonus?.totalDays || 1) - 1;
    const todayReward = LOGIN_SCHEDULE[dayIndex % 30];

    // Render calendar
    const calendar = document.getElementById('login-calendar');
    if (calendar) {
      calendar.innerHTML = '';
      LOGIN_SCHEDULE.forEach((entry, i) => {
        const { reward } = entry;
        const cell = document.createElement('div');
        const claimed = i < dayIndex;
        const isToday = i === dayIndex;
        cell.className = `login-day ${claimed ? 'claimed-day' : isToday ? 'today-day' : 'future-day'}`;
        cell.innerHTML = `
          <div class="login-day-num">D${i + 1}</div>
          <div class="login-day-icon">${reward.icon}</div>
          <div class="login-day-label">${reward.gems ? reward.gems : reward.tickets ? `T×${reward.tickets}` : reward.stones ? `S×${reward.stones}` : ''}</div>
          ${claimed ? '<div style="font-size:.6rem;color:#44FF44">✓</div>' : ''}
        `;
        calendar.appendChild(cell);
      });
    }

    // Today's reward summary
    const todayEl = document.getElementById('login-today-reward');
    if (todayEl && todayReward) {
      const r = todayReward.reward;
      todayEl.textContent = `Today: ${todayReward.reward.label || ''}`;
    }

    // Streak
    const streakEl = document.getElementById('login-streak');
    if (streakEl) streakEl.textContent = `Login Streak: ${save.loginBonus?.streak || 1} days`;

    // Buttons
    const claimBtn = document.getElementById('login-claim-btn');
    if (claimBtn) claimBtn.onclick = onClaim;

    // Show modal
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
  }

  closeLoginBonusModal() {
    const modal = document.getElementById('login-bonus-modal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }

  // =================== Summons Screen ===================

  renderSummonsScreen(banners, save) {
    const container = document.getElementById('banner-list');
    if (!container) return;
    container.innerHTML = '';

    banners.forEach(banner => {
      const pity = save.bannerPity?.[banner.id] || 0;
      const card = document.createElement('div');
      card.className = 'banner-card';
      card.style.background = banner.gradient || '#111';

      const featured = banner.featured?.length
        ? banner.featured.map(id => ALL_CHARACTERS[id]?.name || id).join(', ')
        : 'Standard Pool';

      card.innerHTML = `
        <div class="banner-badge" style="background:${banner.badgeColor || '#4488CC'}">${banner.badgeText || 'BANNER'}</div>
        <div class="banner-ship">${banner.shipImage || '⛵'}</div>
        <div class="banner-info">
          <div class="banner-name">${banner.name}</div>
          <div class="banner-sub">${banner.subtitle}</div>
          <div class="banner-featured">Featured: ${featured}</div>
          <div class="banner-pity-text">Pity: ${pity}/100</div>
        </div>
        <div class="banner-btns">
          <button class="banner-single-btn" data-banner="${banner.id}" data-count="1">
            1x Pull · ${banner.singleCost || 100}💎
          </button>
          <button class="banner-ten-btn" data-banner="${banner.id}" data-count="10">
            10x Pull · ${banner.tenCost || 1000}💎
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderBannerDetail(banner, save, onSummon, onStepUp) {
    const screen = document.getElementById('banner-detail');
    if (!screen) return;

    const pity = save.bannerPity?.[banner.id] || 0;

    // Title
    const titleEl = document.getElementById('banner-detail-title');
    if (titleEl) titleEl.textContent = banner.name;

    // Detail content
    const content = document.getElementById('banner-detail-content');
    if (content) {
      const rates = banner.rates || {};
      const rateRows = Object.entries(rates).map(([r, v]) =>
        `<div class="rate-row"><span class="rarity-${r}">${r}</span><span>${v}%</span></div>`
      ).join('');
      content.innerHTML = `
        <div class="banner-detail-bg" style="background:${banner.gradient}">
          <div class="banner-detail-ship">${banner.shipImage || '⛵'}</div>
          <div class="banner-detail-name-big">${banner.name}</div>
          <div class="banner-detail-subtitle">${banner.subtitle}</div>
        </div>
        ${banner.featured?.length ? `<div class="banner-detail-featured">
          ${banner.featured.map(id => {
            const c = ALL_CHARACTERS[id];
            return c ? `<div class="featured-char-chip rarity-${c.rarity}">${c.icon} ${c.name}</div>` : '';
          }).join('')}
        </div>` : ''}
        <div class="banner-pity-section">
          <div class="banner-pity-label">Pity Progress: ${pity}/100</div>
          <div class="banner-pity-track"><div class="banner-pity-fill" style="width:${pity}%"></div></div>
          <div class="banner-pity-note">Guaranteed SSR+ at 100 pulls</div>
        </div>
        <div class="banner-rates-section"><div class="rates-title">Drop Rates</div>${rateRows}</div>
        ${banner.guarantee ? `<div class="banner-guarantee">${banner.guarantee}</div>` : ''}
      `;
    }

    // Summon buttons
    const btn1 = document.getElementById('summon-1x-btn');
    const lbl1 = document.getElementById('summon-1x-label');
    const btn10 = document.getElementById('summon-10x-btn');
    const lbl10 = document.getElementById('summon-10x-label');
    if (lbl1) lbl1.textContent = `1x Summon (${banner.singleCost || 100} 💎)`;
    if (lbl10) lbl10.textContent = `10x Summon (${banner.tenCost || 1000} 💎)`;
    if (btn1) btn1.onclick = () => onSummon(banner.id, 1);
    if (btn10) btn10.onclick = () => onSummon(banner.id, 10);

    // Step-up
    const stepEl = document.getElementById('stepup-progress');
    if (stepEl) {
      if (banner.type === 'stepup') {
        const step = save.stepUpProgress?.[banner.id]?.step || 0;
        stepEl.classList.remove('hidden');
        stepEl.innerHTML = `
          <div class="stepup-label">Step-Up: Step ${step + 1}</div>
          <button class="menu-btn secondary-btn" id="stepup-btn">
            Step ${step + 1} Pull (${(step + 1) * 100 * 10} 💎)
          </button>
        `;
        document.getElementById('stepup-btn')?.addEventListener('click', () => onStepUp(banner.id));
      } else {
        stepEl.classList.add('hidden');
      }
    }
  }

  showSummonResults(results, banner) {
    const overlay = document.getElementById('summon-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Hide ship phase, show card phase
    const shipPhase = document.getElementById('summon-ship-phase');
    const cardPhase = document.getElementById('summon-card-phase');
    if (shipPhase) shipPhase.style.display = 'none';
    if (cardPhase) cardPhase.style.display = 'flex';

    const container = document.getElementById('summon-cards-container');
    if (container) {
      container.innerHTML = '';
      results.forEach((result, i) => {
        const char = ALL_CHARACTERS[result.id] || {};
        const card = document.createElement('div');
        card.className = `summon-card rarity-card-${result.rarity}`;
        card.style.animationDelay = `${i * 0.12}s`;
        card.style.background = `linear-gradient(135deg, ${char.modelColor || '#222'}, #000)`;
        card.innerHTML = `
          <div class="summon-card-rarity rarity-${result.rarity}">${result.rarity}</div>
          <div class="summon-card-icon">${char.icon || '?'}</div>
          <div class="summon-card-name">${char.name || result.id}</div>
          <div class="summon-card-sub">${char.title || ''}</div>
          ${result.isNew ? '<div class="summon-new-tag">NEW!</div>' : ''}
          ${result.isDuplicate ? '<div class="summon-dup-tag">+Fragment</div>' : ''}
        `;
        container.appendChild(card);
      });
    }

    const collectBtn = document.getElementById('summon-collect-btn');
    if (collectBtn) {
      collectBtn.style.display = 'block';
      collectBtn.onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.style.display = 'none';
          if (cardPhase) cardPhase.style.display = 'none';
        }, 300);
      };
    }
  }

  // =================== Crew Screen ===================

  renderCrewScreen(save, onCharClick) {
    const grid = document.getElementById('crew-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const countEl = document.getElementById('crew-count-val');
    const totalEl = document.getElementById('crew-total-val');
    const ownedCount = Object.keys(save.ownedCharacters || {}).length;
    if (countEl) countEl.textContent = ownedCount;
    if (totalEl) totalEl.textContent = Object.keys(ALL_CHARACTERS || {}).length;

    const sortOrder = ['EX', 'Legendary', 'SSR', 'SR', 'R'];
    const chars = Object.entries(save.ownedCharacters || {})
      .map(([id, data]) => {
        const base = ALL_CHARACTERS[id];
        return base ? { id, ...base, ...data } : null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        const ra = sortOrder.indexOf(a.rarity);
        const rb = sortOrder.indexOf(b.rarity);
        return ra - rb || (b.stars || 1) - (a.stars || 1);
      });

    chars.forEach(char => {
      const card = document.createElement('div');
      card.className = 'crew-card';
      const stars = char.stars || 1;
      card.innerHTML = `
        <div class="crew-card-portrait" style="background:linear-gradient(135deg,${char.modelColor || '#222'},#000)">
          <div class="crew-card-icon">${char.icon || '?'}</div>
          <div class="crew-card-rarity rarity-${char.rarity}">${char.rarity}</div>
        </div>
        <div class="crew-card-name">${char.name}</div>
        <div class="crew-card-stars">${'★'.repeat(stars)}${'☆'.repeat(7 - stars)}</div>
        <div class="crew-card-level">Lv.${char.level || 1}</div>
      `;
      card.addEventListener('click', () => onCharClick(char.id));
      grid.appendChild(card);
    });

    if (chars.length === 0) {
      grid.innerHTML = '<div class="empty-state">No crew yet — head to Summons!</div>';
    }
  }

  renderCharDetail(charId, save, progression) {
    const screen = document.getElementById('char-detail');
    if (!screen) return;

    screen.dataset.charId = charId;

    const charSave = save.ownedCharacters?.[charId];
    const charBase = ALL_CHARACTERS[charId];
    if (!charBase || !charSave) return;

    const stars = charSave.stars || 1;
    const level = charSave.level || 1;
    const frags = charSave.fragments || 0;
    const starProgress = progression.getStarProgress(charId);
    const soulState = progression.getSoulBoostState(charId);
    const equippedMedals = progression.getEquippedMedals(charId);
    const scaled = typeof getCharacterScaledStats === 'function'
      ? getCharacterScaledStats(charId, level, stars)
      : { hp: charBase.maxHp, power: charBase.power, speed: charBase.speed, defense: charBase.defense };

    const titleEl = document.getElementById('char-detail-title');
    if (titleEl) titleEl.textContent = charBase.name;

    const content = document.getElementById('char-detail-content');
    if (!content) return;

    // Soul boost nodes HTML
    const sbRows = [0, 1, 2, 3].map(r => {
      const cells = [0, 1, 2, 3].map(c => {
        const node = SOUL_BOOST_NODES.find(n => n.row === r && n.col === c);
        if (!node) return `<div class="sb-cell sb-empty"></div>`;
        const unlocked = soulState.unlocked.includes(node.id);
        const canUnlock = progression.canUnlockNode(charId, node.id);
        const cls = unlocked ? 'sb-unlocked' : canUnlock ? 'sb-available' : 'sb-locked';
        return `<div class="sb-cell ${cls}" data-node="${node.id}">
          <div class="sb-label">${node.label}</div>
          <div class="sb-cost">${node.cost.stones || 0}🪨</div>
        </div>`;
      }).join('');
      return `<div class="sb-row">${cells}</div>`;
    }).join('');

    // Medal slots HTML
    const medalHTML = Array.from({ length: 6 }, (_, i) => {
      const medalId = equippedMedals[i];
      const medal = medalId ? TREASURE_MEDALS[medalId] : null;
      return `<div class="medal-slot ${medal ? 'medal-filled' : 'medal-empty'}" data-slot="${i}">
        ${medal ? `<span>${medal.icon}</span><span class="medal-nm">${medal.name}</span>` : '<span class="medal-ph">○</span>'}
      </div>`;
    }).join('');

    content.innerHTML = `
      <div class="char-detail-header" style="background:linear-gradient(135deg,${charBase.modelColor || '#222'},#000)">
        <div class="char-detail-icon">${charBase.icon || '?'}</div>
        <div class="char-detail-meta">
          <div class="char-detail-rarity rarity-${charBase.rarity}">${charBase.rarity}</div>
          <div class="char-detail-name">${charBase.name}</div>
          <div class="char-detail-title-text">${charBase.title}</div>
          <div class="char-detail-stars">${'★'.repeat(stars)}${'☆'.repeat(7 - stars)}</div>
          <div class="char-detail-level">Lv.${level} / 200</div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">Stats</div>
        <div class="stat-grid">
          <div class="stat-item"><span class="stat-lbl">HP</span><span class="stat-val">${scaled.hp || charBase.maxHp}</span></div>
          <div class="stat-item"><span class="stat-lbl">ATK</span><span class="stat-val">${scaled.power || charBase.power}</span></div>
          <div class="stat-item"><span class="stat-lbl">SPD</span><span class="stat-val">${scaled.speed || charBase.speed}</span></div>
          <div class="stat-item"><span class="stat-lbl">DEF</span><span class="stat-val">${scaled.defense || charBase.defense}</span></div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">Star Enhancement</div>
        <div class="star-section">
          <div class="star-prog-bar"><div class="star-prog-fill" style="width:${stars < 7 ? Math.min(100, (frags / (starProgress.needed || 1)) * 100) : 100}%"></div></div>
          <div class="star-prog-text">${stars < 7 ? `${frags} / ${starProgress.needed} Fragments` : 'MAX ★★★★★★★'}</div>
          <button class="star-up-btn" ${!starProgress.canUp ? 'disabled style="opacity:0.4"' : ''}>
            ${stars < 7 ? `★ Star Up (${starProgress.needed} Frags)` : 'MAX STARS'}
          </button>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">Soul Boost</div>
        <div class="soul-boost-grid">${sbRows}</div>
      </div>

      <div class="detail-section">
        <div class="section-title">Treasure Medals</div>
        <div class="medal-slots">${medalHTML}</div>
      </div>
    `;
  }

  // =================== Story Screen ===================

  renderStoryScreen(save, story, onSagaClick) {
    const container = document.getElementById('saga-list');
    if (!container) return;
    container.innerHTML = '';

    STORY_SAGAS.forEach(saga => {
      const status = story.getSagaStatus(saga.id);
      if (!status) return;
      const completedCount = status.completed?.length || 0;
      const totalCount = saga.chapters.length;
      const progressPct = totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0;
      const card = document.createElement('div');
      card.className = `saga-card ${status.isCompleted ? 'saga-done' : status.isUnlocked ? 'saga-open' : 'saga-locked'}`;
      card.style.borderLeft = `4px solid ${saga.color || '#888'}`;
      card.innerHTML = `
        <div class="saga-header">
          <div class="saga-icon">${saga.icon || '🗺️'}</div>
          <div class="saga-info">
            <div class="saga-name">${saga.name}</div>
            <div class="saga-subtitle">${saga.subtitle || ''}</div>
            <div class="saga-progress">${completedCount}/${totalCount} Chapters</div>
          </div>
          <div class="saga-lock-icon">${status.isCompleted ? '✅' : status.isUnlocked ? '▶' : '🔒'}</div>
        </div>
        <div class="saga-progress-bar"><div class="saga-progress-fill" style="width:${progressPct}%"></div></div>
      `;
      if (status.isUnlocked) card.addEventListener('click', () => onSagaClick(saga.id));
      container.appendChild(card);
    });
  }

  renderChapterSelect(sagaId, save, story, onChapterStart) {
    const screen = document.getElementById('chapter-select');
    if (!screen) return;

    const saga = STORY_SAGAS.find(s => s.id === sagaId);
    if (!saga) return;

    const titleEl = document.getElementById('chapter-select-title');
    if (titleEl) titleEl.textContent = saga.name;

    const list = document.getElementById('chapter-list');
    if (!list) return;
    list.innerHTML = '';

    const sagaProg = save.storyProgress?.[sagaId] || { completed: [], stars: {} };
    const completedIds = sagaProg.completed || [];

    saga.chapters.forEach((chapter, i) => {
      const completed = completedIds.includes(chapter.id);
      const unlocked = i === 0 || completedIds.includes(saga.chapters[i - 1]?.id);
      const card = document.createElement('div');
      card.className = `chapter-card ${completed ? 'ch-done' : unlocked ? 'ch-open' : 'ch-locked'}`;
      const rewards = chapter.rewards || {};
      card.innerHTML = `
        <div class="chapter-num">Ch.${i + 1}</div>
        <div class="chapter-info">
          <div class="chapter-title">${chapter.title}</div>
          <div class="chapter-subtitle">${chapter.subtitle || ''}</div>
          <div class="chapter-rewards">${rewards.gems ? `💎${rewards.gems}` : ''}${rewards.stones ? ` 🪨${rewards.stones}` : ''}${rewards.tickets ? ` 🎫×${rewards.tickets}` : ''}</div>
        </div>
        <div class="chapter-stars">${completed ? '★★★' : '☆☆☆'}</div>
        ${!unlocked ? '<div class="chapter-arrow">🔒</div>' : '<div class="chapter-arrow">▶</div>'}
      `;
      if (unlocked) card.addEventListener('click', () => onChapterStart(sagaId, chapter));
      list.appendChild(card);
    });
  }

  showDialogue(dialogues, onComplete) {
    const screen = document.getElementById('story-dialogue');
    if (!screen || !dialogues || dialogues.length === 0) { onComplete(); return; }

    let idx = 0;
    const linesEl = document.getElementById('dialogue-lines');
    const nextBtn = document.getElementById('dialogue-next-btn');

    const show = () => {
      if (idx >= dialogues.length) {
        onComplete();
        return;
      }
      const d = dialogues[idx];
      if (linesEl) {
        linesEl.innerHTML = `
          <div class="dialogue-char-name">${d.speaker || d.char || ''}</div>
          <div class="dialogue-text">${d.text || ''}</div>
        `;
      }
    };

    if (nextBtn) nextBtn.onclick = () => { idx++; show(); };
    this.showScreen('story-dialogue');
    show();
  }

  // =================== PvP Screen ===================

  renderPvPScreen(save, pvpSystem) {
    const rating = save.pvp?.rating || 0;
    const rank = pvpSystem.getRankData(rating);
    const progress = pvpSystem.getProgressInRank();

    const rankCard = document.getElementById('pvp-rank-card');
    if (rankCard) {
      rankCard.style.background = `linear-gradient(135deg, ${rank.color}22, #111)`;
      rankCard.style.border = `2px solid ${rank.color}`;
      rankCard.innerHTML = `
        <div class="pvp-rank-icon">${rank.icon}</div>
        <div class="pvp-rank-name">${rank.name}</div>
        <div class="pvp-rating">${rating} pts</div>
        <div class="pvp-rank-bar-bg"><div class="pvp-rank-bar-fill" style="width:${progress}%;background:${rank.color}"></div></div>
        <div class="pvp-rank-range">${rank.minRating} — ${rank.maxRating}</div>
      `;
    }

    const statsRow = document.getElementById('pvp-stats-row');
    if (statsRow) {
      statsRow.innerHTML = `
        <div class="pvp-stat"><div class="pvp-stat-val">${save.pvp?.wins || 0}</div><div class="pvp-stat-label">Wins</div></div>
        <div class="pvp-stat"><div class="pvp-stat-val">${save.pvp?.losses || 0}</div><div class="pvp-stat-label">Losses</div></div>
        <div class="pvp-stat"><div class="pvp-stat-val">${save.pvp?.streak || 0}</div><div class="pvp-stat-label">Streak</div></div>
        <div class="pvp-stat"><div class="pvp-stat-val">${pvpSystem.getSeasonRewards().gems}💎</div><div class="pvp-stat-label">Season</div></div>
      `;
    }

    const lbEl = document.getElementById('pvp-leaderboard');
    if (lbEl) {
      const board = pvpSystem.getLeaderboard();
      lbEl.innerHTML = `<div class="lb-header"><div class="lb-title">Leaderboard</div></div>` + board.map(p => `
        <div class="lb-row ${p.isPlayer ? 'player-row' : ''}">
          <span class="lb-pos">#${p.rank_pos}</span>
          <span class="lb-name">${p.name}</span>
          <span class="lb-rating">${p.rating}</span>
        </div>
      `).join('');
    }
  }

  showPvPResult(result, onRematch, onMenu) {
    // Re-use the result screen for PvP outcomes
    const screen = document.getElementById('result-screen');
    const title = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');
    const statsEl = document.getElementById('result-stats');

    if (title) {
      title.textContent = result.playerWon ? 'VICTORY!' : 'DEFEAT!';
      title.className = result.playerWon ? 'result-victory' : 'result-defeat';
    }
    if (subtitle) {
      const sign = result.ratingChange >= 0 ? '+' : '';
      subtitle.textContent = `Rating: ${result.newRating} (${sign}${result.ratingChange})`;
    }
    if (statsEl) {
      const rankMsg = result.rankChanged
        ? (result.playerWon ? `★ Promoted to ${result.newRank.name}!` : `Dropped to ${result.newRank.name}`)
        : `Rank: ${result.newRank.name}`;
      statsEl.innerHTML = `
        <div class="stat-row"><span>Rank</span><span>${rankMsg}</span></div>
        <div class="stat-row"><span>Rating Change</span><span style="color:${result.ratingChange >= 0 ? '#44FF44' : '#FF4444'}">${result.ratingChange >= 0 ? '+' : ''}${result.ratingChange}</span></div>
        <div class="stat-row"><span>Win Streak</span><span>${result.streak}</span></div>
      `;
    }

    // Override buttons
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.textContent = '⚔️ Rematch';
      retryBtn.onclick = () => { retryBtn.textContent = '⚔️ BATTLE AGAIN'; retryBtn.onclick = null; onRematch(); };
    }

    this.showScreen('result-screen');
  }

  // =================== Missions Screen ===================

  renderMissionsScreen(save, missions, activeTab) {
    const daily = document.getElementById('missions-daily');
    const weekly = document.getElementById('missions-weekly');
    const loginGrid = document.getElementById('missions-login');

    if (daily) {
      daily.innerHTML = '';
      DAILY_MISSIONS.forEach(m => {
        const completed = save.missions?.dailyCompleted?.includes(m.id);
        const claimed = save.missions?.dailyClaimed?.includes(m.id);
        const progress = missions.getMissionState(m.id, false);
        const currentProg = progress?.currentProgress || 0;
        const row = this._buildMissionRow(m, currentProg, m.goal, completed, claimed, false);
        daily.appendChild(row);
      });
    }

    if (weekly) {
      weekly.innerHTML = '';
      WEEKLY_MISSIONS.forEach(m => {
        const completed = save.missions?.weeklyCompleted?.includes(m.id);
        const claimed = save.missions?.weeklyClaimed?.includes(m.id);
        const progress = missions.getMissionState(m.id, true);
        const currentProg = progress?.currentProgress || 0;
        const row = this._buildMissionRow(m, currentProg, m.goal, completed, claimed, true);
        weekly.appendChild(row);
      });
    }

    if (loginGrid) {
      loginGrid.innerHTML = '';
      const dayIndex = (save.loginBonus?.totalDays || 1) - 1;
      LOGIN_SCHEDULE.forEach((entry, i) => {
        const { reward } = entry;
        const cell = document.createElement('div');
        const claimed = i < dayIndex;
        const isToday = i === dayIndex;
        cell.className = `login-day ${claimed ? 'claimed-day' : isToday ? 'today-day' : 'future-day'}`;
        cell.innerHTML = `
          <div class="login-day-num">D${i + 1}</div>
          <div class="login-day-icon">${reward.icon}</div>
          <div class="login-day-label">${reward.gems || (reward.tickets ? `T×${reward.tickets}` : reward.stones ? `S×${reward.stones}` : '')}</div>
          ${claimed ? '<div style="font-size:.6rem;color:#44FF44">✓</div>' : ''}
        `;
        loginGrid.appendChild(cell);
      });
    }

    this.activateMissionTab(activeTab || 'daily');
  }

  _buildMissionRow(m, currentProg, goal, completed, claimed, isWeekly) {
    const row = document.createElement('div');
    row.className = 'mission-row';
    const reward = m.reward || {};
    const rewardStr = reward.gems ? `💎${reward.gems}` : reward.stones ? `🪨${reward.stones}` : reward.tickets ? `🎫×${reward.tickets}` : '';
    row.innerHTML = `
      <div class="mission-info">
        <div class="mission-name">${m.name}</div>
        <div class="mission-desc">${m.desc}</div>
        <div class="mission-progress">${Math.min(currentProg, goal)} / ${goal}</div>
      </div>
      <div class="mission-reward">${rewardStr}</div>
      <button class="claim-btn ${claimed ? 'claimed' : !completed ? 'locked-btn' : ''} mission-claim-btn ${isWeekly ? 'weekly-claim' : ''}"
        data-mission-id="${m.id}" ${!completed || claimed ? 'disabled' : ''}>
        ${claimed ? '✓ Done' : completed ? 'Claim' : 'Locked'}
      </button>
    `;
    return row;
  }

  activateMissionTab(tab) {
    // Toggle active class on tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const matches = btn.getAttribute('onclick')?.includes(`'${tab}'`);
      btn.classList.toggle('active', !!matches);
    });
    // Toggle visibility of content sections
    ['daily', 'weekly', 'login'].forEach(t => {
      const el = document.getElementById(`missions-${t}`);
      if (el) el.classList.toggle('active-tab', t === tab);
    });
  }

  // =================== Events Screen ===================

  renderEventsScreen(events, save, eventsSystem, onEventClick) {
    const container = document.getElementById('event-list');
    if (!container) return;
    container.innerHTML = '';

    if (events.length === 0) {
      container.innerHTML = '<div class="empty-state">No active events. Check back soon!</div>';
      return;
    }

    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.style.background = event.gradient || '#111';
      card.innerHTML = `
        <div class="event-header">
          <div class="event-icon">${event.icon}</div>
          <div class="event-info">
            <div class="event-name">${event.name}</div>
            <div class="event-subtitle">${event.subtitle}</div>
            <div class="event-timer">⏱ ${eventsSystem.getTimeRemaining(event)}</div>
          </div>
          <div class="event-badge" style="background:${event.badgeColor || '#FFD700'}">${event.badge}</div>
        </div>
        <div class="event-footer">
          <div class="event-footer-rewards">Tap to view stages & rewards</div>
          <div class="event-footer-arrow">▶</div>
        </div>
      `;
      card.addEventListener('click', () => onEventClick(event.id));
      container.appendChild(card);
    });
  }

  renderEventDetail(eventId, save, eventsSystem, onStageClick) {
    const screen = document.getElementById('event-detail');
    if (!screen) return;

    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return;

    const titleEl = document.getElementById('event-detail-title');
    if (titleEl) titleEl.textContent = event.name;

    const content = document.getElementById('event-detail-content');
    if (!content) return;

    const prog = save.eventProgress?.[eventId] || { completed: [], claimed: [] };
    const stages = event.stages || event.floors || [];

    let stagesHTML = stages.map((stage, i) => {
      const stageId = stage.id || `stage_${i}`;
      const completed = prog.completed?.includes(stageId);
      const claimed = prog.claimed?.includes(stageId);
      const rewards = stage.rewards || {};
      const rewardStr = [
        rewards.gems ? `💎${rewards.gems}` : '',
        rewards.stones ? `🪨${rewards.stones}` : '',
        rewards.tickets ? `🎫×${rewards.tickets}` : '',
      ].filter(Boolean).join(' ');

      return `<div class="event-stage ${completed ? 'stage-done' : ''}">
        <div class="stage-info">
          <div class="stage-name">${stage.name || `Stage ${i + 1}`}</div>
          ${stage.staminaCost ? `<div class="stage-cost">⚡ ${stage.staminaCost} Stamina</div>` : ''}
          <div class="stage-reward">${rewardStr}</div>
        </div>
        <div class="stage-acts">
          ${completed && !claimed
            ? `<button class="stage-claim-btn" data-event="${eventId}" data-stage="${stageId}" data-reward='${JSON.stringify(rewards)}'>Claim</button>`
            : ''}
          ${claimed ? '<span class="claimed-check">✓ Claimed</span>' : ''}
          <button class="stage-play-btn" data-event="${eventId}" data-stage="${i}">▶ Play</button>
        </div>
      </div>`;
    }).join('');

    // Anniversary event special handling
    if (event.type === 'celebration' && event.dailyRewards) {
      const loginDays = save.eventProgress?.[eventId]?.loginDays || 0;
      stagesHTML = event.dailyRewards.map((r, i) => `
        <div class="event-stage ${i < loginDays ? 'stage-done' : i === loginDays ? 'stage-active' : ''}">
          <div class="stage-info">
            <div class="stage-name">Day ${i + 1}</div>
            <div class="stage-reward">${r.icon} ${r.gems ? `💎${r.gems}` : ''}${r.tickets ? ` 🎫×${r.tickets}` : ''}</div>
          </div>
          ${i === loginDays
            ? `<button class="stage-play-btn" data-event="${eventId}" data-stage="${i}">Claim Day ${i + 1}</button>`
            : ''}
        </div>
      `).join('');
    }

    content.innerHTML = `
      <div class="event-header" style="background:${event.gradient}">
        <div class="event-header-icon">${event.icon}</div>
        <div class="event-header-name">${event.name}</div>
        <div class="event-header-timer">⏱ ${eventsSystem.getTimeRemaining(event)}</div>
      </div>
      <div class="event-desc">${event.description}</div>
      <div class="event-stages">${stagesHTML}</div>
    `;
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
        <div class="card-cost"><span class="stamina-icon">⚡</span><span>${card.staminaCost}</span></div>
        ${!canPlay ? '<div class="card-overlay"></div>' : ''}
      `;

      if (!canPlay) {
        cardEl.classList.add('card-disabled');
        cardEl.style.filter = 'grayscale(60%) brightness(0.7)';
      }
      cardEl.addEventListener('click', () => {
        if (canPlay) {
          cardEl.classList.add('card-used');
          this.triggerCardFlash(colorMap[card.type]);
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
      if (isDefeated || isOnCooldown) btn.classList.add('switch-disabled');
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
    setTimeout(() => { el.classList.remove('announce-active'); el.classList.add('hidden'); }, 1800);
  }

  showUltimateAnnounce(name) {
    const el = document.getElementById('ultimate-announce');
    if (!el) return;
    el.textContent = '★ ' + name.toUpperCase() + ' ★';
    el.classList.remove('hidden');
    el.classList.add('announce-active');
    setTimeout(() => { el.classList.remove('announce-active'); el.classList.add('hidden'); }, 2200);
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

  // =================== Grand Rush Selector ===================

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
    const title = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');
    const statsEl = document.getElementById('result-stats');
    const retryBtn = document.getElementById('retry-btn');

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
        <div class="stat-row"><span>Total Damage</span><span>${stats.damageDealt || 0}</span></div>
        <div class="stat-row"><span>Max Combo</span><span>${stats.maxCombo || 0} hits</span></div>
        <div class="stat-row"><span>Grand Rush</span><span>${stats.grandRushUsed ? '✅ Used' : '—'}</span></div>
        <div class="stat-row"><span>Specials</span><span>${stats.specialsUsed || 0}</span></div>
      `;
    }
    // Reset retry button label in case it was changed by PvP
    if (retryBtn) {
      retryBtn.innerHTML = '<span class="btn-icon">⚔️</span><span>BATTLE AGAIN</span>';
    }
    this.showScreen('result-screen');
  }

  // =================== Character Select ===================

  buildCharacterSelect(characters, selectedTeam, onSelect, onReady) {
    const grid = document.getElementById('character-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const countEl = document.getElementById('selected-count');
    if (countEl) countEl.textContent = selectedTeam.length;

    const synergies = typeof getTeamSynergies === 'function' ? getTeamSynergies(selectedTeam) : [];
    const synergyEl = document.getElementById('synergy-text');
    if (synergyEl) {
      synergyEl.textContent = synergies.length > 0 ? synergies.map(s => s.name).join(' + ') : '—';
    }

    Object.values(characters).forEach(char => {
      if (!char) return;
      const card = document.createElement('div');
      card.className = 'char-select-card';
      card.setAttribute('data-char-id', char.id);
      const isSelected = selectedTeam.includes(char.id);
      const slotNum = selectedTeam.indexOf(char.id) + 1;

      card.innerHTML = `
        <div class="char-card-portrait" style="background:linear-gradient(135deg,${char.modelColor},#000)">
          <div class="char-card-icon" style="font-size:32px">${char.arts?.strike?.icon || char.icon || '?'}</div>
        </div>
        <div class="char-card-name">${char.name}</div>
        <div class="char-card-title">${char.title}</div>
        <div class="char-card-tags">${(char.tags || []).slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="char-stats-row"><span>ATK ${char.power}</span><span>SPD ${char.speed}</span><span>DEF ${char.defense}</span></div>
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
      readyBtn.onclick = onReady;
    }
  }

  updateTeamSlots(selectedTeam, characters) {
    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`team-slot-${i}`);
      if (!slot) continue;
      const charId = selectedTeam[i];
      if (charId && characters[charId]) {
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
    const icons = {
      attackBoost: { icon: '⬆️', color: '#FF8888', label: 'ATK UP' },
      defenseUp: { icon: '🛡️', color: '#88FF88', label: 'DEF UP' },
      armor: { icon: '🔒', color: '#88FFFF', label: 'ARMOR' },
      cardSpeedUp: { icon: '⚡', color: '#FFFF44', label: 'SPEED' },
      powerShot: { icon: '⚡', color: '#FFFF44', label: 'CHARGED' }
    };
    Object.entries(activeEffects).forEach(([key, effect]) => {
      if (!effect) return;
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
