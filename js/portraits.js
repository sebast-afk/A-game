// One Piece Legends - Canvas Character Portraits

const CharacterPortraits = {

  draw(canvas, charId) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const method = '_' + charId;
    if (typeof this[method] === 'function') {
      this[method](ctx, w, h);
    } else {
      const char = (typeof ALL_CHARACTERS !== 'undefined') ? ALL_CHARACTERS[charId] : null;
      this._drawGeneric(ctx, w, h, char || { name: charId, modelColor: '#333', icon: '?' });
    }

    const char = (typeof ALL_CHARACTERS !== 'undefined') ? ALL_CHARACTERS[charId] : null;
    if (char) this._drawRarityBorder(ctx, w, h, char.rarity);
  },

  _drawGeneric(ctx, w, h, char) {
    // Background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, char.modelColor || '#333');
    bg.addColorStop(1, '#000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Body
    ctx.fillStyle = '#555';
    ctx.fillRect(w * 0.3, h * 0.55, w * 0.4, h * 0.35);

    // Head
    ctx.fillStyle = '#FFCC99';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.38, w * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(w * 0.42, h * 0.36, w * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.58, h * 0.36, w * 0.04, 0, Math.PI * 2); ctx.fill();

    // Name
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, 14);
    ctx.fillStyle = '#fff';
    ctx.font = `bold 8px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText((char.name || '').toUpperCase(), w / 2, 10);

    // Icon
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillText(char.icon || '?', w / 2, h * 0.85);
  },

  _drawRarityBorder(ctx, w, h, rarity) {
    let color, glow, glowSize;
    switch (rarity) {
      case 'R':         color = '#888';    glow = null;      glowSize = 0; break;
      case 'SR':        color = '#4488FF'; glow = '#4488FF'; glowSize = 4; break;
      case 'SSR':       color = '#FFD700'; glow = '#FFD700'; glowSize = 6; break;
      case 'Legendary': color = '#FF6600'; glow = '#FF6600'; glowSize = 8; break;
      case 'EX':        color = '#FF00FF'; glow = '#FF00FF'; glowSize = 10; break;
      default:          color = '#555';    glow = null;      glowSize = 0;
    }
    ctx.save();
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = glowSize;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = rarity === 'EX' ? 3 : 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    if (rarity === 'EX') {
      ctx.strokeStyle = '#FF88FF';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 4, w - 8, h - 8);
    }
    ctx.restore();
  },

  // ── Helpers ──────────────────────────────────────────────

  _bg(ctx, w, h, c1, c2, angle) {
    angle = angle || 135;
    const rad = (angle * Math.PI) / 180;
    const x1 = w / 2 - Math.cos(rad) * w;
    const y1 = h / 2 - Math.sin(rad) * h;
    const x2 = w / 2 + Math.cos(rad) * w;
    const y2 = h / 2 + Math.sin(rad) * h;
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  },

  _head(ctx, cx, cy, r, skinColor) {
    ctx.fillStyle = skinColor || '#FFCC99';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  },

  _eyes(ctx, cx, cy, size, color) {
    color = color || '#1a1a1a';
    const offX = size * 1.1;
    [-offX, offX].forEach(dx => {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(cx + dx, cy, size * 0.9, size * 1.1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(cx + dx, cy + size * 0.1, size * 0.6, size * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx + dx + size * 0.2, cy - size * 0.2, size * 0.25, 0, Math.PI * 2); ctx.fill();
    });
  },

  _smile(ctx, cx, cy, w) {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, w, 0, Math.PI);
    ctx.stroke();
  },

  _nameTag(ctx, name, w) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, w, 13);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name.toUpperCase(), w / 2, 9);
  },

  _body(ctx, cx, cy, bw, bh, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(cx - bw / 2, cy, bw, bh, 4);
    ctx.fill();
  },

  // ── Characters ───────────────────────────────────────────

  _luffy(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0a00', '#3a0000');
    // Body - red vest
    ctx.fillStyle = '#CC1111';
    ctx.beginPath(); ctx.roundRect(w * 0.28, h * 0.52, w * 0.44, h * 0.38, 4); ctx.fill();
    // Shorts - blue
    ctx.fillStyle = '#2244AA';
    ctx.fillRect(w * 0.3, h * 0.72, w * 0.4, h * 0.18);
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.22, '#FFCC88');
    // Black spiky hair
    ctx.fillStyle = '#111';
    for (let i = 0; i < 7; i++) {
      const angle = -Math.PI * 0.9 + (i / 6) * Math.PI * 1.0;
      ctx.beginPath();
      ctx.ellipse(
        w / 2 + Math.cos(angle) * w * 0.19,
        h * 0.36 + Math.sin(angle) * w * 0.18 - w * 0.04,
        w * 0.07, w * 0.14, angle + Math.PI / 2, 0, Math.PI * 2
      );
      ctx.fill();
    }
    // Hair base
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.28, w * 0.2, Math.PI, Math.PI * 2);
    ctx.fill();
    // Eyes
    this._eyes(ctx, w / 2, h * 0.37, w * 0.05, '#1a1a1a');
    // Scar under left eye
    ctx.strokeStyle = '#CC3333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.38, h * 0.41);
    ctx.lineTo(w * 0.42, h * 0.43);
    ctx.stroke();
    // Big grin
    ctx.strokeStyle = '#7B3000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.39, w * 0.12, 0.1, Math.PI - 0.1);
    ctx.stroke();
    // Straw hat - yellow
    ctx.fillStyle = '#E8C840';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.19, w * 0.34, w * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D4AA20';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.17, w * 0.2, w * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    // Hat band - red
    ctx.strokeStyle = '#CC0000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.175, w * 0.2, w * 0.065, 0, 0, Math.PI * 2); ctx.stroke();
    this._nameTag(ctx, 'Luffy', w);
  },

  _zoro(ctx, w, h) {
    this._bg(ctx, w, h, '#001a00', '#002a00');
    // Body - white shirt
    ctx.fillStyle = '#DDDDDD';
    ctx.beginPath(); ctx.roundRect(w * 0.25, h * 0.52, w * 0.5, h * 0.38, 4); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.21, '#FFCC88');
    // Green spiky hair
    ctx.fillStyle = '#1a6600';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.2, Math.PI, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI + (i / 4) * Math.PI;
      ctx.beginPath();
      ctx.ellipse(
        w / 2 + Math.cos(angle) * w * 0.16,
        h * 0.27 + Math.sin(angle) * w * 0.14,
        w * 0.06, w * 0.12, angle + Math.PI / 2, 0, Math.PI * 2
      );
      ctx.fill();
    }
    // Green bandana
    ctx.fillStyle = '#228B22';
    ctx.fillRect(w * 0.28, h * 0.3, w * 0.44, h * 0.07);
    // Eyes - left has scar closed
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(w * 0.58, h * 0.365, w * 0.05, w * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(w * 0.58, h * 0.37, w * 0.035, w * 0.05, 0, 0, Math.PI * 2); ctx.fill();
    // Left eye scar (closed)
    ctx.strokeStyle = '#994444';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.34); ctx.lineTo(w * 0.44, h * 0.41); ctx.stroke();
    // Three swords
    const swordColor = '#CCCCCC';
    [[w * 0.15, h * 0.5], [w * 0.82, h * 0.5], [w / 2, h * 0.47]].forEach(([sx, sy], i) => {
      ctx.strokeStyle = swordColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (i === 2) { // mouth sword horizontal
        ctx.moveTo(w * 0.35, h * 0.44);
        ctx.lineTo(w * 0.65, h * 0.44);
      } else {
        ctx.moveTo(sx, sy - h * 0.22);
        ctx.lineTo(sx, sy + h * 0.22);
      }
      ctx.stroke();
      // Guard
      ctx.strokeStyle = '#AA8833';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (i === 2) {
        ctx.moveTo(w / 2, h * 0.41); ctx.lineTo(w / 2, h * 0.47);
      } else {
        ctx.moveTo(sx - w * 0.05, sy); ctx.lineTo(sx + w * 0.05, sy);
      }
      ctx.stroke();
    });
    this._nameTag(ctx, 'Zoro', w);
  },

  _sanji(ctx, w, h) {
    this._bg(ctx, w, h, '#0a0a0a', '#1a1a2a');
    // Black suit
    ctx.fillStyle = '#111111';
    ctx.beginPath(); ctx.roundRect(w * 0.26, h * 0.52, w * 0.48, h * 0.38, 4); ctx.fill();
    // White shirt/tie
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.52); ctx.lineTo(w * 0.54, h * 0.52); ctx.lineTo(w * 0.5, h * 0.72); ctx.closePath(); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.21, '#FFCC88');
    // Blonde hair sweeping over LEFT eye
    ctx.fillStyle = '#E8CC40';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.27, w * 0.19, Math.PI, Math.PI * 2);
    ctx.fill();
    // Hair sweeping left
    ctx.beginPath();
    ctx.moveTo(w * 0.29, h * 0.3);
    ctx.quadraticCurveTo(w * 0.25, h * 0.38, w * 0.3, h * 0.44);
    ctx.lineTo(w * 0.38, h * 0.38);
    ctx.quadraticCurveTo(w * 0.32, h * 0.3, w * 0.4, h * 0.27);
    ctx.closePath();
    ctx.fill();
    // Only RIGHT eye visible
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(w * 0.59, h * 0.365, w * 0.05, w * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(w * 0.59, h * 0.37, w * 0.035, w * 0.05, 0, 0, Math.PI * 2); ctx.fill();
    // Swirly eyebrow (right)
    ctx.strokeStyle = '#E8CC40';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.54, h * 0.325);
    ctx.quadraticCurveTo(w * 0.62, h * 0.31, w * 0.65, h * 0.33);
    ctx.quadraticCurveTo(w * 0.63, h * 0.35, w * 0.59, h * 0.34);
    ctx.stroke();
    // Cigarette
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(w * 0.5, h * 0.43, w * 0.16, h * 0.025);
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(w * 0.655, h * 0.43, w * 0.025, h * 0.025);
    this._nameTag(ctx, 'Sanji', w);
  },

  _nami(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0d00', '#2a1500');
    // Orange top
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath(); ctx.roundRect(w * 0.3, h * 0.52, w * 0.4, h * 0.25, 4); ctx.fill();
    // Shorts
    ctx.fillStyle = '#DDAA44';
    ctx.fillRect(w * 0.3, h * 0.72, w * 0.4, h * 0.16);
    // Head
    this._head(ctx, w / 2, h * 0.37, w * 0.2, '#FFCC88');
    // Long orange hair
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.28, w * 0.19, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.31);
    ctx.quadraticCurveTo(w * 0.22, h * 0.5, w * 0.25, h * 0.7);
    ctx.lineTo(w * 0.32, h * 0.68);
    ctx.quadraticCurveTo(w * 0.28, h * 0.5, w * 0.35, h * 0.33);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * 0.31);
    ctx.quadraticCurveTo(w * 0.78, h * 0.5, w * 0.75, h * 0.7);
    ctx.lineTo(w * 0.68, h * 0.68);
    ctx.quadraticCurveTo(w * 0.72, h * 0.5, w * 0.65, h * 0.33);
    ctx.closePath();
    ctx.fill();
    this._eyes(ctx, w / 2, h * 0.38, w * 0.045, '#5B3000');
    // Clima-tact staff
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(w * 0.82, h * 0.3); ctx.lineTo(w * 0.82, h * 0.85); ctx.stroke();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(w * 0.82, h * 0.3, 5, 0, Math.PI * 2); ctx.fill();
    this._nameTag(ctx, 'Nami', w);
  },

  _usopp(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0d00', '#3a1a00');
    // Brown shirt
    ctx.fillStyle = '#8B5A2B';
    ctx.beginPath(); ctx.roundRect(w * 0.27, h * 0.52, w * 0.46, h * 0.36, 4); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.38, w * 0.2, '#CC9966');
    // Dark curly hair (afro-ish)
    ctx.fillStyle = '#2a1800';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.28, w * 0.22, Math.PI, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI + (i / 5) * Math.PI;
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(a) * w * 0.16, h * 0.28 + Math.sin(a) * w * 0.1, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    this._eyes(ctx, w / 2, h * 0.38, w * 0.045);
    // Long pointy nose
    ctx.fillStyle = '#CC9966';
    ctx.beginPath();
    ctx.moveTo(w * 0.48, h * 0.41);
    ctx.lineTo(w * 0.52, h * 0.41);
    ctx.lineTo(w * 0.6, h * 0.47);
    ctx.quadraticCurveTo(w * 0.56, h * 0.48, w * 0.5, h * 0.46);
    ctx.closePath();
    ctx.fill();
    // Slingshot
    ctx.strokeStyle = '#5C3317';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(w * 0.75, h * 0.56); ctx.lineTo(w * 0.83, h * 0.48); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.83, h * 0.48); ctx.lineTo(w * 0.88, h * 0.42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.83, h * 0.48); ctx.lineTo(w * 0.78, h * 0.42); ctx.stroke();
    this._nameTag(ctx, 'Usopp', w);
  },

  _law(ctx, w, h) {
    this._bg(ctx, w, h, '#0a0a1a', '#001a2a');
    // Spotted white jacket
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath(); ctx.roundRect(w * 0.22, h * 0.5, w * 0.56, h * 0.42, 4); ctx.fill();
    // Spots on jacket
    ctx.fillStyle = '#888';
    [[0.3, 0.57], [0.6, 0.57], [0.45, 0.65], [0.35, 0.72], [0.62, 0.72]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(w * px, h * py, 3, 0, Math.PI * 2); ctx.fill();
    });
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.2, '#FFCC88');
    // Dark hair under spotted hat
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.3, w * 0.18, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    // Spotted hat
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.215, w * 0.28, w * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#DDDDDD';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.19, w * 0.16, w * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    // Hat spots
    ctx.fillStyle = '#888';
    [[0.42, 0.21], [0.56, 0.21], [0.49, 0.175]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(w * px, h * py, 3, 0, Math.PI * 2); ctx.fill();
    });
    this._eyes(ctx, w / 2, h * 0.365, w * 0.044, '#1a1a1a');
    // Nodachi sword (long)
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(w * 0.82, h * 0.25); ctx.lineTo(w * 0.78, h * 0.9); ctx.stroke();
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(w * 0.81, h * 0.6); ctx.lineTo(w * 0.75, h * 0.62); ctx.stroke();
    this._nameTag(ctx, 'Law', w);
  },

  _robin(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0033', '#330066');
    // Purple outfit
    ctx.fillStyle = '#6600AA';
    ctx.beginPath(); ctx.roundRect(w * 0.28, h * 0.52, w * 0.44, h * 0.38, 4); ctx.fill();
    // Flower motif on outfit
    ctx.fillStyle = '#FF88CC';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(w * 0.5 + Math.cos(a) * 7, h * 0.62 + Math.sin(a) * 7, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#FFCCEE';
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.62, 4, 0, Math.PI * 2); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.2, '#FFCC99');
    // Long dark hair
    ctx.fillStyle = '#111133';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.2, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.3); ctx.quadraticCurveTo(w * 0.2, h * 0.55, w * 0.26, h * 0.78);
    ctx.lineTo(w * 0.33, h * 0.76); ctx.quadraticCurveTo(w * 0.27, h * 0.55, w * 0.37, h * 0.33); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * 0.3); ctx.quadraticCurveTo(w * 0.8, h * 0.55, w * 0.74, h * 0.78);
    ctx.lineTo(w * 0.67, h * 0.76); ctx.quadraticCurveTo(w * 0.73, h * 0.55, w * 0.63, h * 0.33); ctx.closePath(); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.37, w * 0.044, '#1a1a4a');
    // Extra arms (Devil Fruit)
    ctx.fillStyle = '#FFCC99';
    ctx.beginPath(); ctx.ellipse(w * 0.12, h * 0.65, w * 0.07, w * 0.04, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.88, h * 0.65, w * 0.07, w * 0.04, 0.5, 0, Math.PI * 2); ctx.fill();
    this._nameTag(ctx, 'Robin', w);
  },

  _franky(ctx, w, h) {
    this._bg(ctx, w, h, '#001133', '#002244');
    // Speedo / shorts (visible)
    ctx.fillStyle = '#0044CC';
    ctx.fillRect(w * 0.32, h * 0.68, w * 0.36, h * 0.2);
    // Mechanical arms (blue/silver)
    ctx.fillStyle = '#4488CC';
    ctx.beginPath(); ctx.roundRect(w * 0.06, h * 0.5, w * 0.18, h * 0.32, 8); ctx.fill();
    ctx.fillStyle = '#4488CC';
    ctx.beginPath(); ctx.roundRect(w * 0.76, h * 0.5, w * 0.18, h * 0.32, 8); ctx.fill();
    // Silver joints
    ctx.fillStyle = '#AACCEE';
    ctx.beginPath(); ctx.arc(w * 0.15, h * 0.52, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.85, h * 0.52, 6, 0, Math.PI * 2); ctx.fill();
    // Chest (bare, big build)
    ctx.fillStyle = '#FFAA77';
    ctx.beginPath(); ctx.roundRect(w * 0.24, h * 0.5, w * 0.52, h * 0.2, 4); ctx.fill();
    // FRANK star tattoo on chest
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('★', w / 2, h * 0.62);
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.2, '#FFAA77');
    // Blue hair mohawk
    ctx.fillStyle = '#0044CC';
    for (let i = 0; i < 5; i++) {
      const x = w * 0.38 + i * w * 0.06;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.27);
      ctx.lineTo(x - w * 0.02, h * 0.15 - i * 2);
      ctx.lineTo(x + w * 0.02, h * 0.15 - i * 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#0044CC';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.15, Math.PI, Math.PI * 2); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.375, w * 0.05, '#1a1a1a');
    // Sunglasses
    ctx.strokeStyle = '#AACCFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.35, h * 0.35, w * 0.12, h * 0.055);
    ctx.strokeRect(w * 0.53, h * 0.35, w * 0.12, h * 0.055);
    ctx.beginPath(); ctx.moveTo(w * 0.47, h * 0.375); ctx.lineTo(w * 0.53, h * 0.375); ctx.stroke();
    this._nameTag(ctx, 'Franky', w);
  },

  _brook(ctx, w, h) {
    this._bg(ctx, w, h, '#0a0a0a', '#111133');
    // Black suit (very thin body)
    ctx.fillStyle = '#111111';
    ctx.beginPath(); ctx.roundRect(w * 0.34, h * 0.52, w * 0.32, h * 0.4, 4); ctx.fill();
    // White shirt, bow tie
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.52); ctx.lineTo(w * 0.54, h * 0.52); ctx.lineTo(w * 0.5, h * 0.68); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.53, 4, 0, Math.PI * 2); ctx.fill();
    // Skull head (white/pale)
    ctx.fillStyle = '#EEE5CC';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.34, w * 0.2, 0, Math.PI * 2); ctx.fill();
    // Skull eye sockets (black)
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.ellipse(w * 0.41, h * 0.33, w * 0.065, w * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.59, h * 0.33, w * 0.065, w * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    // Skull nose (triangle hole)
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.moveTo(w * 0.49, h * 0.37); ctx.lineTo(w * 0.53, h * 0.37); ctx.lineTo(w * 0.51, h * 0.4); ctx.closePath(); ctx.fill();
    // Teeth
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.44, w * 0.12, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#EEE5CC';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(w * 0.39 + i * w * 0.044, h * 0.435, w * 0.03, h * 0.04);
    }
    // Large afro
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.22, w * 0.26, 0, Math.PI * 2); ctx.fill();
    // Top hat
    ctx.fillStyle = '#111';
    ctx.fillRect(w * 0.35, h * 0.02, w * 0.3, h * 0.13);
    ctx.fillRect(w * 0.28, h * 0.14, w * 0.44, h * 0.04);
    // Cane/violin
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * 0.78, h * 0.55); ctx.lineTo(w * 0.78, h * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.78, h * 0.55, 5, 0, Math.PI * 2); ctx.fill();
    this._nameTag(ctx, 'Brook', w);
  },

  _shanks(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0000', '#2a0000');
    // Red cloak
    ctx.fillStyle = '#CC1111';
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.5);
    ctx.lineTo(w * 0.05, h * 0.95);
    ctx.lineTo(w * 0.95, h * 0.95);
    ctx.lineTo(w * 0.85, h * 0.5);
    ctx.lineTo(w * 0.5, h * 0.55);
    ctx.closePath();
    ctx.fill();
    // Body under cloak
    ctx.fillStyle = '#881100';
    ctx.beginPath(); ctx.roundRect(w * 0.3, h * 0.52, w * 0.4, h * 0.32, 4); ctx.fill();
    // Missing left arm (stump)
    ctx.fillStyle = '#FFCC88';
    ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.6, w * 0.04, w * 0.07, 0.3, 0, Math.PI * 2); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.21, '#FFCC88');
    // Red flowing hair
    ctx.fillStyle = '#CC1111';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.2, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.3); ctx.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.24, h * 0.72);
    ctx.lineTo(w * 0.32, h * 0.7); ctx.quadraticCurveTo(w * 0.28, h * 0.5, w * 0.38, h * 0.33); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * 0.3); ctx.quadraticCurveTo(w * 0.8, h * 0.5, w * 0.76, h * 0.72);
    ctx.lineTo(w * 0.68, h * 0.7); ctx.quadraticCurveTo(w * 0.72, h * 0.5, w * 0.62, h * 0.33); ctx.closePath(); ctx.fill();
    // Scar over left eye
    this._eyes(ctx, w / 2, h * 0.37, w * 0.046, '#1a1a1a');
    ctx.strokeStyle = '#CC4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w * 0.36, h * 0.32); ctx.lineTo(w * 0.44, h * 0.42); ctx.stroke();
    this._nameTag(ctx, 'Shanks', w);
  },

  _whitebeard(ctx, w, h) {
    this._bg(ctx, w, h, '#0a0a1a', '#00001a');
    // Huge build - wide body
    ctx.fillStyle = '#444444';
    ctx.beginPath(); ctx.roundRect(w * 0.12, h * 0.5, w * 0.76, h * 0.44, 6); ctx.fill();
    // White beard (wing-shaped)
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.48);
    ctx.quadraticCurveTo(w * 0.1, h * 0.58, w * 0.05, h * 0.7);
    ctx.lineTo(w * 0.18, h * 0.7);
    ctx.quadraticCurveTo(w * 0.22, h * 0.58, w * 0.38, h * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * 0.48);
    ctx.quadraticCurveTo(w * 0.9, h * 0.58, w * 0.95, h * 0.7);
    ctx.lineTo(w * 0.82, h * 0.7);
    ctx.quadraticCurveTo(w * 0.78, h * 0.58, w * 0.62, h * 0.54);
    ctx.closePath();
    ctx.fill();
    // Head (large)
    this._head(ctx, w / 2, h * 0.35, w * 0.23, '#FFCC88');
    // White mustache (distinctive wing shape)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.44);
    ctx.quadraticCurveTo(w * 0.28, h * 0.4, w * 0.2, h * 0.42);
    ctx.quadraticCurveTo(w * 0.28, h * 0.47, w * 0.45, h * 0.46);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.65, h * 0.44);
    ctx.quadraticCurveTo(w * 0.72, h * 0.4, w * 0.8, h * 0.42);
    ctx.quadraticCurveTo(w * 0.72, h * 0.47, w * 0.55, h * 0.46);
    ctx.closePath(); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.35, w * 0.05, '#1a1a1a');
    // Naginata weapon
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(w * 0.88, h * 0.15); ctx.lineTo(w * 0.82, h * 0.85); ctx.stroke();
    ctx.fillStyle = '#CCCCCC';
    ctx.beginPath();
    ctx.moveTo(w * 0.88, h * 0.15);
    ctx.lineTo(w * 0.82, h * 0.28);
    ctx.lineTo(w * 0.77, h * 0.2);
    ctx.closePath(); ctx.fill();
    this._nameTag(ctx, 'Whitebeard', w);
  },

  _ace(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0500', '#2a0800');
    // Fire glow bg
    const fireGlow = ctx.createRadialGradient(w / 2, h * 0.6, 0, w / 2, h * 0.6, w * 0.5);
    fireGlow.addColorStop(0, 'rgba(255,100,0,0.4)');
    fireGlow.addColorStop(1, 'rgba(255,50,0,0)');
    ctx.fillStyle = fireGlow;
    ctx.fillRect(0, 0, w, h);
    // Bare chest (no shirt)
    ctx.fillStyle = '#FFAA66';
    ctx.beginPath(); ctx.roundRect(w * 0.28, h * 0.52, w * 0.44, h * 0.35, 4); ctx.fill();
    // Orange bead necklace
    ctx.strokeStyle = '#FF6600';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(w / 2, h * 0.52, w * 0.16, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    // Fire on fist (right)
    const fireG = ctx.createRadialGradient(w * 0.78, h * 0.68, 0, w * 0.78, h * 0.68, 18);
    fireG.addColorStop(0, '#FFFF00');
    fireG.addColorStop(0.4, '#FF6600');
    fireG.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = fireG;
    ctx.beginPath(); ctx.arc(w * 0.78, h * 0.68, 18, 0, Math.PI * 2); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.2, '#FFAA66');
    // Dark hair (short, messy)
    ctx.fillStyle = '#1a0800';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.19, Math.PI * 0.85, Math.PI * 2.15); ctx.fill();
    // Freckles
    ctx.fillStyle = '#CC7744';
    [[0.4, 0.4], [0.44, 0.42], [0.55, 0.41], [0.6, 0.4], [0.38, 0.42]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(w * px, h * py, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    this._eyes(ctx, w / 2, h * 0.365, w * 0.046, '#1a1a1a');
    // Hat (orange cowboy-ish)
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(w * 0.3, h * 0.19, w * 0.4, h * 0.1);
    ctx.fillRect(w * 0.22, h * 0.27, w * 0.56, h * 0.04);
    this._nameTag(ctx, 'Ace', w);
  },

  _hancock(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0020', '#330044');
    // Revealing red outfit
    ctx.fillStyle = '#CC1144';
    ctx.beginPath(); ctx.roundRect(w * 0.32, h * 0.5, w * 0.36, h * 0.4, 4); ctx.fill();
    // Snake accessory on arm
    ctx.strokeStyle = '#33AA33';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(w * 0.22, h * 0.63, 8, 0, Math.PI * 1.8); ctx.stroke();
    ctx.fillStyle = '#33AA33';
    ctx.beginPath(); ctx.arc(w * 0.22, h * 0.56, 4, 0, Math.PI * 2); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.2, '#FFCC99');
    // Long dark hair flowing
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.2, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.3); ctx.quadraticCurveTo(w * 0.18, h * 0.55, w * 0.22, h * 0.82);
    ctx.lineTo(w * 0.3, h * 0.8); ctx.quadraticCurveTo(w * 0.26, h * 0.55, w * 0.38, h * 0.33); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * 0.3); ctx.quadraticCurveTo(w * 0.82, h * 0.55, w * 0.78, h * 0.82);
    ctx.lineTo(w * 0.7, h * 0.8); ctx.quadraticCurveTo(w * 0.74, h * 0.55, w * 0.62, h * 0.33); ctx.closePath(); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.37, w * 0.046, '#440044');
    // Crown
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.21);
    ctx.lineTo(w * 0.38, h * 0.14); ctx.lineTo(w * 0.5, h * 0.18);
    ctx.lineTo(w * 0.62, h * 0.14); ctx.lineTo(w * 0.65, h * 0.21);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FF4444';
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.175, 3, 0, Math.PI * 2); ctx.fill();
    this._nameTag(ctx, 'Hancock', w);
  },

  _crocodile(ctx, w, h) {
    this._bg(ctx, w, h, '#0a0a0a', '#1a1000');
    // Black suit
    ctx.fillStyle = '#111111';
    ctx.beginPath(); ctx.roundRect(w * 0.24, h * 0.5, w * 0.52, h * 0.42, 4); ctx.fill();
    // Fur collar (white)
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath();
    ctx.moveTo(w * 0.28, h * 0.5);
    ctx.quadraticCurveTo(w * 0.5, h * 0.6, w * 0.72, h * 0.5);
    ctx.quadraticCurveTo(w * 0.65, h * 0.56, w * 0.5, h * 0.52);
    ctx.quadraticCurveTo(w * 0.35, h * 0.56, w * 0.28, h * 0.5);
    ctx.closePath(); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.21, '#FFCC88');
    // Black slicked hair
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.2, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(w * 0.3, h * 0.27, w * 0.4, h * 0.09);
    this._eyes(ctx, w / 2, h * 0.36, w * 0.045);
    // Scar on face
    ctx.strokeStyle = '#884444';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.32); ctx.lineTo(w * 0.48, h * 0.44); ctx.stroke();
    // Hook (right hand)
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.72, 12, -Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(w * 0.8, h * 0.64); ctx.lineTo(w * 0.8, h * 0.72); ctx.stroke();
    // Cigar
    ctx.fillStyle = '#CCAA44';
    ctx.fillRect(w * 0.5, h * 0.43, w * 0.14, h * 0.02);
    ctx.fillStyle = '#FF4400';
    ctx.beginPath(); ctx.arc(w * 0.64, h * 0.44, 2, 0, Math.PI * 2); ctx.fill();
    this._nameTag(ctx, 'Crocodile', w);
  },

  _smoker(ctx, w, h) {
    this._bg(ctx, w, h, '#111122', '#0a0a22');
    // White marine coat (worn like cape)
    ctx.fillStyle = '#DDDDDD';
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.48);
    ctx.lineTo(w * 0.08, h * 0.95); ctx.lineTo(w * 0.92, h * 0.95); ctx.lineTo(w * 0.85, h * 0.48);
    ctx.lineTo(w * 0.5, h * 0.55); ctx.closePath(); ctx.fill();
    // Navy shirt
    ctx.fillStyle = '#334488';
    ctx.beginPath(); ctx.roundRect(w * 0.3, h * 0.52, w * 0.4, h * 0.28, 4); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.21, '#DDCCAA');
    // White hair/stubble
    ctx.fillStyle = '#CCCCCC';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.2, Math.PI, Math.PI * 2); ctx.fill();
    // Stubble
    ctx.fillStyle = '#BBBBBB';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.43, w * 0.13, 0, Math.PI); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.36, w * 0.045, '#1a1a1a');
    // Two cigars (both sides of mouth)
    ctx.fillStyle = '#CCAA44';
    ctx.fillRect(w * 0.35, h * 0.435, w * 0.1, h * 0.022);
    ctx.fillRect(w * 0.55, h * 0.435, w * 0.1, h * 0.022);
    ctx.fillStyle = '#FF4400';
    ctx.beginPath(); ctx.arc(w * 0.35, h * 0.446, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.65, h * 0.446, 2, 0, Math.PI * 2); ctx.fill();
    // Smoke wisps
    ctx.strokeStyle = 'rgba(200,200,200,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * 0.35, h * 0.43); ctx.quadraticCurveTo(w * 0.3, h * 0.35, w * 0.32, h * 0.28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.65, h * 0.43); ctx.quadraticCurveTo(w * 0.7, h * 0.35, w * 0.68, h * 0.28); ctx.stroke();
    this._nameTag(ctx, 'Smoker', w);
  },

  _buggy(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0800', '#220a00');
    // Red/white clown costume
    ctx.fillStyle = '#CC2200';
    ctx.beginPath(); ctx.roundRect(w * 0.24, h * 0.52, w * 0.25, h * 0.38, 4); ctx.fill();
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath(); ctx.roundRect(w * 0.49, h * 0.52, w * 0.27, h * 0.38, 4); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.21, '#FFCC88');
    // Blue afro hair
    ctx.fillStyle = '#2244AA';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.25, w * 0.24, Math.PI, Math.PI * 2); ctx.fill();
    // Giant red nose
    ctx.fillStyle = '#FF1111';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.42, w * 0.09, 0, Math.PI * 2); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.36, w * 0.05, '#1a1a1a');
    // Clown makeup
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(w * 0.39, h * 0.36, w * 0.06, w * 0.04, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.61, h * 0.36, w * 0.06, w * 0.04, 0, 0, Math.PI * 2); ctx.fill();
    // Clown hat
    ctx.fillStyle = '#CC2200';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.19);
    ctx.lineTo(w * 0.5, h * 0.02);
    ctx.lineTo(w * 0.65, h * 0.19);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath(); ctx.ellipse(w / 2, h * 0.19, w * 0.18, w * 0.04, 0, 0, Math.PI * 2); ctx.fill();
    this._nameTag(ctx, 'Buggy', w);
  },

  _coby(ctx, w, h) {
    this._bg(ctx, w, h, '#001133', '#002244');
    // White marine uniform
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath(); ctx.roundRect(w * 0.27, h * 0.5, w * 0.46, h * 0.4, 4); ctx.fill();
    // Marine insignia
    ctx.fillStyle = '#4488CC';
    ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('MARINE', w / 2, h * 0.67);
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.2, '#FFCC99');
    // Pink/reddish short hair
    ctx.fillStyle = '#DD5566';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.28, w * 0.19, Math.PI * 0.85, Math.PI * 2.15); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.365, w * 0.044, '#1a1a1a');
    // Round glasses
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w * 0.41, h * 0.365, w * 0.07, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.59, h * 0.365, w * 0.07, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.365); ctx.lineTo(w * 0.52, h * 0.365); ctx.stroke();
    this._nameTag(ctx, 'Coby', w);
  },

  _alvida(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0033', '#220044');
    // Pink dress
    ctx.fillStyle = '#FF66AA';
    ctx.beginPath(); ctx.roundRect(w * 0.24, h * 0.52, w * 0.52, h * 0.42, 4); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.2, '#FFCC99');
    // Long dark hair
    ctx.fillStyle = '#111122';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.2, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.3); ctx.quadraticCurveTo(w * 0.2, h * 0.55, w * 0.24, h * 0.75);
    ctx.lineTo(w * 0.32, h * 0.73); ctx.quadraticCurveTo(w * 0.27, h * 0.55, w * 0.37, h * 0.33); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * 0.3); ctx.quadraticCurveTo(w * 0.8, h * 0.55, w * 0.76, h * 0.75);
    ctx.lineTo(w * 0.68, h * 0.73); ctx.quadraticCurveTo(w * 0.73, h * 0.55, w * 0.63, h * 0.33); ctx.closePath(); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.37, w * 0.046, '#440044');
    // Mace weapon (heavy)
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(w * 0.82, h * 0.55); ctx.lineTo(w * 0.82, h * 0.85); ctx.stroke();
    ctx.fillStyle = '#666666';
    ctx.beginPath(); ctx.arc(w * 0.82, h * 0.55, 10, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.fillStyle = '#888888';
      ctx.beginPath(); ctx.arc(w * 0.82 + Math.cos(a) * 10, h * 0.55 + Math.sin(a) * 10, 4, 0, Math.PI * 2); ctx.fill();
    }
    this._nameTag(ctx, 'Alvida', w);
  },

  _helmeppo(ctx, w, h) {
    this._bg(ctx, w, h, '#001122', '#002233');
    // Marine coat
    ctx.fillStyle = '#DDDDDD';
    ctx.beginPath(); ctx.roundRect(w * 0.26, h * 0.5, w * 0.48, h * 0.42, 4); ctx.fill();
    ctx.fillStyle = '#4488CC';
    ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('MARINE', w / 2, h * 0.66);
    // Head
    this._head(ctx, w / 2, h * 0.36, w * 0.2, '#FFCC88');
    // Slicked blonde hair (swept back)
    ctx.fillStyle = '#CCAA00';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.27, w * 0.19, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#CCAA00';
    ctx.fillRect(w * 0.31, h * 0.27, w * 0.38, h * 0.08);
    this._eyes(ctx, w / 2, h * 0.365, w * 0.045, '#1a1a1a');
    // Twin kukri knives
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w * 0.15, h * 0.55); ctx.lineTo(w * 0.25, h * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.15, h * 0.55); ctx.lineTo(w * 0.2, h * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.85, h * 0.55); ctx.lineTo(w * 0.75, h * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.85, h * 0.55); ctx.lineTo(w * 0.8, h * 0.5); ctx.stroke();
    this._nameTag(ctx, 'Helmeppo', w);
  },

  _luffy_gear4(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0800', '#2a0a00');
    // Orange/red glowing aura
    const aura = ctx.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.6);
    aura.addColorStop(0, 'rgba(255,120,0,0.5)');
    aura.addColorStop(0.6, 'rgba(255,60,0,0.2)');
    aura.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, w, h);
    // Huge muscle-bound body
    ctx.fillStyle = '#CC4400';
    ctx.beginPath(); ctx.roundRect(w * 0.18, h * 0.48, w * 0.64, h * 0.46, 8); ctx.fill();
    // Muscle definition lines
    ctx.strokeStyle = '#AA3300';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w / 2, h * 0.5); ctx.lineTo(w / 2, h * 0.82); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.35, h * 0.62, w * 0.1, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.65, h * 0.62, w * 0.1, 0, Math.PI); ctx.stroke();
    // Head (orange tinted)
    ctx.fillStyle = '#FF9955';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.33, w * 0.22, 0, Math.PI * 2); ctx.fill();
    // Steam effects
    ctx.fillStyle = 'rgba(255,200,100,0.3)';
    [[0.2, 0.4], [0.8, 0.35], [0.5, 0.2]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(w * px, h * py, 12, 0, Math.PI * 2); ctx.fill();
    });
    // Black spiky hair (bigger)
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.25, w * 0.22, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    for (let i = 0; i < 7; i++) {
      const angle = -Math.PI * 0.9 + (i / 6) * Math.PI;
      ctx.beginPath();
      ctx.ellipse(w / 2 + Math.cos(angle) * w * 0.2, h * 0.25 + Math.sin(angle) * w * 0.18, w * 0.07, w * 0.15, angle + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    this._eyes(ctx, w / 2, h * 0.345, w * 0.052, '#FF4400');
    // Straw hat silhouette (halo-like)
    ctx.strokeStyle = '#E8C840';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(w / 2, h * 0.16, w * 0.34, w * 0.07, 0, 0, Math.PI * 2); ctx.stroke();
    this._nameTag(ctx, 'Gear 4 Luffy', w);
  },

  _kaido(ctx, w, h) {
    this._bg(ctx, w, h, '#0a0020', '#150033');
    // Massive dark build
    ctx.fillStyle = '#2a1a44';
    ctx.beginPath(); ctx.roundRect(w * 0.1, h * 0.48, w * 0.8, h * 0.48, 6); ctx.fill();
    // Dragon tattoos (blue)
    ctx.strokeStyle = '#4422CC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.55);
    ctx.quadraticCurveTo(w * 0.15, h * 0.68, w * 0.25, h * 0.78);
    ctx.quadraticCurveTo(w * 0.35, h * 0.85, w * 0.4, h * 0.9);
    ctx.stroke();
    // Head (large)
    this._head(ctx, w / 2, h * 0.34, w * 0.24, '#886644');
    // Long black hair
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.24, w * 0.23, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.26, h * 0.28); ctx.quadraticCurveTo(w * 0.15, h * 0.5, w * 0.18, h * 0.78);
    ctx.lineTo(w * 0.27, h * 0.76); ctx.quadraticCurveTo(w * 0.22, h * 0.5, w * 0.34, h * 0.31); ctx.closePath(); ctx.fill();
    // Dragon horns
    ctx.fillStyle = '#CC8800';
    ctx.beginPath(); ctx.moveTo(w * 0.35, h * 0.17); ctx.lineTo(w * 0.28, h * 0.04); ctx.lineTo(w * 0.4, h * 0.14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.65, h * 0.17); ctx.lineTo(w * 0.72, h * 0.04); ctx.lineTo(w * 0.6, h * 0.14); ctx.closePath(); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.36, w * 0.054, '#CC2200');
    // Oni club
    ctx.fillStyle = '#556644';
    ctx.fillRect(w * 0.82, h * 0.45, w * 0.08, h * 0.44);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#8B6914';
      ctx.beginPath(); ctx.arc(w * 0.86, h * 0.46 + i * h * 0.05, 4, 0, Math.PI * 2); ctx.fill();
    }
    this._nameTag(ctx, 'Kaido', w);
  },

  _big_mom(ctx, w, h) {
    this._bg(ctx, w, h, '#2a0022', '#1a0033');
    // Giant build
    ctx.fillStyle = '#882266';
    ctx.beginPath(); ctx.roundRect(w * 0.08, h * 0.48, w * 0.84, h * 0.48, 6); ctx.fill();
    // Soul eyes (one glowing hand)
    const soulG = ctx.createRadialGradient(w * 0.2, h * 0.72, 0, w * 0.2, h * 0.72, 18);
    soulG.addColorStop(0, '#FFFF00');
    soulG.addColorStop(1, 'rgba(255,255,0,0)');
    ctx.fillStyle = soulG;
    ctx.beginPath(); ctx.arc(w * 0.2, h * 0.72, 18, 0, Math.PI * 2); ctx.fill();
    // Head (large)
    this._head(ctx, w / 2, h * 0.33, w * 0.25, '#FFCC99');
    // Big pink/blonde wavy hair
    ctx.fillStyle = '#FFAACC';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.22, w * 0.28, Math.PI * 0.7, Math.PI * 2.3); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.8 + (i / 4) * Math.PI * 1.6;
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(a) * w * 0.23, h * 0.22 + Math.sin(a) * w * 0.12, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    // Crown
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(w * 0.32, h * 0.12);
    ctx.lineTo(w * 0.36, h * 0.04); ctx.lineTo(w * 0.5, h * 0.09);
    ctx.lineTo(w * 0.64, h * 0.04); ctx.lineTo(w * 0.68, h * 0.12);
    ctx.closePath(); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.36, w * 0.056, '#FF00AA');
    // Glowing soul eyes (white sclera)
    ctx.fillStyle = '#FFFF88';
    ctx.beginPath(); ctx.arc(w * 0.4, h * 0.36, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.6, h * 0.36, 5, 0, Math.PI * 2); ctx.fill();
    this._nameTag(ctx, 'Big Mom', w);
  },

  _roger(ctx, w, h) {
    this._bg(ctx, w, h, '#1a0500', '#2a0800');
    // Red/orange captain coat
    ctx.fillStyle = '#CC3300';
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.5);
    ctx.lineTo(w * 0.1, h * 0.95); ctx.lineTo(w * 0.9, h * 0.95); ctx.lineTo(w * 0.82, h * 0.5);
    ctx.lineTo(w * 0.5, h * 0.56); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#AA2200';
    ctx.beginPath(); ctx.roundRect(w * 0.28, h * 0.5, w * 0.44, h * 0.3, 4); ctx.fill();
    // Head
    this._head(ctx, w / 2, h * 0.35, w * 0.22, '#FFBB77');
    // Dark hair and large mustache
    ctx.fillStyle = '#1a1000';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.26, w * 0.21, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    // Mustache
    ctx.fillStyle = '#2a1a00';
    ctx.beginPath();
    ctx.moveTo(w * 0.36, h * 0.43);
    ctx.quadraticCurveTo(w * 0.28, h * 0.38, w * 0.25, h * 0.42);
    ctx.quadraticCurveTo(w * 0.28, h * 0.46, w * 0.44, h * 0.45);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.64, h * 0.43);
    ctx.quadraticCurveTo(w * 0.72, h * 0.38, w * 0.75, h * 0.42);
    ctx.quadraticCurveTo(w * 0.72, h * 0.46, w * 0.56, h * 0.45);
    ctx.closePath(); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.36, w * 0.05, '#1a1a1a');
    // Pirate King Hat
    ctx.fillStyle = '#CC3300';
    ctx.fillRect(w * 0.28, h * 0.16, w * 0.44, h * 0.12);
    ctx.fillRect(w * 0.2, h * 0.26, w * 0.6, h * 0.04);
    // Gold skull on hat
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 11px serif'; ctx.textAlign = 'center';
    ctx.fillText('☠', w / 2, h * 0.245);
    this._nameTag(ctx, 'Roger', w);
  },

  _joyboy(ctx, w, h) {
    this._bg(ctx, w, h, '#000a1a', '#001a33');
    // Mystical blue glow aura
    const joyGlow = ctx.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.7);
    joyGlow.addColorStop(0, 'rgba(0,150,255,0.5)');
    joyGlow.addColorStop(0.5, 'rgba(0,80,255,0.2)');
    joyGlow.addColorStop(1, 'rgba(0,0,255,0)');
    ctx.fillStyle = joyGlow;
    ctx.fillRect(0, 0, w, h);
    // Celestial body (flowing robes, blue-white)
    ctx.fillStyle = '#AADDFF';
    ctx.beginPath(); ctx.roundRect(w * 0.2, h * 0.5, w * 0.6, h * 0.44, 6); ctx.fill();
    // Ancient symbols on robe
    ctx.fillStyle = '#0055CC';
    ctx.font = '10px serif'; ctx.textAlign = 'center';
    ctx.fillText('☯', w * 0.35, h * 0.68);
    ctx.fillText('☀', w * 0.65, h * 0.65);
    // Head (glowing)
    ctx.fillStyle = '#DDEEFF';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.34, w * 0.22, 0, Math.PI * 2); ctx.fill();
    // Glowing halo
    ctx.strokeStyle = 'rgba(100,200,255,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(w / 2, h * 0.28, w * 0.27, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(100,200,255,0.4)';
    ctx.lineWidth = 6;
    ctx.stroke();
    // Flowing white hair
    ctx.fillStyle = '#EEEEFF';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.24, w * 0.21, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.29, h * 0.28); ctx.quadraticCurveTo(w * 0.18, h * 0.5, w * 0.2, h * 0.76);
    ctx.lineTo(w * 0.28, h * 0.74); ctx.quadraticCurveTo(w * 0.24, h * 0.5, w * 0.36, h * 0.31); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.71, h * 0.28); ctx.quadraticCurveTo(w * 0.82, h * 0.5, w * 0.8, h * 0.76);
    ctx.lineTo(w * 0.72, h * 0.74); ctx.quadraticCurveTo(w * 0.76, h * 0.5, w * 0.64, h * 0.31); ctx.closePath(); ctx.fill();
    this._eyes(ctx, w / 2, h * 0.36, w * 0.052, '#0044AA');
    // Eye glow
    ctx.fillStyle = 'rgba(0,150,255,0.6)';
    ctx.beginPath(); ctx.arc(w * 0.41, h * 0.365, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.59, h * 0.365, 4, 0, Math.PI * 2); ctx.fill();
    // Sun symbol
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px serif'; ctx.textAlign = 'center';
    ctx.fillText('☀', w / 2, h * 0.9);
    this._nameTag(ctx, 'Joy Boy', w);
  },

};
