// One Piece Legends - PvP System

const PVP_RANKS = [
  { id: 'rookie',         name: 'Rookie',          icon: '⚓', minRating: 0,    maxRating: 999,  color: '#888888' },
  { id: 'pirate',         name: 'Pirate',          icon: '🏴‍☠️', minRating: 1000, maxRating: 1499, color: '#AAAAAA' },
  { id: 'super_rookie',   name: 'Super Rookie',    icon: '⚡', minRating: 1500, maxRating: 1999, color: '#4488FF' },
  { id: 'captain',        name: 'Captain',         icon: '🗡️', minRating: 2000, maxRating: 2499, color: '#44CC44' },
  { id: 'warlord',        name: 'Warlord',         icon: '🌊', minRating: 2500, maxRating: 2999, color: '#FFAA00' },
  { id: 'yonko_commander',name: 'Yonko Commander', icon: '🔥', minRating: 3000, maxRating: 3499, color: '#FF6600' },
  { id: 'yonko',          name: 'Yonko',           icon: '👑', minRating: 3500, maxRating: 3999, color: '#FF3333' },
  { id: 'pirate_king',    name: 'Pirate King',     icon: '☠️', minRating: 4000, maxRating: 99999, color: '#FFD700' },
];

// Simulated opponent teams at various rating brackets
const OPPONENT_POOL = [
  { name: 'Zoro\'s Crew',         team: ['zoro', 'sanji', 'nami'],      rating: 850,  tier: 'rookie' },
  { name: 'Marine Hunters',        team: ['coby', 'helmeppo', 'alvida'], rating: 820,  tier: 'rookie' },
  { name: 'Straw Hat Rivals',      team: ['luffy', 'zoro', 'sanji'],     rating: 1100, tier: 'pirate' },
  { name: 'East Blue Raiders',     team: ['nami', 'usopp', 'chopper'],   rating: 1250, tier: 'pirate' },
  { name: 'Baroque Agents',        team: ['crocodile', 'robin', 'buggy'],rating: 1650, tier: 'super_rookie' },
  { name: 'Law\'s Heart Pirates',  team: ['law', 'chopper', 'zoro'],     rating: 1800, tier: 'super_rookie' },
  { name: 'Alliance Strike Force', team: ['luffy', 'law', 'zoro'],       rating: 2100, tier: 'captain' },
  { name: 'Warlord Assembly',      team: ['crocodile', 'jinbe', 'law'],  rating: 2400, tier: 'captain' },
  { name: 'Whitebeard\'s Legacy',  team: ['whitebeard', 'ace', 'jinbe'], rating: 2700, tier: 'warlord' },
  { name: 'Yonko\'s Vanguard',     team: ['shanks', 'kaido', 'luffy_g4'],rating: 3200, tier: 'yonko_commander' },
  { name: 'Emperor\'s Court',      team: ['kaido', 'shanks', 'luffy_g4'],rating: 3600, tier: 'yonko' },
  { name: 'King of Pirates',       team: ['roger', 'shanks_ex', 'luffy_g5'],rating: 4200, tier: 'pirate_king' },
];

const SEASON_REWARDS = {
  rookie:          { gems: 200,  icon: '⚓', tickets: 1 },
  pirate:          { gems: 400,  icon: '🏴‍☠️', tickets: 2 },
  super_rookie:    { gems: 600,  icon: '⚡', tickets: 3 },
  captain:         { gems: 800,  icon: '🗡️', tickets: 4 },
  warlord:         { gems: 1200, icon: '🌊', tickets: 5 },
  yonko_commander: { gems: 1600, icon: '🔥', tickets: 7 },
  yonko:           { gems: 2000, icon: '👑', tickets: 10 },
  pirate_king:     { gems: 3000, icon: '☠️', tickets: 15 },
};

class PVPSystem {
  constructor(saveData) {
    this.save = saveData;
  }

  getRankData(rating) {
    const r = rating ?? this.save.pvp.rating;
    return PVP_RANKS.find(rank => r >= rank.minRating && r <= rank.maxRating)
      || PVP_RANKS[0];
  }

  getProgressInRank() {
    const rating = this.save.pvp.rating;
    const rank = this.getRankData(rating);
    const range = rank.maxRating - rank.minRating;
    const progress = rating - rank.minRating;
    return Math.min(100, Math.floor((progress / range) * 100));
  }

  getOpponent(playerRating) {
    const inRange = OPPONENT_POOL.filter(op =>
      Math.abs(op.rating - playerRating) < 600
    );
    const pool = inRange.length > 0 ? inRange : OPPONENT_POOL;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  simulateBattle(playerTeamIds, opponentData, playerSaveData) {
    // Calculate player team power
    let playerPower = playerTeamIds.reduce((sum, id) => {
      const c = ALL_CHARACTERS[id];
      const save = playerSaveData?.ownedCharacters?.[id];
      if (!c) return sum;
      const stars = save?.stars || 1;
      const level = save?.level || 1;
      return sum + c.power + c.defense + c.speed + (c.hp / 10) + (stars - 1) * 20 + (level - 1) * 2;
    }, 0);

    // Calculate opponent power
    let opponentPower = opponentData.team.reduce((sum, id) => {
      const c = ALL_CHARACTERS[id];
      if (!c) return sum;
      return sum + c.power + c.defense + c.speed + (c.hp / 10);
    }, 0) * (opponentData.rating / 1000);

    // Add randomness (25%)
    playerPower *= 0.85 + Math.random() * 0.30;
    opponentPower *= 0.85 + Math.random() * 0.30;

    const playerWon = playerPower > opponentPower;
    return { playerWon, playerPower: Math.floor(playerPower), opponentPower: Math.floor(opponentPower) };
  }

  recordResult(playerWon, opponent) {
    const pvp = this.save.pvp;
    const prevRating = pvp.rating;

    if (playerWon) {
      pvp.wins++;
      pvp.streak++;
      const gain = Math.floor(20 + Math.max(0, opponent.rating - pvp.rating) * 0.05 + pvp.streak * 2);
      pvp.rating = Math.min(99999, pvp.rating + gain);
    } else {
      pvp.losses++;
      pvp.streak = 0;
      const loss = Math.floor(15 + Math.max(0, pvp.rating - opponent.rating) * 0.05);
      pvp.rating = Math.max(0, pvp.rating - loss);
    }

    const prevRank = this.getRankData(prevRating);
    const newRank = this.getRankData(pvp.rating);
    pvp.rank = newRank.name;
    const rankChanged = prevRank.id !== newRank.id;

    SaveState.save(this.save);
    return {
      playerWon,
      newRating: pvp.rating,
      prevRating,
      rankChanged,
      newRank: newRank,
      prevRank: prevRank,
      ratingChange: pvp.rating - prevRating,
      streak: pvp.streak,
    };
  }

  getSeasonRewards() {
    const rank = this.getRankData();
    return SEASON_REWARDS[rank.id] || SEASON_REWARDS.rookie;
  }

  claimSeasonRewards() {
    if (this.save.pvp.seasonRewardsClaimed) return null;
    const rewards = this.getSeasonRewards();
    if (rewards.gems) this.save.gems += rewards.gems;
    if (rewards.tickets) this.save.inventory.recruitTickets += rewards.tickets;
    this.save.pvp.seasonRewardsClaimed = true;
    SaveState.save(this.save);
    return rewards;
  }

  getLeaderboard() {
    const fakeLeaders = [
      { name: 'Gol D. Roger', rating: 4850, rank: 'Pirate King', wins: 1542 },
      { name: 'Whitebeard', rating: 4200, rank: 'Pirate King', wins: 1380 },
      { name: 'Red Hair Shanks', rating: 3900, rank: 'Yonko', wins: 1240 },
      { name: 'Monkey D. Dragon', rating: 3650, rank: 'Yonko', wins: 1105 },
      { name: 'Big Mom', rating: 3500, rank: 'Yonko', wins: 980 },
      { name: 'Kaido', rating: 3400, rank: 'Yonko', wins: 920 },
      { name: 'Monkey D. Luffy', rating: this.save.pvp.rating, rank: this.save.pvp.rank, wins: this.save.pvp.wins, isPlayer: true },
    ];
    return fakeLeaders.sort((a, b) => b.rating - a.rating).map((p, i) => ({ ...p, rank_pos: i + 1 }));
  }
}
