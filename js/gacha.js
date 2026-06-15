// One Piece Legends - Gacha System

const BANNERS = [
  {
    id: 'standard',
    type: 'standard',
    name: 'Straw Hat Recruitment',
    subtitle: 'The Grand Line Awaits',
    theme: 'Sail the Grand Line with the Straw Hats!',
    color: '#1a3a6a',
    gradient: 'linear-gradient(135deg, #1a3a6a, #0a1030)',
    accent: '#4488CC',
    featured: [],
    pool: 'standard',
    isLimited: false,
    singleCost: 100,
    tenCost: 1000,
    rates: { R: 58, SR: 30, SSR: 10, Legendary: 1.5, EX: 0.5 },
    shipImage: '⛵',
    badgeColor: '#4488CC',
    badgeText: 'STANDARD',
  },
  {
    id: 'featured_g5',
    type: 'featured',
    name: 'Gear Fifth Awakening',
    subtitle: 'The Sun God Rises',
    theme: 'The power of Nika descends upon the Grand Line!',
    color: '#AA6600',
    gradient: 'linear-gradient(135deg, #441100, #221100)',
    accent: '#FFDD44',
    featured: ['luffy_g5'],
    featuredRarity: 'EX',
    pool: 'all',
    isLimited: true,
    endDays: 14,
    singleCost: 100,
    tenCost: 1000,
    rates: { R: 50, SR: 28, SSR: 14, Legendary: 4, EX: 4 },
    shipImage: '☀️',
    badgeColor: '#FFD700',
    badgeText: 'LIMITED',
    guarantee: 'Featured EX guaranteed within 50 pulls',
    featuredPityCount: 50,
  },
  {
    id: 'marineford',
    type: 'featured',
    name: 'Marineford Memorial',
    subtitle: 'The War That Shook the World',
    theme: 'Relive the greatest battle in pirate history.',
    color: '#884400',
    gradient: 'linear-gradient(135deg, #331100, #110000)',
    accent: '#FF8800',
    featured: ['whitebeard', 'ace'],
    featuredRarity: 'Legendary',
    pool: 'all',
    isLimited: true,
    endDays: 10,
    singleCost: 100,
    tenCost: 1000,
    rates: { R: 50, SR: 27, SSR: 14, Legendary: 7, EX: 2 },
    shipImage: '🔥',
    badgeColor: '#FF6600',
    badgeText: 'LIMITED',
    guarantee: 'Whitebeard or Ace guaranteed within 80 pulls',
    featuredPityCount: 80,
  },
  {
    id: 'stepup',
    type: 'stepup',
    name: 'Yonko Step-Up',
    subtitle: 'Each Step Brings New Power',
    theme: 'Increasing rewards with every step! Final step guarantees featured unit.',
    color: '#440088',
    gradient: 'linear-gradient(135deg, #220044, #110033)',
    accent: '#CC66FF',
    featured: ['kaido'],
    featuredRarity: 'Legendary',
    pool: 'all',
    isLimited: false,
    steps: [
      { step: 1, cost: 100,  pulls: 1,  bonus: null,                    label: 'Step 1 — Normal' },
      { step: 2, cost: 200,  pulls: 2,  bonus: 'SR guaranteed',         label: 'Step 2 — SR Guaranteed' },
      { step: 3, cost: 500,  pulls: 5,  bonus: 'SSR rate x2',           label: 'Step 3 — SSR Rate Up' },
      { step: 4, cost: 800,  pulls: 8,  bonus: 'SSR guaranteed',        label: 'Step 4 — SSR Guaranteed' },
      { step: 5, cost: 1000, pulls: 10, bonus: 'Featured unit guaranteed', label: 'Step 5 — FEATURED GUARANTEED' },
    ],
    rates: { R: 52, SR: 28, SSR: 12, Legendary: 6, EX: 2 },
    shipImage: '🌟',
    badgeColor: '#CC66FF',
    badgeText: 'STEP-UP',
  },
  {
    id: 'celebration',
    type: 'celebration',
    name: 'Anniversary Celebration',
    subtitle: 'One Year of Adventure!',
    theme: 'Celebrating one year of One Piece Legends!',
    color: '#AA0044',
    gradient: 'linear-gradient(135deg, #440011, #110022)',
    accent: '#FF44AA',
    featured: ['roger', 'shanks_ex'],
    featuredRarity: 'EX',
    pool: 'all',
    isLimited: true,
    endDays: 7,
    singleCost: 100,
    tenCost: 1000,
    rates: { R: 44, SR: 26, SSR: 18, Legendary: 6, EX: 6 },
    shipImage: '🎆',
    badgeColor: '#FF44AA',
    badgeText: 'ANNIVERSARY',
    guarantee: 'SSR guaranteed every 10 pulls — EX within 30 pulls',
    featuredPityCount: 30,
    specialMechanic: 'Every 10-pull guarantees an SSR or higher.',
  },
];

class GachaSystem {
  constructor(saveData) {
    this.save = saveData;
  }

  getBannerPity(bannerId) {
    if (!this.save.bannerPity[bannerId]) {
      this.save.bannerPity[bannerId] = { count: 0, featuredPity: 0 };
    }
    return this.save.bannerPity[bannerId];
  }

  getStepProgress(bannerId) {
    return this.save.stepUpProgress[bannerId] || 0;
  }

  summon(bannerId, count = 1, forceGuarantee = null) {
    const banner = BANNERS.find(b => b.id === bannerId);
    if (!banner) return [];

    const results = [];
    const pity = this.getBannerPity(bannerId);

    for (let i = 0; i < count; i++) {
      let rarity = forceGuarantee || this.rollRarity(banner, pity.count);

      // Pity guarantees
      pity.count++;
      if (pity.count >= 100 && !['SSR', 'Legendary', 'EX'].includes(rarity)) {
        rarity = 'SSR';
        pity.count = 0;
      }

      // Featured pity
      const featuredPityCount = banner.featuredPityCount;
      if (featuredPityCount) {
        pity.featuredPity = (pity.featuredPity || 0) + 1;
        if (pity.featuredPity >= featuredPityCount) {
          rarity = banner.featuredRarity || 'Legendary';
          pity.featuredPity = 0;
        }
      }

      const charId = this.selectCharacter(rarity, banner);
      const isNew = !SaveState.ownsCharacter(this.save, charId);
      const fragAmount = isNew ? 0 : RARITY_CONFIG[rarity].fragmentsPerDupe;

      SaveState.addCharacter(this.save, charId, fragAmount);
      this.save.totalPulls = (this.save.totalPulls || 0) + 1;

      results.push({ charId, rarity, isNew, fragments: fragAmount });
    }

    SaveState.save(this.save);
    return results;
  }

  summonStepUp(bannerId) {
    const banner = BANNERS.find(b => b.id === bannerId && b.type === 'stepup');
    if (!banner) return null;

    const currentStep = this.getStepProgress(bannerId);
    const stepDef = banner.steps[currentStep];
    if (!stepDef) return null;

    // Cost check handled by caller
    const pullCount = stepDef.pulls;
    let results;

    if (stepDef.step === 5 && banner.featured.length > 0) {
      // Last step: guarantee featured
      const normalPulls = this.summon(bannerId, pullCount - 1);
      const guaranteed = this.summon(bannerId, 1, banner.featuredRarity);
      // Ensure the guaranteed pull is a featured character
      if (guaranteed.length > 0 && banner.featured.length > 0) {
        const featuredId = banner.featured[Math.floor(Math.random() * banner.featured.length)];
        const isNew = !SaveState.ownsCharacter(this.save, featuredId);
        const frags = isNew ? 0 : RARITY_CONFIG[banner.featuredRarity].fragmentsPerDupe;
        SaveState.addCharacter(this.save, featuredId, frags);
        guaranteed[0] = { charId: featuredId, rarity: banner.featuredRarity, isNew, fragments: frags };
      }
      results = [...normalPulls, ...guaranteed];
    } else if (stepDef.bonus === 'SSR guaranteed') {
      const normal = this.summon(bannerId, pullCount - 1);
      const guaranteed = this.summon(bannerId, 1, 'SSR');
      results = [...normal, ...guaranteed];
    } else if (stepDef.bonus === 'SR guaranteed') {
      const normal = this.summon(bannerId, pullCount - 1);
      const guaranteed = this.summon(bannerId, 1, 'SR');
      results = [...normal, ...guaranteed];
    } else {
      results = this.summon(bannerId, pullCount);
    }

    // Advance step (loop back after step 5)
    this.save.stepUpProgress[bannerId] = (currentStep + 1) % banner.steps.length;
    SaveState.save(this.save);
    return { results, stepDef };
  }

  rollRarity(banner, pityCount) {
    const rates = { ...banner.rates };

    // Soft pity: SSR rate increases from pull 70-99
    if (pityCount >= 70) {
      const extra = (pityCount - 70) * 1.5;
      rates.SSR = Math.min(rates.SSR + extra, 50);
      rates.R = Math.max(0, rates.R - extra);
    }

    const total = Object.values(rates).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;

    for (const [rarity, weight] of Object.entries(rates)) {
      roll -= weight;
      if (roll <= 0) return rarity;
    }
    return 'R';
  }

  selectCharacter(rarity, banner) {
    let pool = RARITY_POOLS[rarity] || RARITY_POOLS.SSR;

    // Filter pool based on banner type
    if (banner.pool === 'standard') {
      pool = pool.filter(id => {
        const c = ALL_CHARACTERS[id];
        return c && ['R', 'SR', 'SSR'].includes(c.rarity);
      });
    }

    if (!pool.length) pool = RARITY_POOLS.R;

    // Featured bonus: 50% chance featured char is selected when rolling that rarity
    if (banner.featured.length > 0 && banner.featuredRarity === rarity && Math.random() < 0.5) {
      const featuredInPool = banner.featured.filter(id => pool.includes(id));
      if (featuredInPool.length > 0) {
        return featuredInPool[Math.floor(Math.random() * featuredInPool.length)];
      }
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  getTotalCostForStep(bannerId, step) {
    const banner = BANNERS.find(b => b.id === bannerId && b.type === 'stepup');
    if (!banner) return 0;
    const stepDef = banner.steps[step];
    return stepDef ? stepDef.cost : 0;
  }

  canAfford(cost) {
    return this.save.gems >= cost || this.save.tickets >= 1;
  }
}

// ─────────────────────────────────────────────────────────
//  SUMMON ANIMATION ENGINE
// ─────────────────────────────────────────────────────────
class SummonAnimator {
  constructor() {
    this.overlay = null;
    this.currentResults = [];
    this.currentIndex = 0;
    this.onComplete = null;
  }

  init() {
    this.overlay = document.getElementById('summon-overlay');
  }

  async playSummon(results, banner, onComplete) {
    this.currentResults = results;
    this.currentIndex = 0;
    this.onComplete = onComplete;
    this.currentBanner = banner;

    const overlay = document.getElementById('summon-overlay');
    if (!overlay) { onComplete?.(); return; }

    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Show ship animation phase
    await this.playShipPhase(banner, results);

    // Show card reveal phase
    this.showCardReveal(results, banner, onComplete);
  }

  async playShipPhase(banner, results) {
    const phase = document.getElementById('summon-ship-phase');
    const ship = document.getElementById('summon-ship-icon');
    const storm = document.getElementById('summon-storm');

    if (!phase) return;

    // Determine storm intensity from rarest pull
    const rarities = ['EX', 'Legendary', 'SSR', 'SR', 'R'];
    const topRarity = rarities.find(r => results.some(res => res.rarity === r)) || 'R';

    phase.style.display = 'flex';

    if (ship) {
      ship.textContent = banner.shipImage || '⛵';
      ship.style.animation = `shipSail 2.5s ease-in-out`;
    }

    // Storm intensity
    const intensities = { R: 0, SR: 1, SSR: 2, Legendary: 3, EX: 4 };
    const intensity = intensities[topRarity] || 0;
    if (storm) {
      storm.className = `summon-storm intensity-${intensity}`;
    }

    // Show rarity hint text
    const hint = document.getElementById('summon-rarity-hint');
    const hintTexts = {
      R: '', SR: 'Something stirs...', SSR: '★ The sea awakens!',
      Legendary: '★★★ Legendary power incoming!!!',
      EX: '☀ A divine presence descends!!'
    };
    if (hint) { hint.textContent = hintTexts[topRarity] || ''; }

    await new Promise(r => setTimeout(r, 2200));

    // Flash to white
    const flash = document.getElementById('summon-flash');
    if (flash) {
      flash.style.opacity = '1';
      await new Promise(r => setTimeout(r, 300));
      flash.style.opacity = '0';
    }

    if (phase) phase.style.display = 'none';
  }

  showCardReveal(results, banner, onComplete) {
    const cardPhase = document.getElementById('summon-card-phase');
    if (!cardPhase) { onComplete?.(); return; }

    cardPhase.style.display = 'flex';
    const container = document.getElementById('summon-cards-container');
    if (!container) { onComplete?.(); return; }

    container.innerHTML = '';

    const isMulti = results.length > 1;

    results.forEach((result, i) => {
      const char = ALL_CHARACTERS[result.charId];
      const rarityConfig = RARITY_CONFIG[result.rarity];
      const card = document.createElement('div');
      card.className = `summon-card ${isMulti ? 'multi-card' : 'single-card'} rarity-${result.rarity.toLowerCase()}`;
      card.setAttribute('data-index', i);
      card.innerHTML = `
        <div class="card-front">
          <div class="card-rarity-bg" style="background:${rarityConfig.color}22;border-color:${rarityConfig.color}"></div>
          <div class="card-glow-effect" style="background:radial-gradient(ellipse,${rarityConfig.glow}44,transparent)"></div>
          <div class="card-rarity-label" style="color:${rarityConfig.color}">${rarityConfig.label}</div>
          <div class="card-char-icon">${char?.icon || '⭐'}</div>
          <div class="card-char-name">${char?.name || result.charId}</div>
          <div class="card-char-title">${char?.title || ''}</div>
          ${result.isNew ? '<div class="card-new-badge">NEW!</div>' : `<div class="card-dupe-badge">+${result.fragments} Frags</div>`}
          <div class="card-shine"></div>
        </div>
        <div class="card-back">
          <div class="card-back-emblem">☠</div>
        </div>
      `;

      // Auto-flip with delay
      const delay = isMulti ? i * 200 : 500;
      setTimeout(() => {
        card.classList.add('flipped');
        if (result.rarity === 'EX' || result.rarity === 'Legendary') {
          card.classList.add('rainbow-flash');
          const flash = document.getElementById('summon-flash');
          if (flash) {
            flash.style.background = rarityConfig.glow;
            flash.style.opacity = '0.4';
            setTimeout(() => { flash.style.opacity = '0'; }, 300);
          }
        }
      }, delay + 400);

      container.appendChild(card);
    });

    // All revealed after delay
    const totalDelay = (isMulti ? results.length * 200 : 0) + 1200;

    // Show "collect" button
    const collectBtn = document.getElementById('summon-collect-btn');
    if (collectBtn) {
      collectBtn.style.display = 'none';
      setTimeout(() => { collectBtn.style.display = 'block'; }, totalDelay);
      collectBtn.onclick = () => {
        cardPhase.style.display = 'none';
        const overlay = document.getElementById('summon-overlay');
        if (overlay) {
          overlay.classList.remove('active');
          setTimeout(() => { overlay.style.display = 'none'; }, 400);
        }
        onComplete?.(results);
      };
    }
  }
}
