import * as THREE from 'three';

export class RemotePlayer {
  constructor(scene, data) {
    this.scene  = scene;
    this.id     = data.id;

    this.targetPos = new THREE.Vector3(data.x || 0, data.y || 0, data.z || 0);
    this.targetRotY = data.rotY || 0;

    this._buildMesh(data.color || '#888888');
    this._buildNametag(data.username || 'Player');

    this.mesh.position.copy(this.targetPos);
    this.mesh.rotation.y = this.targetRotY;

    // Walk animation
    this._walkTime = 0;

    scene.add(this.mesh);
  }

  // ─── Mesh ─────────────────────────────────────────────────────────────────

  _buildMesh(color) {
    this.mesh = new THREE.Group();

    const mat    = new THREE.MeshLambertMaterial({ color });
    const skinMat= new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const pantMat= new THREE.MeshLambertMaterial({ color: 0x3355bb });

    const mkBox = (w, h, d, mat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      return m;
    };

    this.rightLeg = mkBox(0.35, 0.8, 0.35, pantMat);
    this.rightLeg.position.set(0.2, 0.4, 0);
    this.leftLeg  = mkBox(0.35, 0.8, 0.35, pantMat);
    this.leftLeg.position.set(-0.2, 0.4, 0);

    this.body = mkBox(0.75, 0.9, 0.4, mat);
    this.body.position.set(0, 1.05, 0);

    this.armRGroup = new THREE.Group();
    this.armRGroup.position.set(0.525, 1.45, 0);
    const rightArm = mkBox(0.3, 0.85, 0.3, mat);
    rightArm.position.set(0, -0.425, 0);
    this.armRGroup.add(rightArm);

    this.armLGroup = new THREE.Group();
    this.armLGroup.position.set(-0.525, 1.45, 0);
    const leftArm = mkBox(0.3, 0.85, 0.3, mat);
    leftArm.position.set(0, -0.425, 0);
    this.armLGroup.add(leftArm);

    this.head = mkBox(0.65, 0.65, 0.65, skinMat);
    this.head.position.set(0, 1.775, 0);

    const leftEye  = mkBox(0.1, 0.1, 0.05, eyeMat);
    leftEye.position.set(-0.17, 1.82, 0.33);
    const rightEye = mkBox(0.1, 0.1, 0.05, eyeMat);
    rightEye.position.set(0.17, 1.82, 0.33);

    this.mesh.add(
      this.rightLeg, this.leftLeg,
      this.body,
      this.armRGroup, this.armLGroup,
      this.head,
      leftEye, rightEye
    );
  }

  _buildNametag(username) {
    const canvas = document.createElement('canvas');
    canvas.width  = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.roundRect(4, 4, 248, 56, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(username, 128, 32);

    const tex     = new THREE.CanvasTexture(canvas);
    const mat     = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    this.nametag  = new THREE.Sprite(mat);
    this.nametag.scale.set(2, 0.5, 1);
    this.nametag.position.set(0, 2.4, 0);
    this.mesh.add(this.nametag);
  }

  // ─── Per-frame Update ─────────────────────────────────────────────────────

  setTarget(x, y, z, rotY) {
    this.targetPos.set(x, y, z);
    this.targetRotY = rotY;
  }

  update(dt) {
    const LERP = 0.2;
    const prev = this.mesh.position.clone();
    this.mesh.position.lerp(this.targetPos, LERP);

    // Angle lerp
    let dAngle = this.targetRotY - this.mesh.rotation.y;
    while (dAngle >  Math.PI) dAngle -= Math.PI * 2;
    while (dAngle < -Math.PI) dAngle += Math.PI * 2;
    this.mesh.rotation.y += dAngle * LERP;

    // Walk animation based on movement speed
    const speed = this.mesh.position.distanceTo(prev) / dt;
    if (speed > 0.5) {
      this._walkTime += dt * 10;
      const swing = Math.sin(this._walkTime) * 0.5;
      this.armRGroup.rotation.x  =  swing;
      this.armLGroup.rotation.x  = -swing;
      this.rightLeg.rotation.x   = -swing;
      this.leftLeg.rotation.x    =  swing;
    } else {
      this._walkTime = 0;
      this.armRGroup.rotation.x = 0;
      this.armLGroup.rotation.x = 0;
      this.rightLeg.rotation.x  = 0;
      this.leftLeg.rotation.x   = 0;
    }
  }

  destroy() {
    this.scene.remove(this.mesh);
  }
}
