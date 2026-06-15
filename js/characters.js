// One Piece Legends - Character Definitions

const CHARACTERS = {
  luffy: {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    title: 'Captain of the Straw Hats',
    color: 0xFF3333,
    accentColor: 0xFFAA00,
    modelColor: '#FF3333',
    hp: 700,
    maxHp: 700,
    power: 85,
    speed: 90,
    defense: 70,
    tags: ['Straw Hat Pirates', 'Worst Generation', 'Devil Fruit User'],
    switchInEffect: 'attackUp',
    switchInDesc: 'Attack +20% for 10s',
    arts: {
      strike: {
        name: 'Gum-Gum Pistol',
        type: 'strike',
        staminaCost: 15,
        damage: 85,
        range: 'mid',
        comboCount: 3,
        description: 'Stretches arm to deliver a rapid punch combo',
        color: '#FF4444',
        icon: '👊'
      },
      skill: {
        name: 'Gear Second',
        type: 'skill',
        staminaCost: 25,
        damage: 0,
        description: 'Activates Gear Second, boosting damage by 30% for 12s',
        effect: 'attackBoost',
        effectValue: 0.30,
        duration: 12000,
        color: '#FF8888',
        icon: '⚡'
      },
      special: {
        name: 'Gum-Gum Red Hawk',
        type: 'special',
        staminaCost: 40,
        damage: 260,
        range: 'any',
        description: 'Fire-imbued punch that erupts on impact',
        color: '#FF2200',
        icon: '🔥'
      },
      ultimate: {
        name: 'Kong Gun',
        type: 'ultimate',
        staminaCost: 60,
        damage: 480,
        range: 'any',
        description: "Gear Fourth: Boundman's colossal compressed fist",
        condition: 'hpBelow50',
        color: '#FFAA00',
        icon: '⭐'
      }
    }
  },

  zoro: {
    id: 'zoro',
    name: 'Roronoa Zoro',
    title: 'The Pirate Hunter',
    color: 0x22BB22,
    accentColor: 0x88FF88,
    modelColor: '#22BB22',
    hp: 800,
    maxHp: 800,
    power: 92,
    speed: 75,
    defense: 88,
    tags: ['Straw Hat Pirates', 'Worst Generation'],
    switchInEffect: 'defenseUp',
    switchInDesc: 'Defense +25% for 10s',
    arts: {
      strike: {
        name: 'Three-Sword Slash',
        type: 'strike',
        staminaCost: 15,
        damage: 95,
        range: 'close',
        comboCount: 4,
        description: 'Fierce triple-slash combo with all three swords',
        color: '#44CC44',
        icon: '⚔️'
      },
      skill: {
        name: 'Oni Giri Stance',
        type: 'skill',
        staminaCost: 25,
        damage: 0,
        description: 'Enters armored stance, gaining super armor for 8s',
        effect: 'armor',
        duration: 8000,
        color: '#66DD66',
        icon: '🛡️'
      },
      special: {
        name: 'Three Thousand Worlds',
        type: 'special',
        staminaCost: 40,
        damage: 290,
        range: 'close',
        description: 'A devastating three-sword aerial combo',
        color: '#88FF88',
        icon: '🌪️'
      },
      ultimate: {
        name: 'Asura: Ichibugin',
        type: 'ultimate',
        staminaCost: 60,
        damage: 520,
        range: 'any',
        description: 'Nine-sword demon god manifests for an onslaught',
        condition: 'always',
        color: '#AAFFAA',
        icon: '👹'
      }
    }
  },

  sanji: {
    id: 'sanji',
    name: 'Vinsmoke Sanji',
    title: 'The Black-Leg',
    color: 0x1A1A1A,
    accentColor: 0xFF6600,
    modelColor: '#2A2A2A',
    hp: 650,
    maxHp: 650,
    power: 80,
    speed: 100,
    defense: 72,
    tags: ['Straw Hat Pirates', 'Worst Generation'],
    switchInEffect: 'speedUp',
    switchInDesc: 'Speed +30% for 10s',
    arts: {
      strike: {
        name: 'Collier Strike',
        type: 'strike',
        staminaCost: 15,
        damage: 78,
        range: 'close',
        comboCount: 5,
        description: 'Lightning-fast neck kick combo',
        color: '#555555',
        icon: '🦵'
      },
      skill: {
        name: 'Speed Cook',
        type: 'skill',
        staminaCost: 25,
        damage: 0,
        description: 'Boosts card draw speed and stamina regen for 12s',
        effect: 'cardSpeedUp',
        duration: 12000,
        color: '#777777',
        icon: '🍳'
      },
      special: {
        name: 'Diable Jambe',
        type: 'special',
        staminaCost: 40,
        damage: 270,
        range: 'close',
        description: 'Ignited spinning kick that burns on impact',
        color: '#FF5500',
        icon: '🔥'
      },
      ultimate: {
        name: 'Ifrit Jambe',
        type: 'ultimate',
        staminaCost: 60,
        damage: 490,
        range: 'any',
        description: 'Ultimate infernal kick combining Raid Suit and Diable Jambe',
        condition: 'always',
        color: '#FF7700',
        icon: '👑'
      }
    }
  },

  law: {
    id: 'law',
    name: 'Trafalgar D. Water Law',
    title: 'Surgeon of Death',
    color: 0xE0E0E0,
    accentColor: 0x6666FF,
    modelColor: '#D0D0D0',
    hp: 680,
    maxHp: 680,
    power: 85,
    speed: 85,
    defense: 78,
    tags: ['Worst Generation', 'Warlords', 'Devil Fruit User'],
    switchInEffect: 'debuffClear',
    switchInDesc: 'Clears all debuffs on entry',
    arts: {
      strike: {
        name: 'Scan',
        type: 'strike',
        staminaCost: 15,
        damage: 72,
        range: 'mid',
        comboCount: 3,
        description: 'Swift Nodachi slash combo',
        color: '#DDDDDD',
        icon: '🗡️'
      },
      skill: {
        name: 'Room: Shambles',
        type: 'skill',
        staminaCost: 25,
        damage: 0,
        description: 'Teleports the enemy, causing a 2s stun',
        effect: 'teleportStun',
        stunDuration: 2000,
        color: '#9999FF',
        icon: '🔮'
      },
      special: {
        name: 'Counter Shock',
        type: 'special',
        staminaCost: 40,
        damage: 245,
        range: 'any',
        description: 'Electric shockwave discharged through the opponent',
        color: '#6666FF',
        icon: '⚡'
      },
      ultimate: {
        name: 'Puncture Wille',
        type: 'ultimate',
        staminaCost: 60,
        damage: 530,
        range: 'any',
        description: 'K-ROOM enhanced lance pierces through all defenses',
        condition: 'always',
        color: '#AAAAFF',
        icon: '💫'
      }
    }
  },

  nami: {
    id: 'nami',
    name: 'Nami',
    title: 'Navigator of the Straw Hats',
    color: 0xFF8800,
    accentColor: 0xFFFF00,
    modelColor: '#FF8800',
    hp: 580,
    maxHp: 580,
    power: 68,
    speed: 88,
    defense: 60,
    tags: ['Straw Hat Pirates'],
    switchInEffect: 'healTeam',
    switchInDesc: 'Restores 80 HP to lowest-HP ally',
    arts: {
      strike: {
        name: 'Clima-Tact Strike',
        type: 'strike',
        staminaCost: 15,
        damage: 65,
        range: 'mid',
        comboCount: 3,
        description: 'Quick Clima-Tact staff combo',
        color: '#FFAA00',
        icon: '🌀'
      },
      skill: {
        name: 'Thunder Charge',
        type: 'skill',
        staminaCost: 25,
        damage: 0,
        description: 'Next Special Arts deals double damage',
        effect: 'powerShot',
        multiplier: 2.0,
        color: '#FFCC00',
        icon: '⚡'
      },
      special: {
        name: 'Thunder Lance Tempo',
        type: 'special',
        staminaCost: 40,
        damage: 230,
        range: 'any',
        description: 'Massive lightning bolt that electrifies on contact',
        color: '#FFFF00',
        icon: '🌩️'
      },
      ultimate: {
        name: 'Zeus Thundercloud Rod',
        type: 'ultimate',
        staminaCost: 60,
        damage: 460,
        range: 'any',
        description: 'Zeus summons a catastrophic lightning storm',
        condition: 'always',
        color: '#FFFFAA',
        icon: '⭐'
      }
    }
  },

  usopp: {
    id: 'usopp',
    name: 'Usopp',
    title: 'God Usopp',
    color: 0xCC8800,
    accentColor: 0x44CC44,
    modelColor: '#CC8800',
    hp: 600,
    maxHp: 600,
    power: 72,
    speed: 82,
    defense: 65,
    tags: ['Straw Hat Pirates'],
    switchInEffect: 'drawCard',
    switchInDesc: 'Draws an extra Arts Card on entry',
    arts: {
      strike: {
        name: 'Slingshot Rush',
        type: 'strike',
        staminaCost: 15,
        damage: 70,
        range: 'long',
        comboCount: 3,
        description: 'Rapid slingshot pellet burst at range',
        color: '#DDAA00',
        icon: '🎯'
      },
      skill: {
        name: 'Kabuto Fire',
        type: 'skill',
        staminaCost: 25,
        damage: 0,
        description: 'Loads a special shot—next strike ignores dodge',
        effect: 'piercingShot',
        duration: 8000,
        color: '#AACC44',
        icon: '🌿'
      },
      special: {
        name: 'Pop Green: Trampolia',
        type: 'special',
        staminaCost: 40,
        damage: 240,
        range: 'any',
        description: 'Explosive plant growth traps and damages the enemy',
        color: '#44CC44',
        icon: '🌱'
      },
      ultimate: {
        name: "5 Ton Hammer",
        type: 'ultimate',
        staminaCost: 60,
        damage: 440,
        range: 'any',
        description: "God Usopp's hammer crushes from the heavens",
        condition: 'always',
        color: '#FFCC44',
        icon: '🔨'
      }
    }
  }
};

const SYNERGIES = {
  'Straw Hat Pirates': {
    name: 'Nakama Power',
    requiredCount: 2,
    description: 'Attack +10%, Defense +5%',
    attackBonus: 0.10,
    defenseBonus: 0.05
  },
  'Worst Generation': {
    name: 'Rookie Rivalry',
    requiredCount: 2,
    description: 'Special Arts damage +15%',
    specialDamageBonus: 0.15
  },
  'Devil Fruit User': {
    name: 'Devil Power',
    requiredCount: 2,
    description: 'Stamina regen +20%',
    staminaRegenBonus: 0.20
  }
};

function getTeamSynergies(characterIds) {
  const tagCounts = {};
  characterIds.forEach(id => {
    const char = CHARACTERS[id];
    if (char) {
      char.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const activeSynergies = [];
  Object.entries(SYNERGIES).forEach(([tag, synergy]) => {
    if (tagCounts[tag] >= synergy.requiredCount) {
      activeSynergies.push({ tag, ...synergy });
    }
  });
  return activeSynergies;
}

const CHARACTER_ORDER = ['luffy', 'zoro', 'sanji', 'law', 'nami', 'usopp'];
