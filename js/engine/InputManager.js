export class InputManager {
  constructor() {
    // Keyboard state
    this._keys = {};

    // Derived per-frame booleans
    this.forward = 0; this.back = 0; this.left = 0; this.right = 0;
    this.jump    = false;
    this.interact = false;

    // Mouse / touch look deltas (reset each frame after Player reads them)
    this.lookDX = 0; this.lookDY = 0;

    // Mobile joystick
    this.joyX = 0; this.joyY = 0;
    this.mobileJump = false;

    // Internal tracking
    this._mouseDown = false;
    this._lastMouseX = 0; this._lastMouseY = 0;

    // Touch tracking for camera drag (right side)
    this._camTouchId  = null;
    this._camTouchLast = { x: 0, y: 0 };

    // Joystick touch
    this._joyTouchId    = null;
    this._joyOrigin     = { x: 0, y: 0 };
    this._joyZoneEl     = document.getElementById('joystick-zone');
    this._joyBgEl       = document.getElementById('joystick-bg');
    this._joyDotEl      = document.getElementById('joystick-dot');

    // Jump button
    this._jumpBtnEl     = document.getElementById('mobile-jump');

    this._bindKeyboard();
    this._bindMouse();
    this._bindTouch();
    this._bindJumpBtn();
  }

  // ─── Keyboard ─────────────────────────────────────────────────────────────

  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      this._keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this._keys[e.code] = false;
    });
  }

  // ─── Mouse ────────────────────────────────────────────────────────────────

  _bindMouse() {
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('mousedown', e => {
      if (e.button === 0 || e.button === 2) {
        this._mouseDown = true;
        this._lastMouseX = e.clientX;
        this._lastMouseY = e.clientY;
      }
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 0 || e.button === 2) this._mouseDown = false;
    });
    window.addEventListener('mousemove', e => {
      if (!this._mouseDown) return;
      this.lookDX += (e.clientX - this._lastMouseX) * 0.004;
      this.lookDY += (e.clientY - this._lastMouseY) * 0.004;
      this._lastMouseX = e.clientX;
      this._lastMouseY = e.clientY;
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  // ─── Touch ────────────────────────────────────────────────────────────────

  _bindTouch() {
    const canvas = document.getElementById('game-canvas');
    const joyZone = this._joyZoneEl;
    const JOY_RADIUS = 55; // px

    const isJoyZone = (x, y) => {
      const rect = joyZone.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (this._joyTouchId === null && isJoyZone(t.clientX, t.clientY)) {
          this._joyTouchId = t.identifier;
          this._joyOrigin  = { x: t.clientX, y: t.clientY };
          // Position bg at touch point
          const rect = joyZone.getBoundingClientRect();
          this._joyBgEl.style.left = (t.clientX - rect.left - 55) + 'px';
          this._joyBgEl.style.top  = (t.clientY - rect.top  - 55) + 'px';
          this._joyBgEl.classList.add('active');
          this._joyDotEl.style.left = '32px';
          this._joyDotEl.style.top  = '32px';
        } else if (this._camTouchId === null) {
          this._camTouchId   = t.identifier;
          this._camTouchLast = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this._joyTouchId) {
          const dx = t.clientX - this._joyOrigin.x;
          const dy = t.clientY - this._joyOrigin.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const clamped = Math.min(dist, JOY_RADIUS);
          const angle = Math.atan2(dy, dx);
          this.joyX =  Math.cos(angle) * (clamped / JOY_RADIUS);
          this.joyY =  Math.sin(angle) * (clamped / JOY_RADIUS);
          // Move dot
          const dotX = Math.cos(angle) * clamped;
          const dotY = Math.sin(angle) * clamped;
          this._joyDotEl.style.left = (55 + dotX - 23) + 'px';
          this._joyDotEl.style.top  = (55 + dotY - 23) + 'px';
        } else if (t.identifier === this._camTouchId) {
          this.lookDX += (t.clientX - this._camTouchLast.x) * 0.004;
          this.lookDY += (t.clientY - this._camTouchLast.y) * 0.004;
          this._camTouchLast = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: false });

    const endTouch = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === this._joyTouchId) {
          this._joyTouchId = null;
          this.joyX = 0; this.joyY = 0;
          this._joyBgEl.classList.remove('active');
        }
        if (t.identifier === this._camTouchId) {
          this._camTouchId = null;
        }
      }
    };
    canvas.addEventListener('touchend',    endTouch, { passive: false });
    canvas.addEventListener('touchcancel', endTouch, { passive: false });
  }

  // ─── Jump button ──────────────────────────────────────────────────────────

  _bindJumpBtn() {
    if (!this._jumpBtnEl) return;
    this._jumpBtnEl.addEventListener('touchstart', e => {
      e.preventDefault();
      this.mobileJump = true;
    }, { passive: false });
  }

  // ─── Per-frame update ─────────────────────────────────────────────────────

  update() {
    this.forward = (this._keys['KeyW'] || this._keys['ArrowUp'])    ? 1 : 0;
    this.back    = (this._keys['KeyS'] || this._keys['ArrowDown'])  ? 1 : 0;
    this.left    = (this._keys['KeyA'] || this._keys['ArrowLeft'])  ? 1 : 0;
    this.right   = (this._keys['KeyD'] || this._keys['ArrowRight']) ? 1 : 0;

    // Jump: consume on read in Player, but set it here from key
    if (this._keys['Space'] && !this._jumpKeyConsumed) {
      this.jump = true;
      this._jumpKeyConsumed = true;
    }
    if (!this._keys['Space']) this._jumpKeyConsumed = false;

    // Interact (E key) — set each frame; Player resets after consuming
    if (this._keys['KeyE'] && !this._interactConsumed) {
      this.interact = true;
      this._interactConsumed = true;
    }
    if (!this._keys['KeyE']) this._interactConsumed = false;
  }

  // Called by Player after consuming jump
  consumeJump()    { this.jump = false; this.mobileJump = false; }
  // Called by Player after consuming interact
  consumeInteract() { this.interact = false; }
}
