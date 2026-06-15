// One Piece Legends - Missions & Login Bonus

const DAILY_MISSIONS = [
  { id: 'dm_battle1',  name: 'First Battle',       desc: 'Win 1 battle',              goal: 1,  progress: 'battles_won',  reward: { gems: 50, icon: '💎' } },
  { id: 'dm_battle3',  name: 'Rising Pirate',       desc: 'Win 3 battles',             goal: 3,  progress: 'battles_won',  reward: { gems: 100, icon: '💎' } },
  { id: 'dm_summon1',  name: 'Recruitment',         desc: 'Perform 1 summon',          goal: 1,  progress: 'summons',      reward: { gems: 30, icon: '💎' } },
  { id: 'dm_combo5',   name: 'Combo Master',        desc: 'Hit a 5+ hit combo',        goal: 1,  progress: 'combo5',       reward: { stones: 3, icon: '🔮' } },
  { id: 'dm_grandrush',name: 'Grand Rush!',         desc: 'Activate Grand Rush',       goal: 1,  progress: 'grand_rush',   reward: { gems: 80, icon: '💎' } },
  { id: 'dm_special',  name: 'Special Move',        desc: 'Use a Special Arts 3 times',goal: 3,  progress: 'specials_used',reward: { stones: 5, icon: '🔮' } },
  { id: 'dm_switch',   name: 'Crew Switch',         desc: 'Switch characters 5 times', goal: 5,  progress: 'switches',     reward: { gems: 40, icon: '💎' } },
  { id: 'dm_vanish',   name: 'Vanish Master',       desc: 'Use Vanish dodge 3 times',  goal: 3,  progress: 'vanishes',     reward: { gems: 30, icon: '💎' } },
];

const WEEKLY_MISSIONS = [
  { id: 'wm_win10',     name: 'Pirate Warrior',     desc: 'Win 10 battles',            goal: 10, progress: 'battles_won',  reward: { gems: 300, icon: '💎' } },
  { id: 'wm_summon10',  name: 'Eager Recruiter',    desc: 'Perform 10 summons',        goal: 10, progress: 'summons',      reward: { gems: 500, icon: '💎' } },
  { id: 'wm_grandrush5',name: 'Unstoppable Crew',   desc: 'Activate Grand Rush 5 times',goal:5,  progress: 'grand_rush',   reward: { gems: 400, icon: '💎' } },
  { id: 'wm_pvp5',      name: 'PvP Challenger',     desc: 'Win 5 PvP matches',         goal: 5,  progress: 'pvp_wins',     reward: { gems: 600, icon: '💎' } },
  { id: 'wm_story3',    name: 'Grand Line Explorer', desc: 'Clear 3 story chapters',    goal: 3,  progress: 'chapters',     reward: { tickets: 3, icon: '🎫' } },
  { id: 'wm_combo10',   name: 'Combo King',         desc: 'Hit a 10+ hit combo',       goal: 1,  progress: 'combo10',      reward: { stones: 20, icon: '🔮' } },
];

// 30-day rolling login calendar
const LOGIN_SCHEDULE = [
  { day: 1,  reward: { gems: 100,  icon: '💎', label: '100 Gems' } },
  { day: 2,  reward: { stones: 10, icon: '🔮', label: '10 Upgrade Stones' } },
  { day: 3,  reward: { gems: 150,  icon: '💎', label: '150 Gems' } },
  { day: 4,  reward: { tickets: 1, icon: '🎫', label: '1 Recruit Ticket' } },
  { day: 5,  reward: { gems: 200,  icon: '💎', label: '200 Gems' } },
  { day: 6,  reward: { stones: 20, icon: '🔮', label: '20 Upgrade Stones' } },
  { day: 7,  reward: { gems: 500,  icon: '💎', label: '500 Gems ★ Week 1' } },
  { day: 8,  reward: { gems: 100,  icon: '💎', label: '100 Gems' } },
  { day: 9,  reward: { stones: 15, icon: '🔮', label: '15 Upgrade Stones' } },
  { day: 10, reward: { gems: 200,  icon: '💎', label: '200 Gems' } },
  { day: 11, reward: { tickets: 2, icon: '🎫', label: '2 Recruit Tickets' } },
  { day: 12, reward: { gems: 250,  icon: '💎', label: '250 Gems' } },
  { day: 13, reward: { stones: 25, icon: '🔮', label: '25 Upgrade Stones' } },
  { day: 14, reward: { gems: 600,  icon: '💎', label: '600 Gems ★ Week 2' } },
  { day: 15, reward: { gems: 150,  icon: '💎', label: '150 Gems' } },
  { day: 16, reward: { stones: 20, icon: '🔮', label: '20 Upgrade Stones' } },
  { day: 17, reward: { gems: 200,  icon: '💎', label: '200 Gems' } },
  { day: 18, reward: { tickets: 2, icon: '🎫', label: '2 Recruit Tickets' } },
  { day: 19, reward: { gems: 300,  icon: '💎', label: '300 Gems' } },
  { day: 20, reward: { stones: 30, icon: '🔮', label: '30 Upgrade Stones' } },
  { day: 21, reward: { gems: 700,  icon: '💎', label: '700 Gems ★ Week 3' } },
  { day: 22, reward: { gems: 200,  icon: '💎', label: '200 Gems' } },
  { day: 23, reward: { stones: 25, icon: '🔮', label: '25 Upgrade Stones' } },
  { day: 24, reward: { gems: 300,  icon: '💎', label: '300 Gems' } },
  { day: 25, reward: { tickets: 3, icon: '🎫', label: '3 Recruit Tickets' } },
  { day: 26, reward: { gems: 350,  icon: '💎', label: '350 Gems' } },
  { day: 27, reward: { stones: 35, icon: '🔮', label: '35 Upgrade Stones' } },
  { day: 28, reward: { gems: 800,  icon: '💎', label: '800 Gems ★ Week 4' } },
  { day: 29, reward: { gems: 500,  icon: '💎', label: '500 Gems' } },
  { day: 30, reward: { gems: 1000, tickets: 5, icon: '⭐', label: '1000 Gems + 5 Tickets ★ MONTH END' } },
];

class MissionsSystem {
  constructor(saveData) {
    this.save = saveData;
    this.eventProgress = {}; // tracked per session
  }

  checkAndResetDaily() {
    const today = new Date().toDateString();
    if (this.save.missions.dailyLastReset !== today) {
      this.save.missions.dailyLastReset = today;
      this.save.missions.dailyCompleted = [];
      this.save.missions.dailyClaimed = [];
      this.eventProgress = {};
      SaveState.save(this.save);
    }
  }

  checkAndResetWeekly() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toDateString();
    if (this.save.missions.weeklyLastReset !== weekKey) {
      this.save.missions.weeklyLastReset = weekKey;
      this.save.missions.weeklyCompleted = [];
      this.save.missions.weeklyClaimed = [];
      SaveState.save(this.save);
    }
  }

  trackEvent(eventType, count = 1) {
    this.eventProgress[eventType] = (this.eventProgress[eventType] || 0) + count;

    // Check daily missions
    DAILY_MISSIONS.forEach(m => {
      if (m.progress === eventType && !this.save.missions.dailyCompleted.includes(m.id)) {
        if ((this.eventProgress[eventType] || 0) >= m.goal) {
          this.save.missions.dailyCompleted.push(m.id);
          SaveState.save(this.save);
        }
      }
    });

    // Check weekly missions
    WEEKLY_MISSIONS.forEach(m => {
      if (m.progress === eventType && !this.save.missions.weeklyCompleted.includes(m.id)) {
        // Weekly uses a persistent counter from save
        const key = `wk_${m.id}`;
        this.save.missions[key] = (this.save.missions[key] || 0) + count;
        if (this.save.missions[key] >= m.goal) {
          this.save.missions.weeklyCompleted.push(m.id);
          SaveState.save(this.save);
        }
      }
    });
  }

  claimDailyReward(missionId) {
    if (!this.save.missions.dailyCompleted.includes(missionId)) return null;
    if (this.save.missions.dailyClaimed.includes(missionId)) return null;
    const mission = DAILY_MISSIONS.find(m => m.id === missionId);
    if (!mission) return null;
    this.applyReward(mission.reward);
    this.save.missions.dailyClaimed.push(missionId);
    SaveState.save(this.save);
    return mission.reward;
  }

  claimWeeklyReward(missionId) {
    if (!this.save.missions.weeklyCompleted.includes(missionId)) return null;
    if (this.save.missions.weeklyClaimed.includes(missionId)) return null;
    const mission = WEEKLY_MISSIONS.find(m => m.id === missionId);
    if (!mission) return null;
    this.applyReward(mission.reward);
    this.save.missions.weeklyClaimed.push(missionId);
    SaveState.save(this.save);
    return mission.reward;
  }

  claimAllAvailableDaily() {
    const claimed = [];
    DAILY_MISSIONS.forEach(m => {
      const reward = this.claimDailyReward(m.id);
      if (reward) claimed.push({ mission: m, reward });
    });
    return claimed;
  }

  getLoginBonusDay() {
    const bonus = this.save.loginBonus;
    const dayIndex = (bonus.totalDays - 1) % 30;
    return LOGIN_SCHEDULE[dayIndex] || LOGIN_SCHEDULE[0];
  }

  claimLoginBonus() {
    const bonusData = SaveState.checkLoginBonus(this.save);
    if (!bonusData) return null; // already claimed today

    const schedule = this.getLoginBonusDay();
    this.applyReward(schedule.reward);
    SaveState.save(this.save);
    return { ...schedule.reward, day: this.save.loginBonus.totalDays, streak: bonusData.streak };
  }

  applyReward(reward) {
    if (reward.gems) {
      this.save.gems = (this.save.gems || 0) + reward.gems;
    }
    if (reward.stones) {
      this.save.inventory.upgradeStones = (this.save.inventory.upgradeStones || 0) + reward.stones;
    }
    if (reward.tickets) {
      this.save.inventory.recruitTickets = (this.save.inventory.recruitTickets || 0) + reward.tickets;
    }
    SaveState.save(this.save);
  }

  getMissionState(missionId, isWeekly = false) {
    const list = isWeekly ? WEEKLY_MISSIONS : DAILY_MISSIONS;
    const m = list.find(m => m.id === missionId);
    if (!m) return null;
    const completed = isWeekly
      ? this.save.missions.weeklyCompleted.includes(missionId)
      : this.save.missions.dailyCompleted.includes(missionId);
    const claimed = isWeekly
      ? this.save.missions.weeklyClaimed.includes(missionId)
      : this.save.missions.dailyClaimed.includes(missionId);
    const progressKey = isWeekly ? `wk_${missionId}` : m.progress;
    const currentProgress = isWeekly
      ? (this.save.missions[progressKey] || 0)
      : (this.eventProgress[m.progress] || 0);
    return { ...m, completed, claimed, currentProgress };
  }

  hasUnclaimedRewards() {
    return DAILY_MISSIONS.some(m =>
      this.save.missions.dailyCompleted.includes(m.id) &&
      !this.save.missions.dailyClaimed.includes(m.id)
    );
  }

  getTotalDailyGems() {
    return DAILY_MISSIONS.reduce((sum, m) => sum + (m.reward.gems || 0), 0);
  }
}
