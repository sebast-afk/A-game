// One Piece Legends - Story Mode

const STORY_SAGAS = [
  {
    id: 'eastblue', name: 'East Blue', icon: '🌊',
    subtitle: 'The adventure begins.',
    color: '#2266AA', locked: false,
    chapters: [
      {
        id: 'eb1', title: 'Dawn Island', subtitle: 'Luffy\'s Promise',
        stages: 3, boss: 'Alvida',
        dialogue: [
          { speaker: 'Luffy', text: 'I\'m going to be King of the Pirates!' },
          { speaker: 'Shanks', text: 'Then you\'ll need a real crew, Luffy.' },
        ],
        enemies: ['alvida', 'coby', 'helmeppo'],
        rewards: { gems: 10, stones: 5, chars: [] },
      },
      {
        id: 'eb2', title: 'Shells Town', subtitle: 'A Hunter in a Cage',
        stages: 3, boss: 'Morgan',
        dialogue: [
          { speaker: 'Zoro', text: 'Untie these ropes. I\'ll follow you... once.' },
          { speaker: 'Luffy', text: 'Join my crew! You\'ll be my first crewmate!' },
        ],
        enemies: ['coby', 'helmeppo', 'coby'],
        rewards: { gems: 15, stones: 8 },
        unlockChar: 'zoro',
      },
      {
        id: 'eb3', title: 'Orange Town', subtitle: 'A Clown and his Crew',
        stages: 3, boss: 'Buggy',
        dialogue: [
          { speaker: 'Buggy', text: 'I\'ll slice you into a million pieces, brat!' },
          { speaker: 'Luffy', text: 'You\'re just a clown. Let Nami go!' },
        ],
        enemies: ['buggy', 'alvida', 'buggy'],
        rewards: { gems: 20, stones: 10, tickets: 1 },
      },
      {
        id: 'eb4', title: 'Syrup Village', subtitle: 'The Would-be Pirate',
        stages: 3, boss: 'Kuro',
        dialogue: [
          { speaker: 'Usopp', text: 'I\'m the captain of the Usopp Pirates! I lied... but I will protect this village!' },
          { speaker: 'Luffy', text: 'Then fight with us!' },
        ],
        enemies: ['coby', 'helmeppo', 'coby'],
        rewards: { gems: 20, stones: 12 },
        unlockChar: 'usopp',
      },
      {
        id: 'eb5', title: 'Baratie', subtitle: 'The Sea Restaurant',
        stages: 4, boss: 'Don Krieg',
        dialogue: [
          { speaker: 'Sanji', text: 'I swore to never let anyone go hungry at sea.' },
          { speaker: 'Luffy', text: 'I want you on my crew, cook!' },
        ],
        enemies: ['coby', 'crocodile', 'helmeppo', 'coby'],
        rewards: { gems: 25, stones: 15, tickets: 1 },
        unlockChar: 'sanji',
      },
      {
        id: 'eb6', title: 'Arlong Park', subtitle: 'Nami\'s Tears',
        stages: 4, boss: 'Arlong',
        dialogue: [
          { speaker: 'Nami', text: 'Help me... my friends...' },
          { speaker: 'Luffy', text: 'OF COURSE. You\'re my navigator!' },
        ],
        enemies: ['jinbe', 'crocodile', 'buggy', 'jinbe'],
        rewards: { gems: 30, stones: 20, tickets: 2 },
        unlockChar: 'nami',
      },
    ],
  },
  {
    id: 'alabasta', name: 'Alabasta', icon: '🏜️',
    subtitle: 'A kingdom on the brink.',
    color: '#CC8800', locked: true,
    requiresCompleted: 'eastblue',
    chapters: [
      {
        id: 'al1', title: 'Reverse Mountain', subtitle: 'The Grand Line Begins',
        stages: 3, boss: 'Sea King',
        dialogue: [
          { speaker: 'Nami', text: 'We\'re heading into the Grand Line. There\'s no turning back.' },
          { speaker: 'Luffy', text: 'Bring it on!' },
        ],
        enemies: ['coby', 'helmeppo', 'alvida'],
        rewards: { gems: 30, stones: 15 },
      },
      {
        id: 'al2', title: 'Whisky Peak', subtitle: 'Baroque Works',
        stages: 3, boss: 'Mr. 9 & Miss Monday',
        dialogue: [
          { speaker: 'Zoro', text: 'Something\'s off about this welcome party.' },
        ],
        enemies: ['coby', 'alvida', 'buggy'],
        rewards: { gems: 35, stones: 18 },
      },
      {
        id: 'al3', title: 'Little Garden', subtitle: 'Giants at War',
        stages: 3, boss: 'Mr. 3',
        dialogue: [
          { speaker: 'Usopp', text: 'D-Dinosaurs?! This island is prehistoric!!' },
        ],
        enemies: ['helmeppo', 'coby', 'alvida'],
        rewards: { gems: 35, stones: 20, tickets: 1 },
      },
      {
        id: 'al4', title: 'Drum Island', subtitle: 'The Pirate Doctor',
        stages: 3, boss: 'Wapol',
        dialogue: [
          { speaker: 'Chopper', text: 'There\'s a disease that needs curing! I won\'t let people die!' },
          { speaker: 'Luffy', text: 'Join us, Chopper! You\'re our doctor!' },
        ],
        enemies: ['coby', 'buggy', 'alvida'],
        rewards: { gems: 40, stones: 22, tickets: 1 },
        unlockChar: 'chopper',
      },
      {
        id: 'al5', title: 'Alabasta', subtitle: 'Vs. Sir Crocodile',
        stages: 5, boss: 'Crocodile',
        dialogue: [
          { speaker: 'Crocodile', text: 'Sand. Desert. Empire. All will be mine.' },
          { speaker: 'Luffy', text: 'You hurt Vivi! You hurt her kingdom! I\'M GONNA KICK YOUR ASS!' },
        ],
        enemies: ['crocodile', 'buggy', 'alvida', 'coby', 'crocodile'],
        rewards: { gems: 80, stones: 40, tickets: 3 },
      },
    ],
  },
  {
    id: 'skypiea', name: 'Skypiea', icon: '☁️',
    subtitle: 'The island in the clouds.',
    color: '#888800', locked: true,
    requiresCompleted: 'alabasta',
    chapters: [
      {
        id: 'sky1', title: 'Sky Island Entry', subtitle: 'Heaven\'s Gate',
        stages: 3, boss: 'Shandian Warriors',
        enemies: ['coby', 'helmeppo', 'alvida'],
        rewards: { gems: 40, stones: 20 },
      },
      {
        id: 'sky2', title: 'Upper Yard', subtitle: 'God\'s Domain',
        stages: 4, boss: 'Ohm',
        enemies: ['buggy', 'coby', 'helmeppo', 'alvida'],
        rewards: { gems: 50, stones: 25 },
      },
      {
        id: 'sky3', title: 'Vs. Enel', subtitle: 'Thunder God',
        stages: 5, boss: 'Enel',
        dialogue: [
          { speaker: 'Enel', text: 'I am God. Your fist cannot touch me.' },
          { speaker: 'Luffy', text: 'Rubber and lightning don\'t mix. I can beat you!' },
        ],
        enemies: ['coby', 'helmeppo', 'alvida', 'buggy', 'coby'],
        rewards: { gems: 90, stones: 50, tickets: 3 },
      },
    ],
  },
  {
    id: 'watersevenenieslob', name: 'Water 7 / Enies Lobby', icon: '🏭',
    subtitle: 'Rescue Robin. Burn the flag.',
    color: '#4477AA', locked: true,
    requiresCompleted: 'skypiea',
    chapters: [
      {
        id: 'w7_1', title: 'Water 7', subtitle: 'The Galley-La Company',
        stages: 3, boss: 'Galley-La Foremen',
        enemies: ['coby', 'helmeppo', 'alvida'],
        rewards: { gems: 50, stones: 25 },
      },
      {
        id: 'w7_2', title: 'Aqua Laguna', subtitle: 'The Great Tidal Wave',
        stages: 3, boss: 'CP9 Agent',
        enemies: ['buggy', 'crocodile', 'coby'],
        rewards: { gems: 55, stones: 28 },
      },
      {
        id: 'w7_3', title: 'Enies Lobby', subtitle: 'Buster Call Incoming',
        stages: 4, boss: 'Rob Lucci',
        dialogue: [
          { speaker: 'Robin', text: 'I want to live!' },
          { speaker: 'Luffy', text: 'Then come back with us!' },
        ],
        enemies: ['coby', 'helmeppo', 'alvida', 'buggy'],
        rewards: { gems: 60, stones: 30, tickets: 2 },
        unlockChar: 'robin',
      },
      {
        id: 'w7_4', title: 'Escape the Buster Call', subtitle: 'Run!',
        stages: 5, boss: 'CP9 Chief',
        enemies: ['coby', 'helmeppo', 'alvida', 'buggy', 'crocodile'],
        rewards: { gems: 100, stones: 55, tickets: 4 },
        unlockChar: 'franky',
      },
    ],
  },
  {
    id: 'marineford_saga', name: 'Marineford', icon: '⚓',
    subtitle: 'The war at the top.',
    color: '#AA3300', locked: true,
    requiresCompleted: 'watersevenenieslob',
    chapters: [
      {
        id: 'mf1', title: 'Impel Down', subtitle: 'Level 6 Breakout',
        stages: 4, boss: 'Magellan',
        dialogue: [
          { speaker: 'Luffy', text: 'ACE!! I\'m coming for you!!' },
          { speaker: 'Ivankov', text: 'Your Tension Hormones are running low, Luffy!' },
        ],
        enemies: ['coby', 'helmeppo', 'buggy', 'alvida'],
        rewards: { gems: 60, stones: 35 },
      },
      {
        id: 'mf2', title: 'Marineford War', subtitle: 'Paramount War',
        stages: 5, boss: 'Kizaru',
        dialogue: [
          { speaker: 'Whitebeard', text: 'This old man\'s era is coming to an end. But yours is just beginning.' },
          { speaker: 'Ace', text: 'Oyaji!!' },
        ],
        enemies: ['coby', 'helmeppo', 'alvida', 'buggy', 'coby'],
        rewards: { gems: 80, stones: 45, tickets: 3 },
      },
      {
        id: 'mf3', title: 'Ace\'s Fate', subtitle: 'The World Shakes',
        stages: 3, boss: 'Admiral Akainu',
        dialogue: [
          { speaker: 'Ace', text: 'My life wasn\'t a mistake...! Thank you for loving me.' },
          { speaker: 'Luffy', text: 'ACE!!!!' },
        ],
        enemies: ['coby', 'helmeppo', 'coby'],
        rewards: { gems: 120, stones: 70, tickets: 5 },
      },
    ],
  },
  {
    id: 'wano', name: 'Wano', icon: '🏯',
    subtitle: 'The raid on Onigashima.',
    color: '#CC0044', locked: true,
    requiresCompleted: 'marineford_saga',
    chapters: [
      {
        id: 'wn1', title: 'Wano Entry', subtitle: 'Kuri\'s Fire',
        stages: 3, boss: 'Shogun\'s Forces',
        enemies: ['coby', 'helmeppo', 'alvida'],
        rewards: { gems: 70, stones: 40 },
      },
      {
        id: 'wn2', title: 'Flower Capital', subtitle: 'Allies Gather',
        stages: 4, boss: 'Apoo',
        enemies: ['buggy', 'coby', 'helmeppo', 'buggy'],
        rewards: { gems: 80, stones: 45, tickets: 2 },
      },
      {
        id: 'wn3', title: 'Onigashima Raid', subtitle: 'The Beast Pirates',
        stages: 5, boss: 'King & Queen',
        enemies: ['crocodile', 'buggy', 'coby', 'helmeppo', 'crocodile'],
        rewards: { gems: 90, stones: 55, tickets: 3 },
      },
      {
        id: 'wn4', title: 'Rooftop Clash', subtitle: 'Five Supernova vs Two Emperors',
        stages: 5, boss: 'Kaido',
        dialogue: [
          { speaker: 'Kaido', text: 'Give me the best era! Come, Worst Generation!' },
          { speaker: 'Law', text: 'Room.' },
          { speaker: 'Luffy', text: 'I\'m the one who will surpass you all!' },
        ],
        enemies: ['kaido', 'crocodile', 'buggy', 'crocodile', 'kaido'],
        rewards: { gems: 100, stones: 60, tickets: 4 },
      },
      {
        id: 'wn5', title: 'Gear Fifth Awakening', subtitle: 'The Sun God Nika',
        stages: 3, boss: 'Kaido (Final)',
        dialogue: [
          { speaker: 'Kaido', text: 'Luffy... is that... the Mythical Zoan? Nika?!' },
          { speaker: 'Luffy', text: 'GEAR FIFTH!!! My heart... is BEATING... so LOUD!! *laughs*' },
        ],
        enemies: ['kaido', 'kaido', 'kaido'],
        rewards: { gems: 200, stones: 100, tickets: 10 },
      },
    ],
  },
];

class StorySystem {
  constructor(saveData) {
    this.save = saveData;
  }

  getSagaStatus(sagaId) {
    const saga = STORY_SAGAS.find(s => s.id === sagaId);
    if (!saga) return null;
    const progress = this.save.storyProgress[sagaId] || { completed: [], stars: {} };
    return {
      ...saga,
      completed: progress.completed || [],
      isUnlocked: !saga.locked || this.isSagaCompleted(saga.requiresCompleted),
      isCompleted: (progress.completed || []).length >= saga.chapters.length,
    };
  }

  isSagaCompleted(sagaId) {
    if (!sagaId) return true;
    const prog = this.save.storyProgress[sagaId];
    if (!prog) return false;
    const saga = STORY_SAGAS.find(s => s.id === sagaId);
    return saga && (prog.completed || []).length >= saga.chapters.length;
  }

  getChapterStatus(sagaId, chapterId) {
    const saga = STORY_SAGAS.find(s => s.id === sagaId);
    if (!saga) return null;
    const chapter = saga.chapters.find(c => c.id === chapterId);
    if (!chapter) return null;
    const progress = this.save.storyProgress[sagaId] || {};
    const isCompleted = (progress.completed || []).includes(chapterId);
    const stars = (progress.stars || {})[chapterId] || 0;
    return { ...chapter, isCompleted, stars };
  }

  completeChapter(sagaId, chapterId, starsEarned = 3) {
    if (!this.save.storyProgress[sagaId]) {
      this.save.storyProgress[sagaId] = { completed: [], stars: {} };
    }
    const progress = this.save.storyProgress[sagaId];
    if (!progress.completed.includes(chapterId)) {
      progress.completed.push(chapterId);
    }
    progress.stars[chapterId] = Math.max(progress.stars[chapterId] || 0, starsEarned);

    // Apply chapter rewards
    const saga = STORY_SAGAS.find(s => s.id === sagaId);
    const chapter = saga?.chapters.find(c => c.id === chapterId);
    let rewards = null;
    if (chapter?.rewards) {
      rewards = chapter.rewards;
      if (rewards.gems) this.save.gems = (this.save.gems || 0) + rewards.gems;
      if (rewards.stones) this.save.inventory.upgradeStones += rewards.stones;
      if (rewards.tickets) this.save.inventory.recruitTickets += rewards.tickets;
    }

    // Unlock character if specified
    if (chapter?.unlockChar && !this.save.ownedCharacters[chapter.unlockChar]) {
      SaveState.addCharacter(this.save, chapter.unlockChar, 0);
    }

    SaveState.save(this.save);
    return rewards;
  }

  getNextChapter(sagaId) {
    const saga = STORY_SAGAS.find(s => s.id === sagaId);
    if (!saga) return null;
    const progress = this.save.storyProgress[sagaId] || {};
    const completed = progress.completed || [];
    return saga.chapters.find(c => !completed.includes(c.id));
  }

  getTotalGemsAvailable() {
    return STORY_SAGAS.reduce((total, saga) =>
      total + saga.chapters.reduce((st, ch) => st + (ch.rewards?.gems || 0), 0)
    , 0);
  }
}
