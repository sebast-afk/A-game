// One Piece Legends - Events System

const EVENTS = [
  {
    id: 'kaido_raid',
    name: 'Kaido Raid Battle',
    subtitle: 'Take Down the Strongest Creature!',
    type: 'raid',
    icon: '🐉',
    color: '#4422AA',
    gradient: 'linear-gradient(135deg, #220055, #110033)',
    daysRemaining: 6,
    description: 'Team up to take on the mighty Kaido in an epic raid battle. The more damage you deal, the better your rewards!',
    boss: { id: 'kaido', name: 'Kaido', hp: 50000, difficulty: 'EXTREME' },
    stages: [
      { level: 1, name: 'Dragon Scale — Level 1', staminaCost: 10, rewards: { gems: 20, stones: 5 } },
      { level: 2, name: 'Dragon Scale — Level 2', staminaCost: 15, rewards: { gems: 30, stones: 10 } },
      { level: 3, name: 'Dragon Scale — Level 3', staminaCost: 20, rewards: { gems: 50, stones: 20 } },
      { level: 4, name: 'Thunder Bagua — EXTREME', staminaCost: 30, rewards: { gems: 100, stones: 40, tickets: 2 } },
    ],
    totalRewards: { gems: 500, tickets: 5, exclusiveMedal: 'Wano Medal' },
    badge: 'RAID',
    badgeColor: '#AA44FF',
  },
  {
    id: 'marineford_survival',
    name: 'Marineford Survival',
    subtitle: 'Survive the Paramount War',
    type: 'survival',
    icon: '⚓',
    color: '#AA3300',
    gradient: 'linear-gradient(135deg, #441100, #220000)',
    daysRemaining: 4,
    description: 'How long can you survive against waves of Marine forces? Each wave gets harder. Compete for high score!',
    waves: 20,
    rewards: [
      { waves: 5,  rewards: { gems: 50 } },
      { waves: 10, rewards: { gems: 100, stones: 20 } },
      { waves: 15, rewards: { gems: 200, tickets: 2 } },
      { waves: 20, rewards: { gems: 500, tickets: 5 } },
    ],
    badge: 'SURVIVAL',
    badgeColor: '#FF6600',
  },
  {
    id: 'impel_escape',
    name: 'Impel Down Escape',
    subtitle: 'Break Out of Impel Down!',
    type: 'challenge',
    icon: '🔐',
    color: '#446600',
    gradient: 'linear-gradient(135deg, #223300, #111100)',
    daysRemaining: 9,
    description: 'Rush through 6 floors of Impel Down! Each floor has a powerful warden. Complete all floors for the grand prize.',
    floors: [
      { floor: 6, name: 'Level 6 — Eternal Hell',     boss: 'Magellan',       rewards: { gems: 30 } },
      { floor: 5, name: 'Level 5 — Freezing Hell',    boss: 'Sadi-chan',       rewards: { gems: 40 } },
      { floor: 4, name: 'Level 4 — Blazing Hell',     boss: 'Domino',          rewards: { gems: 50 } },
      { floor: 3, name: 'Level 3 — Starvation Hell',  boss: 'Chief Warden',    rewards: { gems: 60 } },
      { floor: 2, name: 'Level 2 — Beast Hell',       boss: 'Hannyabal',       rewards: { gems: 80 } },
      { floor: 1, name: 'Level 1 — Crime&Punishment', boss: 'Magellan (Final)',rewards: { gems: 150, tickets: 3 } },
    ],
    badge: 'CHALLENGE',
    badgeColor: '#44AA44',
  },
  {
    id: 'yonko_showdown',
    name: 'Yonko Showdown',
    subtitle: 'Face All Four Emperors!',
    type: 'boss_rush',
    icon: '👑',
    color: '#AA8800',
    gradient: 'linear-gradient(135deg, #443300, #221100)',
    daysRemaining: 12,
    description: 'Challenge all four Yonko in succession! Completing the full gauntlet earns special rewards.',
    bosses: [
      { name: 'Shanks',     icon: '⚔️', color: '#CC1111', reward: { gems: 100 } },
      { name: 'Kaido',      icon: '🐉', color: '#4422AA', reward: { gems: 150 } },
      { name: 'Big Mom',    icon: '🍰', color: '#FF4488', reward: { gems: 150 } },
      { name: 'Blackbeard', icon: '💀', color: '#333333', reward: { gems: 200 } },
    ],
    grandPrize: { gems: 1000, tickets: 8, exclusiveMedal: 'Yonko Medal' },
    badge: 'BOSS RUSH',
    badgeColor: '#FFD700',
  },
  {
    id: 'anniversary',
    name: '1st Anniversary Celebration',
    subtitle: 'One Year on the Grand Line!',
    type: 'celebration',
    icon: '🎆',
    color: '#880044',
    gradient: 'linear-gradient(135deg, #440022, #110011)',
    daysRemaining: 7,
    description: 'Celebrating one year of One Piece Legends! Log in every day for special anniversary gifts!',
    dailyRewards: [
      { gems: 300, icon: '💎' }, { gems: 300, icon: '💎' }, { tickets: 5, icon: '🎫' },
      { gems: 500, icon: '💎' }, { gems: 500, icon: '💎' }, { gems: 500, icon: '💎' },
      { gems: 1000, tickets: 10, icon: '⭐' },
    ],
    badge: 'ANNIVERSARY',
    badgeColor: '#FF44AA',
  },
];

class EventsSystem {
  constructor(saveData) {
    this.save = saveData;
    if (!this.save.eventProgress) this.save.eventProgress = {};
  }

  getActiveEvents() {
    return EVENTS.filter(e => e.daysRemaining > 0);
  }

  getEventProgress(eventId) {
    return this.save.eventProgress[eventId] || {};
  }

  startEventStage(eventId, stageIndex) {
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return null;
    return { event, stage: event.stages?.[stageIndex] || event.floors?.[stageIndex] };
  }

  completeEventStage(eventId, stageId, won) {
    if (!won) return null;
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return null;

    if (!this.save.eventProgress[eventId]) {
      this.save.eventProgress[eventId] = { completed: [], claimed: [] };
    }
    const prog = this.save.eventProgress[eventId];
    if (!prog.completed.includes(stageId)) {
      prog.completed.push(stageId);
    }
    SaveState.save(this.save);
    return { eventId, stageId };
  }

  claimEventReward(eventId, stageId, reward) {
    if (!this.save.eventProgress[eventId]) return false;
    const prog = this.save.eventProgress[eventId];
    if (prog.claimed?.includes(stageId)) return false;
    if (!prog.claimed) prog.claimed = [];
    prog.claimed.push(stageId);
    if (reward.gems) this.save.gems += reward.gems;
    if (reward.tickets) this.save.inventory.recruitTickets += reward.tickets;
    if (reward.stones) this.save.inventory.upgradeStones += reward.stones;
    SaveState.save(this.save);
    return true;
  }

  getTimeRemaining(event) {
    const days = event.daysRemaining;
    if (days > 1) return `${days} days remaining`;
    if (days === 1) return 'Last day!';
    return 'Ended';
  }
}
