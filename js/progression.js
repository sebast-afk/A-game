// One Piece Legends - Character Progression System

const TREASURE_MEDALS = {
  straw_hp:    { id: 'straw_hp',    name: 'Straw Hat Medal',    icon: '🎩', set: 'straw_hat', stat: 'hp',      value: 50,  desc: '+50 HP' },
  straw_atk:   { id: 'straw_atk',   name: 'Going Merry Medal',  icon: '⛵', set: 'straw_hat', stat: 'attack',  value: 5,   desc: '+5% ATK' },
  straw_def:   { id: 'straw_def',   name: 'Sunny Medal',        icon: '☀️', set: 'straw_hat', stat: 'defense', value: 5,   desc: '+5% DEF' },
  marine_def:  { id: 'marine_def',  name: 'Justice Medal',      icon: '⚓', set: 'marines',   stat: 'defense', value: 8,   desc: '+8% DEF' },
  marine_hp:   { id: 'marine_hp',   name: 'Seastone Medal',     icon: '🔷', set: 'marines',   stat: 'hp',      value: 80,  desc: '+80 HP' },
  marine_spd:  { id: 'marine_spd',  name: 'Den Den Mushi',      icon: '🐌', set: 'marines',   stat: 'speed',   value: 6,   desc: '+6% SPD' },
  wano_atk:    { id: 'wano_atk',    name: 'Wano Katana Medal',  icon: '🗡️', set: 'wano',      stat: 'attack',  value: 10,  desc: '+10% ATK' },
  wano_gr:     { id: 'wano_gr',     name: 'Wano Drum Medal',    icon: '🥁', set: 'wano',      stat: 'grand_rush', value: 15, desc: '+15% Grand Rush gain' },
  wano_sp:     { id: 'wano_sp',     name: 'Oni Mask Medal',     icon: '👹', set: 'wano',      stat: 'special', value: 12, desc: '+12% Special dmg' },
  mf_atk:      { id: 'mf_atk',     name: 'Marineford Medal',   icon: '⚔️', set: 'marineford', stat: 'attack', value: 12,  desc: '+12% ATK' },
  mf_hp:       { id: 'mf_hp',      name: 'Ace\'s Medal',       icon: '🔥', set: 'marineford', stat: 'hp',     value: 120, desc: '+120 HP' },
  mf_sp:       { id: 'mf_sp',      name: 'Whitebeard\'s Naginata', icon:'🔱', set:'marineford', stat:'special', value:15, desc:'+15% Special dmg' },
  yonko_atk:   { id: 'yonko_atk',  name: 'Yonko Crest Medal',  icon: '👑', set: 'yonko',     stat: 'attack',  value: 15,  desc: '+15% ATK' },
  yonko_spd:   { id: 'yonko_spd',  name: 'Emperor\'s Medal',   icon: '🌊', set: 'yonko',     stat: 'speed',   value: 12,  desc: '+12% SPD' },
  yonko_gr:    { id: 'yonko_gr',   name: 'Grand Fleet Medal',  icon: '🛳️', set: 'yonko',     stat: 'grand_rush', value: 20, desc: '+20% Grand Rush gain' },
};

const MEDAL_SETS = {
  straw_hat:   { name: 'Straw Hat Pirates',   medals: ['straw_hp', 'straw_atk', 'straw_def'],  setBonus: { hp: 150, attack: 0.10, desc: '+150 HP, +10% ATK' } },
  marines:     { name: 'Marine Corps',        medals: ['marine_def', 'marine_hp', 'marine_spd'], setBonus: { defense: 0.15, hp: 100, desc: '+15% DEF, +100 HP' } },
  wano:        { name: 'Wano Warriors',       medals: ['wano_atk', 'wano_gr', 'wano_sp'],      setBonus: { attack: 0.15, grand_rush: 0.20, desc: '+15% ATK, +20% Grand Rush' } },
  marineford:  { name: 'Marineford Heroes',   medals: ['mf_atk', 'mf_hp', 'mf_sp'],           setBonus: { attack: 0.18, hp: 200, desc: '+18% ATK, +200 HP' } },
  yonko:       { name: 'Four Emperors',       medals: ['yonko_atk', 'yonko_spd', 'yonko_gr'], setBonus: { attack: 0.20, speed: 0.15, desc: '+20% ATK, +15% SPD' } },
};

const SOUL_BOOST_NODES = [
  // Row 1
  { id: 'sb_hp1',    row: 0, col: 0, type: 'stat', stat: 'hp',      value: 100,  cost: { stones: 3 },  label: '+100 HP' },
  { id: 'sb_atk1',   row: 0, col: 1, type: 'stat', stat: 'power',   value: 2,    cost: { stones: 3 },  label: '+2 ATK' },
  { id: 'sb_spd1',   row: 0, col: 2, type: 'stat', stat: 'speed',   value: 2,    cost: { stones: 3 },  label: '+2 SPD' },
  { id: 'sb_def1',   row: 0, col: 3, type: 'stat', stat: 'defense', value: 2,    cost: { stones: 3 },  label: '+2 DEF' },
  // Row 2
  { id: 'sb_hp2',    row: 1, col: 0, type: 'stat', stat: 'hp',      value: 200,  cost: { stones: 8 },  label: '+200 HP',       requires: 'sb_hp1' },
  { id: 'sb_atk2',   row: 1, col: 1, type: 'stat', stat: 'power',   value: 5,    cost: { stones: 8 },  label: '+5 ATK',        requires: 'sb_atk1' },
  { id: 'sb_skill1', row: 1, col: 2, type: 'skill',desc: 'Reduce Skill Arts stamina cost by 5', cost: { stones: 10 }, label: 'Skill Cost -5', requires: 'sb_spd1' },
  { id: 'sb_def2',   row: 1, col: 3, type: 'stat', stat: 'defense', value: 5,    cost: { stones: 8 },  label: '+5 DEF',        requires: 'sb_def1' },
  // Row 3
  { id: 'sb_hp3',    row: 2, col: 0, type: 'stat', stat: 'hp',      value: 350,  cost: { stones: 15 }, label: '+350 HP',       requires: 'sb_hp2' },
  { id: 'sb_atk3',   row: 2, col: 1, type: 'stat', stat: 'power',   value: 8,    cost: { stones: 15 }, label: '+8 ATK',        requires: 'sb_atk2' },
  { id: 'sb_sp_dmg', row: 2, col: 2, type: 'skill',desc: 'Special Arts damage +10%', cost: { stones: 20 }, label: 'Spl +10%', requires: 'sb_skill1' },
  { id: 'sb_vanish', row: 2, col: 3, type: 'skill',desc: 'Vanish recharge 20% faster', cost: { stones: 20 }, label: 'Vanish+',   requires: 'sb_def2' },
  // Row 4 (Pinnacle)
  { id: 'sb_pinnacle',row: 3, col: 1, type: 'passive', desc: 'Signature Trait activated', cost: { stones: 40 }, label: '★ PINNACLE', requires: 'sb_atk3', isPinnacle: true },
];

class ProgressionSystem {
  constructor(saveData) {
    this.save = saveData;
  }

  // ── LEVELING ──────────────────────────────────────────────
  getExpToNextLevel(level) {
    return level * 120;
  }

  getLevelCap() { return 200; }

  useExpCard(charId, cardType) {
    const expValues = { small: 500, medium: 2000, large: 8000 };
    const exp = expValues[cardType] || 0;
    const inv = this.save.inventory.expCards;
    if (!inv[cardType] || inv[cardType] <= 0) return false;
    inv[cardType]--;
    SaveState.levelUp(this.save, charId, exp);
    return true;
  }

  // ── STARS ─────────────────────────────────────────────────
  canStarUp(charId) {
    const charSave = this.save.ownedCharacters[charId];
    if (!charSave || charSave.stars >= 7) return false;
    const needed = STAR_FRAGMENT_COSTS[charSave.stars] || 999;
    return (charSave.fragments || 0) >= needed;
  }

  doStarUp(charId) {
    return SaveState.starUp(this.save, charId);
  }

  getStarProgress(charId) {
    const charSave = this.save.ownedCharacters[charId];
    if (!charSave) return { stars: 0, fragments: 0, needed: 0, canUp: false };
    const stars = charSave.stars || 1;
    const frags = charSave.fragments || 0;
    const needed = stars < 7 ? (STAR_FRAGMENT_COSTS[stars] || 999) : 0;
    return { stars, fragments: frags, needed, canUp: stars < 7 && frags >= needed };
  }

  // ── SOUL BOOST ────────────────────────────────────────────
  getSoulBoostState(charId) {
    if (!this.save.soulBoost) this.save.soulBoost = {};
    return this.save.soulBoost[charId] || { unlocked: [] };
  }

  canUnlockNode(charId, nodeId) {
    const node = SOUL_BOOST_NODES.find(n => n.id === nodeId);
    if (!node) return false;
    const state = this.getSoulBoostState(charId);
    if (state.unlocked.includes(nodeId)) return false;
    if (node.requires && !state.unlocked.includes(node.requires)) return false;
    const inv = this.save.inventory;
    if (node.cost.stones && (inv.upgradeStones || 0) < node.cost.stones) return false;
    return true;
  }

  unlockNode(charId, nodeId) {
    if (!this.canUnlockNode(charId, nodeId)) return false;
    const node = SOUL_BOOST_NODES.find(n => n.id === nodeId);
    const inv = this.save.inventory;
    if (node.cost.stones) inv.upgradeStones -= node.cost.stones;
    const state = this.getSoulBoostState(charId);
    state.unlocked.push(nodeId);
    if (!this.save.soulBoost) this.save.soulBoost = {};
    this.save.soulBoost[charId] = state;
    SaveState.save(this.save);
    return true;
  }

  // ── MEDALS ────────────────────────────────────────────────
  getEquippedMedals(charId) {
    return this.save.equippedMedals[charId] || [null, null, null, null, null, null];
  }

  equipMedal(charId, slotIndex, medalId) {
    if (!this.save.equippedMedals[charId]) {
      this.save.equippedMedals[charId] = [null, null, null, null, null, null];
    }
    if (medalId && !this.save.inventory.medals[medalId]) return false;
    const prev = this.save.equippedMedals[charId][slotIndex];
    if (prev) {
      this.save.inventory.medals[prev] = (this.save.inventory.medals[prev] || 0) + 1;
    }
    if (medalId) {
      this.save.inventory.medals[medalId]--;
      if (this.save.inventory.medals[medalId] <= 0) delete this.save.inventory.medals[medalId];
    }
    this.save.equippedMedals[charId][slotIndex] = medalId || null;
    SaveState.save(this.save);
    return true;
  }

  getMedalSetBonus(charId) {
    const equipped = this.getEquippedMedals(charId);
    const activeSets = {};
    equipped.forEach(medalId => {
      if (!medalId) return;
      const medal = TREASURE_MEDALS[medalId];
      if (!medal) return;
      activeSets[medal.set] = (activeSets[medal.set] || 0) + 1;
    });
    const bonuses = {};
    Object.entries(activeSets).forEach(([setId, count]) => {
      const setDef = MEDAL_SETS[setId];
      if (setDef && count >= 3) {
        Object.assign(bonuses, setDef.setBonus);
        bonuses.setName = setDef.name;
      }
    });
    return bonuses;
  }

  getOwnedMedals() {
    return Object.entries(this.save.inventory.medals || {})
      .filter(([, count]) => count > 0)
      .map(([id, count]) => ({ ...TREASURE_MEDALS[id], count }));
  }
}
