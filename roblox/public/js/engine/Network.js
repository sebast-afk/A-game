export class Network {
  constructor() {
    this.socket       = null;
    this._lastMove    = 0;
    this._moveThrottle= 50; // ms
  }

  connect(username, game) {
    // window.io() is provided by the socket.io CDN script
    this.socket = window.io();
    this.socket.emit('join', { username, game });
  }

  sendMove(x, y, z, rotY) {
    const now = Date.now();
    if (now - this._lastMove < this._moveThrottle) return;
    this._lastMove = now;
    this.socket.emit('move', { x, y, z, rotY });
  }

  on(event, cb) {
    if (!this.socket) return;
    this.socket.on(event, cb);
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
