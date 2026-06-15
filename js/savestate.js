// One Piece Legends - Save State Manager

class SaveState {
  static KEY = 'opl_save_v2';

  static defaultData() {
    return {
      gems: 3000,
      tickets: 10,
      ownedCharacters: {
        luffy:  { stars: 1, level: 1, fragments: 0, exp: 0 },
        zoro:   { stars: 1, level: 1, fragments: 0, exp: 0 },
        sanji:  { stars: 1, level: 1, fragments: 0, exp: 0 },
        buggy:  { stars: 1, level: 1, fragments: 0, exp: 0 },
        coby:   { stars: 1, level: 1, fragments: 0, exp: 0 },
      },
      equippedMedals: {},
      inventory: {
        upgradeStones: 200,
        berries: 50000,
        expCards: { small: 10, medium: 5, large: 0 },
        medals: {},
        recruitTickets: 3,
      },
      storyProgress: {
        eastblue: { completed: [], stars: {} },
      },
      pvp: {
        rank: 'Rookie',
        rating: 800,
        rankPoints: 0,
        wins: 0,
        losses: 0,
        streak: 0,
        season: 1,
        seasonRewardsClaimed: false,
        lastOpponents: [],
      },
      missions: {
        dailyLastReset: null,
        weeklyLastReset: null,
        dailyCompleted: [],
        dailyClaimed: [],
        weeklyCompleted: [],
        weeklyClaimed: [],
      },
      loginBonus: {
        lastLogin: null,
        streak: 0,
        totalDays: 0,
        claimed: [],
      },
      bannerPity: {},
      stepUpProgress: {},
      totalPulls: 0,
      firstLaunch: true,
      createdAt: new Date().toISOString(),
    };
  }

  static load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const data = JSON.parse(raw);
        return this.migrate(data);
      }
    } catch (e) { console.warn('Save load failed:', e); }
    return this.defaultData();
  }

  static save(data) {
    try {
      data.savedAt = new Date().toISOString();
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) { console.warn('Save failed:', e); }
  }

  static migrate(data) {
    const defaults = this.defaultData();
    // Deep merge defaults for any missing keys
    return this.deepMerge(defaults, data);
  }

  static deepMerge(defaults, override) {
    const result = { ...defaults };
    Object.keys(override).forEach(key => {
      if (key in defaults && typeof defaults[key] === 'object' && !Array.isArray(defaults[key]) && defaults[key] !== null) {
        result[key] = this.deepMerge(defaults[key], override[key]);
      } else {
        result[key] = override[key];
      }
    });
    return result;
  }

  static addGems(data, amount) {
    data.gems = (data.gems || 0) + amount;
    this.save(data);
  }

  static spendGems(data, amount) {
    if (data.gems < amount) return false;
    data.gems -= amount;
    this.save(data);
    return true;
  }

  static addCharacter(data, charId, fragments = 1) {
    if (!data.ownedCharacters[charId]) {
      data.ownedCharacters[charId] = { stars: 1, level: 1, fragments: 0, exp: 0 };
      data.ownedCharacters[charId].isNew = true;
    } else {
      data.ownedCharacters[charId].fragments = (data.ownedCharacters[charId].fragments || 0) + fragments;
    }
    this.save(data);
  }

  static getCharacterData(data, charId) {
    return data.ownedCharacters[charId] || null;
  }

  static ownsCharacter(data, charId) {
    return !!data.ownedCharacters[charId];
  }

  static starUp(data, charId) {
    const charSave = data.ownedCharacters[charId];
    if (!charSave) return false;
    const charDef = ALL_CHARACTERS[charId];
    if (!charDef) return false;
    const costs = [0, 5, 10, 20, 35, 50, 75]; // frags needed to go from star X to X+1
    const needed = costs[charSave.stars] || 999;
    if (charSave.fragments < needed || charSave.stars >= 7) return false;
    charSave.fragments -= needed;
    charSave.stars++;
    this.save(data);
    return true;
  }

  static levelUp(data, charId, expToAdd) {
    const charSave = data.ownedCharacters[charId];
    if (!charSave) return;
    charSave.exp = (charSave.exp || 0) + expToAdd;
    // Level thresholds: each level requires level * 100 exp
    while (charSave.level < 200) {
      const needed = charSave.level * 100;
      if (charSave.exp >= needed) {
        charSave.exp -= needed;
        charSave.level++;
      } else break;
    }
    this.save(data);
  }

  static checkLoginBonus(data) {
    const today = new Date().toDateString();
    const bonus = data.loginBonus;
    if (bonus.lastLogin === today) return null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (bonus.lastLogin === yesterday) {
      bonus.streak++;
    } else {
      bonus.streak = 1;
    }
    bonus.lastLogin = today;
    bonus.totalDays = (bonus.totalDays || 0) + 1;
    this.save(data);
    return { dayIndex: (bonus.totalDays - 1) % 30, streak: bonus.streak };
  }

  static clearNewFlags(data) {
    Object.values(data.ownedCharacters).forEach(c => { delete c.isNew; });
    this.save(data);
  }
}
