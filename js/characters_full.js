// One Piece Legends - Full Character Database (All Rarities)

const RARITY_CONFIG = {
  R:         { label: 'R',          color: '#888888', glow: '#AAAAAA', weight: 580, fragmentsPerDupe: 1,  gemValue: 10  },
  SR:        { label: 'SR',         color: '#4488FF', glow: '#88AAFF', weight: 300, fragmentsPerDupe: 3,  gemValue: 30  },
  SSR:       { label: 'SSR',        color: '#FFD700', glow: '#FFEE88', weight: 90,  fragmentsPerDupe: 10, gemValue: 100 },
  Legendary: { label: 'LEGENDARY',  color: '#FF6600', glow: '#FF9944', weight: 20,  fragmentsPerDupe: 25, gemValue: 300 },
  EX:        { label: 'EX',         color: '#FF00FF', glow: '#FF88FF', weight: 10,  fragmentsPerDupe: 50, gemValue: 500 },
};

const STAR_FRAGMENT_COSTS = [0, 5, 10, 20, 35, 50, 75]; // cost to go star→star+1

// ─────────────────────────────────────────────────────────
//  R  TIER
// ─────────────────────────────────────────────────────────
const R_CHARACTERS = {
  buggy: {
    id: 'buggy', rarity: 'R',
    name: 'Buggy', title: 'The Clown Pirate',
    color: 0xFF6622, accentColor: 0xFFCC00, modelColor: '#FF6622',
    icon: '🎪',
    hp: 320, maxHp: 320, power: 42, speed: 55, defense: 38,
    tags: ['Warlords'],
    switchInEffect: 'none', switchInDesc: '—',
    statGrowth: { hp: 20, power: 2, speed: 2, defense: 1 },
    arts: {
      strike: { name: 'Chop-Chop Fist', type: 'strike', staminaCost: 15, damage: 55, range: 'mid', comboCount: 2, color: '#FF8833', icon: '🤜' },
      skill:  { name: 'Big Top Split', type: 'skill', staminaCost: 25, damage: 0, description: 'Detaches body, briefly confusing enemy', effect: 'staminaDrain', color: '#FFCC44', icon: '🎭' },
      special: { name: 'Chop-Chop Cannon', type: 'special', staminaCost: 40, damage: 160, range: 'any', color: '#FF6600', icon: '💣' },
      ultimate: { name: 'Bara Bara Festival', type: 'ultimate', staminaCost: 60, damage: 280, range: 'any', condition: 'always', color: '#FF8800', icon: '🎆' },
    },
  },

  coby: {
    id: 'coby', rarity: 'R',
    name: 'Coby', title: 'The Navy Rookie',
    color: 0x4488CC, accentColor: 0x88AAFF, modelColor: '#4488CC',
    icon: '⚓',
    hp: 300, maxHp: 300, power: 40, speed: 60, defense: 42,
    tags: ['Marines'],
    switchInEffect: 'healTeam', switchInDesc: 'Restore 30 HP to lowest-HP ally',
    statGrowth: { hp: 18, power: 2, speed: 2, defense: 2 },
    arts: {
      strike: { name: 'Pistol Punch', type: 'strike', staminaCost: 15, damage: 48, range: 'close', comboCount: 2, color: '#4488CC', icon: '👊' },
      skill:  { name: 'Haki Training', type: 'skill', staminaCost: 25, damage: 0, description: 'Brief defense boost for 6s', effect: 'defenseUp', color: '#6699FF', icon: '🌀' },
      special: { name: 'Roseo Metel', type: 'special', staminaCost: 40, damage: 140, range: 'close', color: '#8888FF', icon: '🌸' },
      ultimate: { name: 'Color of Observation', type: 'ultimate', staminaCost: 60, damage: 240, range: 'any', condition: 'always', color: '#AAAAFF', icon: '👁️' },
    },
  },

  alvida: {
    id: 'alvida', rarity: 'R',
    name: 'Alvida', title: 'Iron Mace Alvida',
    color: 0xFF88AA, accentColor: 0xFFCCDD, modelColor: '#FF88AA',
    icon: '🔱',
    hp: 340, maxHp: 340, power: 45, speed: 48, defense: 50,
    tags: [],
    switchInEffect: 'none', switchInDesc: '—',
    statGrowth: { hp: 22, power: 2, speed: 1, defense: 2 },
    arts: {
      strike: { name: 'Mace Slam', type: 'strike', staminaCost: 15, damage: 60, range: 'close', comboCount: 2, color: '#FF88AA', icon: '🔨' },
      skill:  { name: 'Smooth Body', type: 'skill', staminaCost: 25, damage: 0, description: 'Slip-Slip Fruit — next attack is un-dodgeable', effect: 'piercingShot', color: '#FFAABB', icon: '💅' },
      special: { name: 'Slip-Slip Cannon', type: 'special', staminaCost: 40, damage: 155, range: 'mid', color: '#FF6688', icon: '⚡' },
      ultimate: { name: 'Full Power Swing', type: 'ultimate', staminaCost: 60, damage: 260, range: 'any', condition: 'always', color: '#FF44AA', icon: '💥' },
    },
  },

  helmeppo: {
    id: 'helmeppo', rarity: 'R',
    name: 'Helmeppo', title: 'Marine Officer',
    color: 0x8888CC, accentColor: 0xAAAAEE, modelColor: '#8888CC',
    icon: '🗡️',
    hp: 310, maxHp: 310, power: 38, speed: 62, defense: 40,
    tags: ['Marines'],
    switchInEffect: 'drawCard', switchInDesc: 'Draw 1 extra card on entry',
    statGrowth: { hp: 16, power: 2, speed: 3, defense: 2 },
    arts: {
      strike: { name: 'Twin Kukri', type: 'strike', staminaCost: 15, damage: 45, range: 'close', comboCount: 3, color: '#8888CC', icon: '⚔️' },
      skill:  { name: 'Taunt', type: 'skill', staminaCost: 25, damage: 0, description: 'Forces enemy to attack this unit for 5s', effect: 'taunt', color: '#AAAAEE', icon: '😤' },
      special: { name: 'Wolf Pack Ambush', type: 'special', staminaCost: 40, damage: 135, range: 'close', color: '#AAAAFF', icon: '🐺' },
      ultimate: { name: 'Cross of Doom', type: 'ultimate', staminaCost: 60, damage: 230, range: 'any', condition: 'always', color: '#CCCCFF', icon: '✚' },
    },
  },
};

// ─────────────────────────────────────────────────────────
//  SR  TIER
// ─────────────────────────────────────────────────────────
const SR_CHARACTERS = {
  crocodile: {
    id: 'crocodile', rarity: 'SR',
    name: 'Crocodile', title: 'Sir Crocodile — Warlord',
    color: 0xCC9900, accentColor: 0xFFDD44, modelColor: '#CC9900',
    icon: '🏜️',
    hp: 520, maxHp: 520, power: 72, speed: 65, defense: 68,
    tags: ['Warlords', 'Devil Fruit User'],
    switchInEffect: 'debuffClear', switchInDesc: 'Clears all debuffs',
    statGrowth: { hp: 30, power: 3, speed: 2, defense: 3 },
    arts: {
      strike: { name: 'Sables', type: 'strike', staminaCost: 15, damage: 75, range: 'mid', comboCount: 3, color: '#CC9900', icon: '🌪️' },
      skill:  { name: 'Dessication', type: 'skill', staminaCost: 25, damage: 0, description: 'Drains enemy stamina — costs them 20 stamina', effect: 'staminaDrain', color: '#DDAA00', icon: '💨' },
      special: { name: 'Ground Death', type: 'special', staminaCost: 40, damage: 220, range: 'any', color: '#FF8800', icon: '💀' },
      ultimate: { name: 'Crocodile no Minami', type: 'ultimate', staminaCost: 60, damage: 390, range: 'any', condition: 'always', color: '#FFCC00', icon: '🌊' },
    },
  },

  franky: {
    id: 'franky', rarity: 'SR',
    name: 'Franky', title: 'Cyborg Shipwright',
    color: 0x4488FF, accentColor: 0x88CCFF, modelColor: '#4488FF',
    icon: '🤖',
    hp: 580, maxHp: 580, power: 68, speed: 55, defense: 82,
    tags: ['Straw Hat Pirates'],
    switchInEffect: 'defenseUp', switchInDesc: 'DEF +20% for 10s',
    statGrowth: { hp: 38, power: 3, speed: 2, defense: 4 },
    arts: {
      strike: { name: 'Strong Right', type: 'strike', staminaCost: 15, damage: 72, range: 'long', comboCount: 2, color: '#4488FF', icon: '🤜' },
      skill:  { name: 'Cola Boost', type: 'skill', staminaCost: 25, damage: 0, description: 'Boosts ATK and DEF for 12s', effect: 'attackBoost', effectValue: 0.20, color: '#88CCFF', icon: '⚙️' },
      special: { name: 'Radical Beam', type: 'special', staminaCost: 40, damage: 230, range: 'any', color: '#6699FF', icon: '💡' },
      ultimate: { name: 'General Franky', type: 'ultimate', staminaCost: 60, damage: 400, range: 'any', condition: 'always', color: '#88BBFF', icon: '🤖' },
    },
  },

  brook: {
    id: 'brook', rarity: 'SR',
    name: 'Brook', title: 'Soul King',
    color: 0xEEEEEE, accentColor: 0xCCCCFF, modelColor: '#EEEEEE',
    icon: '🎵',
    hp: 490, maxHp: 490, power: 65, speed: 92, defense: 55,
    tags: ['Straw Hat Pirates'],
    switchInEffect: 'speedUp', switchInDesc: 'SPD +35% for 10s',
    statGrowth: { hp: 28, power: 3, speed: 4, defense: 2 },
    arts: {
      strike: { name: 'Aubade Coup Vent', type: 'strike', staminaCost: 15, damage: 68, range: 'close', comboCount: 4, color: '#DDDDFF', icon: '🎸' },
      skill:  { name: 'Soul Solid', type: 'skill', staminaCost: 25, damage: 0, description: 'Freezes one enemy limb — reduces their speed', effect: 'speedDebuff', color: '#AAAAFF', icon: '❄️' },
      special: { name: 'Arrow Notch Slash', type: 'special', staminaCost: 40, damage: 210, range: 'close', color: '#CCCCFF', icon: '🌙' },
      ultimate: { name: 'Quartet: Death Requiem', type: 'ultimate', staminaCost: 60, damage: 370, range: 'any', condition: 'always', color: '#EEEEFF', icon: '🎶' },
    },
  },

  chopper: {
    id: 'chopper', rarity: 'SR',
    name: 'Tony Tony Chopper', title: 'Cotton Candy Lover',
    color: 0xFF6688, accentColor: 0xFFAABB, modelColor: '#FF6688',
    icon: '🦌',
    hp: 460, maxHp: 460, power: 60, speed: 75, defense: 65,
    tags: ['Straw Hat Pirates', 'Devil Fruit User'],
    switchInEffect: 'healTeam', switchInDesc: 'Restores 120 HP to lowest-HP ally',
    statGrowth: { hp: 26, power: 3, speed: 3, defense: 3 },
    arts: {
      strike: { name: 'Kokutei Roseo', type: 'strike', staminaCost: 15, damage: 62, range: 'close', comboCount: 3, color: '#FF6688', icon: '🦌' },
      skill:  { name: 'Rumble Ball', type: 'skill', staminaCost: 25, damage: 0, description: 'Transforms, boosting all stats for 8s', effect: 'attackBoost', effectValue: 0.25, duration: 8000, color: '#FFAABB', icon: '💊' },
      special: { name: 'Monster Point Rampage', type: 'special', staminaCost: 40, damage: 215, range: 'any', color: '#FF4466', icon: '👾' },
      ultimate: { name: 'Kung Fu Point Onslaught', type: 'ultimate', staminaCost: 60, damage: 375, range: 'any', condition: 'always', color: '#FF6688', icon: '⭐' },
    },
  },

  robin: {
    id: 'robin', rarity: 'SR',
    name: 'Nico Robin', title: 'Devil Child',
    color: 0x663399, accentColor: 0xAA66CC, modelColor: '#663399',
    icon: '🌸',
    hp: 500, maxHp: 500, power: 67, speed: 70, defense: 62,
    tags: ['Straw Hat Pirates', 'Devil Fruit User', 'Revolutionary Army'],
    switchInEffect: 'debuffClear', switchInDesc: 'Clears all debuffs on entry',
    statGrowth: { hp: 29, power: 3, speed: 3, defense: 3 },
    arts: {
      strike: { name: 'Cien Fleur: Wing', type: 'strike', staminaCost: 15, damage: 70, range: 'any', comboCount: 3, color: '#9966CC', icon: '🌸' },
      skill:  { name: 'Clutch', type: 'skill', staminaCost: 25, damage: 0, description: 'Restrains enemy — stun for 2.5s', effect: 'teleportStun', stunDuration: 2500, color: '#BB88EE', icon: '🤲' },
      special: { name: 'Mil Fleur: Gigantesco Mano', type: 'special', staminaCost: 40, damage: 228, range: 'any', color: '#CC88FF', icon: '🌺' },
      ultimate: { name: 'Demonio Fleur', type: 'ultimate', staminaCost: 60, damage: 405, range: 'any', condition: 'always', color: '#AA44FF', icon: '👹' },
    },
  },

  jinbe: {
    id: 'jinbe', rarity: 'SR',
    name: 'Jinbe', title: 'Knight of the Sea',
    color: 0x2266AA, accentColor: 0x4488CC, modelColor: '#2266AA',
    icon: '🐋',
    hp: 620, maxHp: 620, power: 70, speed: 58, defense: 88,
    tags: ['Straw Hat Pirates', 'Fish-Man'],
    switchInEffect: 'healTeam', switchInDesc: 'Restores 150 HP to lowest HP ally',
    statGrowth: { hp: 42, power: 3, speed: 2, defense: 4 },
    arts: {
      strike: { name: 'Gosenmaigawara Seiken', type: 'strike', staminaCost: 15, damage: 78, range: 'close', comboCount: 3, color: '#2266AA', icon: '🌊' },
      skill:  { name: 'Fish-Man Karate Stance', type: 'skill', staminaCost: 25, damage: 0, description: 'Defensive stance: absorbs next hit and counterattacks', effect: 'armor', duration: 6000, color: '#4488CC', icon: '🛡️' },
      special: { name: 'Vagabond Drill', type: 'special', staminaCost: 40, damage: 238, range: 'any', color: '#66AADD', icon: '💧' },
      ultimate: { name: 'Buraikan', type: 'ultimate', staminaCost: 60, damage: 420, range: 'any', condition: 'always', color: '#88CCFF', icon: '🌊' },
    },
  },
};

// ─────────────────────────────────────────────────────────
//  SSR  TIER  (existing 6 + Ace)
// ─────────────────────────────────────────────────────────
const SSR_CHARACTERS = {
  luffy: {
    id: 'luffy', rarity: 'SSR',
    name: 'Monkey D. Luffy', title: 'Captain of the Straw Hats',
    color: 0xFF3333, accentColor: 0xFFAA00, modelColor: '#FF3333',
    icon: '🎩',
    hp: 700, maxHp: 700, power: 85, speed: 90, defense: 70,
    tags: ['Straw Hat Pirates', 'Worst Generation', 'Devil Fruit User'],
    switchInEffect: 'attackUp', switchInDesc: 'ATK +20% for 10s',
    statGrowth: { hp: 45, power: 4, speed: 4, defense: 3 },
    arts: {
      strike:  { name: 'Gum-Gum Pistol',    type: 'strike',  staminaCost: 15, damage: 85,  range: 'mid', comboCount: 3, color: '#FF4444', icon: '👊' },
      skill:   { name: 'Gear Second',        type: 'skill',   staminaCost: 25, damage: 0,   description: 'ATK +30% for 12s', effect: 'attackBoost', effectValue: 0.30, duration: 12000, color: '#FF8888', icon: '⚡' },
      special: { name: 'Gum-Gum Red Hawk',   type: 'special', staminaCost: 40, damage: 260, range: 'any', color: '#FF2200', icon: '🔥' },
      ultimate:{ name: 'Kong Gun',           type: 'ultimate',staminaCost: 60, damage: 480, range: 'any', condition: 'hpBelow50', color: '#FFAA00', icon: '⭐' },
    },
  },

  zoro: {
    id: 'zoro', rarity: 'SSR',
    name: 'Roronoa Zoro', title: 'The Pirate Hunter',
    color: 0x22BB22, accentColor: 0x88FF88, modelColor: '#22BB22',
    icon: '⚔️',
    hp: 800, maxHp: 800, power: 92, speed: 75, defense: 88,
    tags: ['Straw Hat Pirates', 'Worst Generation'],
    switchInEffect: 'defenseUp', switchInDesc: 'DEF +25% for 10s',
    statGrowth: { hp: 50, power: 5, speed: 3, defense: 4 },
    arts: {
      strike:  { name: 'Three-Sword Slash',  type: 'strike',  staminaCost: 15, damage: 95,  range: 'close', comboCount: 4, color: '#44CC44', icon: '⚔️' },
      skill:   { name: 'Oni Giri Stance',    type: 'skill',   staminaCost: 25, damage: 0,   description: 'Super armor for 8s', effect: 'armor', duration: 8000, color: '#66DD66', icon: '🛡️' },
      special: { name: 'Three Thousand Worlds',type:'special', staminaCost: 40, damage: 290, range: 'close', color: '#88FF88', icon: '🌪️' },
      ultimate:{ name: 'Asura: Ichibugin',   type: 'ultimate',staminaCost: 60, damage: 520, range: 'any', condition: 'always', color: '#AAFFAA', icon: '👹' },
    },
  },

  sanji: {
    id: 'sanji', rarity: 'SSR',
    name: 'Vinsmoke Sanji', title: 'The Black-Leg',
    color: 0x1A1A1A, accentColor: 0xFF6600, modelColor: '#2A2A2A',
    icon: '🦵',
    hp: 650, maxHp: 650, power: 80, speed: 100, defense: 72,
    tags: ['Straw Hat Pirates', 'Worst Generation'],
    switchInEffect: 'speedUp', switchInDesc: 'SPD +30% for 10s',
    statGrowth: { hp: 40, power: 4, speed: 5, defense: 3 },
    arts: {
      strike:  { name: 'Collier Strike',  type: 'strike',  staminaCost: 15, damage: 78,  range: 'close', comboCount: 5, color: '#555555', icon: '🦵' },
      skill:   { name: 'Speed Cook',      type: 'skill',   staminaCost: 25, damage: 0,   description: 'Card speed +80%, stamina regen +40% for 12s', effect: 'cardSpeedUp', duration: 12000, color: '#777777', icon: '🍳' },
      special: { name: 'Diable Jambe',    type: 'special', staminaCost: 40, damage: 270, range: 'close', color: '#FF5500', icon: '🔥' },
      ultimate:{ name: 'Ifrit Jambe',     type: 'ultimate',staminaCost: 60, damage: 490, range: 'any',   condition: 'always', color: '#FF7700', icon: '👑' },
    },
  },

  law: {
    id: 'law', rarity: 'SSR',
    name: 'Trafalgar D. Water Law', title: 'Surgeon of Death',
    color: 0xE0E0E0, accentColor: 0x6666FF, modelColor: '#D0D0D0',
    icon: '🗡️',
    hp: 680, maxHp: 680, power: 85, speed: 85, defense: 78,
    tags: ['Worst Generation', 'Warlords', 'Devil Fruit User'],
    switchInEffect: 'debuffClear', switchInDesc: 'Clears all debuffs',
    statGrowth: { hp: 42, power: 4, speed: 4, defense: 3 },
    arts: {
      strike:  { name: 'Scan',          type: 'strike',  staminaCost: 15, damage: 72,  range: 'mid', comboCount: 3, color: '#DDDDDD', icon: '🗡️' },
      skill:   { name: 'Room: Shambles',type: 'skill',   staminaCost: 25, damage: 0,   description: 'Teleports enemy — stun 2s', effect: 'teleportStun', stunDuration: 2000, color: '#9999FF', icon: '🔮' },
      special: { name: 'Counter Shock', type: 'special', staminaCost: 40, damage: 245, range: 'any', color: '#6666FF', icon: '⚡' },
      ultimate:{ name: 'Puncture Wille',type: 'ultimate',staminaCost: 60, damage: 530, range: 'any', condition: 'always', color: '#AAAAFF', icon: '💫' },
    },
  },

  nami: {
    id: 'nami', rarity: 'SSR',
    name: 'Nami', title: 'Navigator of the Straw Hats',
    color: 0xFF8800, accentColor: 0xFFFF00, modelColor: '#FF8800',
    icon: '🌩️',
    hp: 580, maxHp: 580, power: 68, speed: 88, defense: 60,
    tags: ['Straw Hat Pirates'],
    switchInEffect: 'healTeam', switchInDesc: 'Restores 80 HP to lowest HP ally',
    statGrowth: { hp: 35, power: 3, speed: 4, defense: 2 },
    arts: {
      strike:  { name: 'Clima-Tact Strike', type: 'strike',  staminaCost: 15, damage: 65,  range: 'mid', comboCount: 3, color: '#FFAA00', icon: '🌀' },
      skill:   { name: 'Thunder Charge',    type: 'skill',   staminaCost: 25, damage: 0,   description: 'Next Special deals 2x damage', effect: 'powerShot', multiplier: 2.0, color: '#FFCC00', icon: '⚡' },
      special: { name: 'Thunder Lance Tempo',type:'special', staminaCost: 40, damage: 230, range: 'any', color: '#FFFF00', icon: '🌩️' },
      ultimate:{ name: 'Zeus Thundercloud Rod',type:'ultimate',staminaCost:60,damage:460, range: 'any', condition: 'always', color: '#FFFFAA', icon: '⭐' },
    },
  },

  usopp: {
    id: 'usopp', rarity: 'SSR',
    name: 'Usopp', title: 'God Usopp',
    color: 0xCC8800, accentColor: 0x44CC44, modelColor: '#CC8800',
    icon: '🎯',
    hp: 600, maxHp: 600, power: 72, speed: 82, defense: 65,
    tags: ['Straw Hat Pirates'],
    switchInEffect: 'drawCard', switchInDesc: 'Draw 1 extra card on entry',
    statGrowth: { hp: 36, power: 3, speed: 4, defense: 3 },
    arts: {
      strike:  { name: 'Slingshot Rush',    type: 'strike',  staminaCost: 15, damage: 70,  range: 'long', comboCount: 3, color: '#DDAA00', icon: '🎯' },
      skill:   { name: 'Kabuto Fire',       type: 'skill',   staminaCost: 25, damage: 0,   description: 'Next strike ignores dodge', effect: 'piercingShot', duration: 8000, color: '#AACC44', icon: '🌿' },
      special: { name: 'Pop Green: Trampolia',type:'special',staminaCost: 40, damage: 240, range: 'any', color: '#44CC44', icon: '🌱' },
      ultimate:{ name: '5 Ton Hammer',      type: 'ultimate',staminaCost: 60, damage: 440, range: 'any', condition: 'always', color: '#FFCC44', icon: '🔨' },
    },
  },

  ace: {
    id: 'ace', rarity: 'SSR',
    name: 'Portgas D. Ace', title: 'Fire Fist Ace',
    color: 0xFF6600, accentColor: 0xFFAA00, modelColor: '#FF6600',
    icon: '🔥',
    hp: 720, maxHp: 720, power: 88, speed: 88, defense: 75,
    tags: ['Whitebeard Pirates', 'Devil Fruit User'],
    switchInEffect: 'attackUp', switchInDesc: 'ATK +25% for 10s',
    statGrowth: { hp: 46, power: 5, speed: 4, defense: 3 },
    arts: {
      strike:  { name: 'Fire Fist',       type: 'strike',  staminaCost: 15, damage: 90,  range: 'long', comboCount: 3, color: '#FF6600', icon: '🔥' },
      skill:   { name: 'Flame Wall',      type: 'skill',   staminaCost: 25, damage: 0,   description: 'Creates a flame barrier — reflect next hit', effect: 'armor', duration: 5000, color: '#FF8800', icon: '🛡️' },
      special: { name: 'Entei',           type: 'special', staminaCost: 40, damage: 275, range: 'any', color: '#FF4400', icon: '☄️' },
      ultimate:{ name: 'Higan: Juujika',  type: 'ultimate',staminaCost: 60, damage: 510, range: 'any', condition: 'always', color: '#FFAA00', icon: '✛' },
    },
  },
};

// ─────────────────────────────────────────────────────────
//  LEGENDARY  TIER
// ─────────────────────────────────────────────────────────
const LEGENDARY_CHARACTERS = {
  luffy_g4: {
    id: 'luffy_g4', rarity: 'Legendary',
    name: 'Monkey D. Luffy', title: 'Gear Fourth: Boundman',
    color: 0xFF6600, accentColor: 0xFFDD00, modelColor: '#FF6600',
    icon: '💪',
    hp: 950, maxHp: 950, power: 108, speed: 105, defense: 92,
    tags: ['Straw Hat Pirates', 'Worst Generation', 'Devil Fruit User', 'Yonko Crew'],
    switchInEffect: 'attackUp', switchInDesc: 'ATK +35% for 12s (uncancellable)',
    statGrowth: { hp: 65, power: 6, speed: 5, defense: 4 },
    arts: {
      strike:  { name: 'Rhino Schneider',  type: 'strike',  staminaCost: 15, damage: 115, range: 'any', comboCount: 4, color: '#FF6600', icon: '🦏' },
      skill:   { name: 'Gear Fourth Burst', type: 'skill',  staminaCost: 25, damage: 0,  description: 'ATK +45%, immune to interruption for 10s', effect: 'attackBoost', effectValue: 0.45, duration: 10000, color: '#FF8800', icon: '💥' },
      special: { name: 'Leo Bazooka',      type: 'special', staminaCost: 40, damage: 350, range: 'any', color: '#FF4400', icon: '💣' },
      ultimate:{ name: 'King Kong Gun',    type: 'ultimate',staminaCost: 60, damage: 650, range: 'any', condition: 'always', color: '#FFCC00', icon: '👑' },
    },
  },

  whitebeard: {
    id: 'whitebeard', rarity: 'Legendary',
    name: 'Edward Newgate', title: 'Whitebeard — The Strongest Man',
    color: 0xFFFFFF, accentColor: 0x8888FF, modelColor: '#DDDDDD',
    icon: '❄️',
    hp: 1100, maxHp: 1100, power: 115, speed: 65, defense: 105,
    tags: ['Whitebeard Pirates', 'Devil Fruit User', 'Yonko'],
    switchInEffect: 'defenseUp', switchInDesc: 'DEF +40% for 15s, all allies gain 80 HP',
    statGrowth: { hp: 80, power: 6, speed: 2, defense: 6 },
    arts: {
      strike:  { name: 'Seismic Impact',  type: 'strike',  staminaCost: 15, damage: 120, range: 'any', comboCount: 2, color: '#DDDDFF', icon: '🌊' },
      skill:   { name: 'Murakumogiri',    type: 'skill',   staminaCost: 25, damage: 0,   description: 'Titanium naginata boosts next special by 60%', effect: 'powerShot', multiplier: 1.6, color: '#8888FF', icon: '🔱' },
      special: { name: 'Gura Gura: Shima Yurashi', type: 'special', staminaCost: 40, damage: 360, range: 'any', color: '#AAAAFF', icon: '🌍' },
      ultimate:{ name: 'World Destroyer', type: 'ultimate', staminaCost: 60, damage: 700, range: 'any', condition: 'always', color: '#CCCCFF', icon: '🌋' },
    },
  },

  kaido: {
    id: 'kaido', rarity: 'Legendary',
    name: 'Kaido', title: 'The Strongest Creature',
    color: 0x4422AA, accentColor: 0x8866FF, modelColor: '#4422AA',
    icon: '🐉',
    hp: 1200, maxHp: 1200, power: 118, speed: 70, defense: 108,
    tags: ['Yonko', 'Yonko Crew', 'Devil Fruit User'],
    switchInEffect: 'defenseUp', switchInDesc: 'Kaido cannot be KO\'d for 5s upon entry',
    statGrowth: { hp: 90, power: 6, speed: 3, defense: 7 },
    arts: {
      strike:  { name: 'Ragnaraku',      type: 'strike',  staminaCost: 15, damage: 130, range: 'any', comboCount: 2, color: '#6644CC', icon: '⚡' },
      skill:   { name: 'Thunder Bagua',  type: 'skill',   staminaCost: 25, damage: 180, description: 'Instils terror — stuns + massive damage', effect: 'teleportStun', stunDuration: 1500, color: '#8866FF', icon: '⚡' },
      special: { name: 'Tatsumaki Kaifu',type: 'special', staminaCost: 40, damage: 380, range: 'any', color: '#4422AA', icon: '🌪️' },
      ultimate:{ name: 'Blast Breath Dragon', type:'ultimate',staminaCost:60, damage: 750, range: 'any', condition: 'always', color: '#AA44FF', icon: '🔥' },
    },
  },

  shanks: {
    id: 'shanks', rarity: 'Legendary',
    name: 'Shanks', title: 'Red-Haired Yonko',
    color: 0xCC1111, accentColor: 0xFF4444, modelColor: '#CC1111',
    icon: '⚔️',
    hp: 1000, maxHp: 1000, power: 120, speed: 95, defense: 98,
    tags: ['Yonko', 'Roger Pirates'],
    switchInEffect: 'attackUp', switchInDesc: 'All stats +20% for 10s — Conqueror\'s Haki bursts on entry',
    statGrowth: { hp: 70, power: 7, speed: 5, defense: 5 },
    arts: {
      strike:  { name: 'Sea Kings Slash', type: 'strike',  staminaCost: 15, damage: 125, range: 'any', comboCount: 3, color: '#CC1111', icon: '⚔️' },
      skill:   { name: 'Haoshoku Haki',   type: 'skill',   staminaCost: 25, damage: 0,   description: 'Conqueror\'s Haki — stuns enemy 3s, ATK +35%', effect: 'attackBoost', effectValue: 0.35, duration: 15000, color: '#FF4444', icon: '👑' },
      special: { name: 'Divine Departure', type: 'special',staminaCost: 40, damage: 370, range: 'any', color: '#FF2222', icon: '✨' },
      ultimate:{ name: 'Red Force Strike',  type: 'ultimate',staminaCost:60, damage: 720, range: 'any', condition: 'always', color: '#FF6666', icon: '🌊' },
    },
  },
};

// ─────────────────────────────────────────────────────────
//  EX LEGENDARY  TIER
// ─────────────────────────────────────────────────────────
const EX_CHARACTERS = {
  luffy_g5: {
    id: 'luffy_g5', rarity: 'EX',
    name: 'Monkey D. Luffy', title: 'Sun God Nika — Gear Fifth',
    color: 0xFFFFFF, accentColor: 0xFFFF00, modelColor: '#FFFFFF',
    icon: '☀️',
    hp: 1300, maxHp: 1300, power: 130, speed: 120, defense: 100,
    tags: ['Straw Hat Pirates', 'Worst Generation', 'Devil Fruit User', 'Yonko Crew'],
    switchInEffect: 'attackUp', switchInDesc: 'ATK +50% for 15s, restores 200 HP',
    statGrowth: { hp: 100, power: 8, speed: 7, defense: 5 },
    arts: {
      strike:  { name: 'Gum-Gum Giant',     type: 'strike',  staminaCost: 15, damage: 145, range: 'any', comboCount: 5, color: '#FFFFFF', icon: '☀️' },
      skill:   { name: 'Warrior of Liberation', type: 'skill', staminaCost: 25, damage: 0, description: 'Immune to all debuffs, ATK +60%, SPD +60% for 12s', effect: 'attackBoost', effectValue: 0.60, duration: 12000, color: '#FFFF88', icon: '🌟' },
      special: { name: 'Gum-Gum Bajrang Gun', type: 'special',staminaCost: 40, damage: 480, range: 'any', color: '#FFFFAA', icon: '💥' },
      ultimate:{ name: 'Nika: World Liberator', type:'ultimate',staminaCost:60, damage: 900, range: 'any', condition: 'always', color: '#FFFF00', icon: '☀️' },
    },
  },

  roger: {
    id: 'roger', rarity: 'EX',
    name: 'Gol D. Roger', title: 'King of the Pirates',
    color: 0xDDAA00, accentColor: 0xFFDD44, modelColor: '#DDAA00',
    icon: '☠️',
    hp: 1250, maxHp: 1250, power: 135, speed: 115, defense: 105,
    tags: ['Roger Pirates', 'Yonko'],
    switchInEffect: 'attackUp', switchInDesc: 'Unleashes Conqueror\'s Haki — ALL enemies take 200 damage',
    statGrowth: { hp: 95, power: 8, speed: 6, defense: 6 },
    arts: {
      strike:  { name: 'Conqueror\'s Slash',   type: 'strike',  staminaCost: 15, damage: 150, range: 'any', comboCount: 4, color: '#DDAA00', icon: '☠️' },
      skill:   { name: 'Will of D.',            type: 'skill',   staminaCost: 25, damage: 0,   description: 'Cannot be KO\'d for 8s, all stats +40%', effect: 'attackBoost', effectValue: 0.40, duration: 8000, color: '#FFDD44', icon: '🏴‍☠️' },
      special: { name: 'Unnamed Swordsmanship', type: 'special', staminaCost: 40, damage: 500, range: 'any', color: '#FFAA00', icon: '🗡️' },
      ultimate:{ name: 'One Piece Revelation', type: 'ultimate', staminaCost: 60, damage: 950, range: 'any', condition: 'always', color: '#FFD700', icon: '⭐' },
    },
  },

  shanks_ex: {
    id: 'shanks_ex', rarity: 'EX',
    name: 'Shanks', title: 'Prime — The Man Who Saved Luffy',
    color: 0xFF0000, accentColor: 0xFF8800, modelColor: '#DD0000',
    icon: '🌊',
    hp: 1150, maxHp: 1150, power: 132, speed: 118, defense: 102,
    tags: ['Yonko', 'Roger Pirates'],
    switchInEffect: 'attackUp', switchInDesc: 'Prime Shanks: ALL buffs doubled, DEF +30%',
    statGrowth: { hp: 88, power: 8, speed: 7, defense: 6 },
    arts: {
      strike:  { name: 'Haoshoku Slash',      type: 'strike',  staminaCost: 15, damage: 148, range: 'any', comboCount: 3, color: '#FF0000', icon: '⚔️' },
      skill:   { name: 'Emperor\'s Presence', type: 'skill',   staminaCost: 25, damage: 0,   description: 'Massive ATK aura — team ATK +50% for 10s', effect: 'attackBoost', effectValue: 0.50, duration: 10000, color: '#FF4444', icon: '👑' },
      special: { name: 'Kamusari',            type: 'special', staminaCost: 40, damage: 490, range: 'any', color: '#FF2200', icon: '🌊' },
      ultimate:{ name: 'Conqueror\'s Domain', type: 'ultimate',staminaCost: 60, damage: 920, range: 'any', condition: 'always', color: '#FF6600', icon: '🌑' },
    },
  },
};

// ─────────────────────────────────────────────────────────
//  COMBINED EXPORT
// ─────────────────────────────────────────────────────────
const ALL_CHARACTERS = {
  ...R_CHARACTERS,
  ...SR_CHARACTERS,
  ...SSR_CHARACTERS,
  ...LEGENDARY_CHARACTERS,
  ...EX_CHARACTERS,
};

// Keep CHARACTERS as alias for existing code (SSR+)
const CHARACTERS = { ...SSR_CHARACTERS };

// Ordered lists by rarity for gacha pool building
const RARITY_POOLS = {
  R:         Object.keys(R_CHARACTERS),
  SR:        Object.keys(SR_CHARACTERS),
  SSR:       Object.keys(SSR_CHARACTERS),
  Legendary: Object.keys(LEGENDARY_CHARACTERS),
  EX:        Object.keys(EX_CHARACTERS),
};

const CHARACTER_ORDER = Object.keys(ALL_CHARACTERS);

// Team synergies remain same as original
const SYNERGIES = {
  'Straw Hat Pirates': {
    name: 'Nakama Power',
    requiredCount: 2,
    description: 'ATK +10%, DEF +5%',
    attackBonus: 0.10,
    defenseBonus: 0.05,
  },
  'Worst Generation': {
    name: 'Rookie Rivalry',
    requiredCount: 2,
    description: 'Special Arts dmg +15%',
    specialDamageBonus: 0.15,
  },
  'Devil Fruit User': {
    name: 'Devil Power',
    requiredCount: 2,
    description: 'Stamina regen +20%',
    staminaRegenBonus: 0.20,
  },
  'Yonko': {
    name: 'Emperor\'s Aura',
    requiredCount: 2,
    description: 'All stats +12%',
    attackBonus: 0.12,
    defenseBonus: 0.12,
  },
  'Marines': {
    name: 'Naval Justice',
    requiredCount: 2,
    description: 'DEF +15%, heal 50 HP on switch',
    defenseBonus: 0.15,
  },
};

function getTeamSynergies(characterIds) {
  const tagCounts = {};
  characterIds.forEach(id => {
    const char = ALL_CHARACTERS[id];
    if (char) char.tags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
  });
  return Object.entries(SYNERGIES)
    .filter(([tag, s]) => (tagCounts[tag] || 0) >= s.requiredCount)
    .map(([tag, s]) => ({ tag, ...s }));
}

function getCharacterScaledStats(charId, saveData) {
  const charDef = ALL_CHARACTERS[charId];
  const charSave = saveData?.ownedCharacters?.[charId];
  if (!charDef) return null;
  const stars = charSave?.stars || 1;
  const level = charSave?.level || 1;
  const growth = charDef.statGrowth || { hp: 30, power: 3, speed: 3, defense: 2 };
  const levelMult = 1 + (level - 1) * 0.005;
  return {
    ...charDef,
    hp:      Math.floor((charDef.hp + growth.hp * (stars - 1)) * levelMult),
    maxHp:   Math.floor((charDef.hp + growth.hp * (stars - 1)) * levelMult),
    power:   Math.floor((charDef.power + growth.power * (stars - 1)) * levelMult),
    speed:   Math.floor((charDef.speed + growth.speed * (stars - 1)) * levelMult),
    defense: Math.floor((charDef.defense + growth.defense * (stars - 1)) * levelMult),
  };
}
