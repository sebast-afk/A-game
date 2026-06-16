import * as THREE from 'three';
import { resolveCollisions } from './Physics.js';

export class Player {
  constructor(scene, username, color = '#e63946') {
    this.scene    = scene;
    this.username = username;
    this.color    = color;

    this.position   = new THREE.Vector3(0, 2, 0);
    this.velocity   = new THREE.Vector3(0, 0, 0);
    this.isGrounded = false;

    this.speed     = 8;
    this.jumpForce = 13;
    this.gravity   = -28;

    this.spawnPoint = new THREE.Vector3(0, 2, 0);

    // Camera orbit
    this.camTheta = 0;
    this.camPhi   = Math.PI / 3;
    this.camDist  = 8;

    // Animation
    this._walkTime = 0;

    this._buildMesh(color);
    this._buildNametag(username);
    scene.add(this.mesh);
  }

  // ─── Mesh Construction ────────────────────────────────────────────────────

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

    // Legs (pants colour)
    this.rightLeg = mkBox(0.35, 0.8, 0.35, pantMat);
    this.rightLeg.position.set(0.2, 0.4, 0);
    this.leftLeg  = mkBox(0.35, 0.8, 0.35, pantMat);
    this.leftLeg.position.set(-0.2, 0.4, 0);

    // Body
    this.body = mkBox(0.75, 0.9, 0.4, mat);
    this.body.position.set(0, 1.05, 0);

    // Arms (pivot groups so we can rotate from shoulder)
    this.armRGroup = new THREE.Group();
    this.armRGroup.position.set(0.525, 1.45, 0);
    this.rightArm  = mkBox(0.3, 0.85, 0.3, mat);
    this.rightArm.position.set(0, -0.425, 0);
    this.armRGroup.add(this.rightArm);

    this.armLGroup = new THREE.Group();
    this.armLGroup.position.set(-0.525, 1.45, 0);
    this.leftArm   = mkBox(0.3, 0.85, 0.3, mat);
    this.leftArm.position.set(0, -0.425, 0);
    this.armLGroup.add(this.leftArm);

    // Head
    this.head = mkBox(0.65, 0.65, 0.65, skinMat);
    this.head.position.set(0, 1.775, 0);

    // Eyes
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

  update(dt, input, camera, collidables) {
    // 1. Read input axes
    let moveX = (input.right - input.left) + input.joyX;
    let moveZ = (input.back  - input.forward) + input.joyY;
    const mag = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (mag > 1) { moveX /= mag; moveZ /= mag; }

    const moving = mag > 0.05;

    // 2. Apply horizontal movement
    if (moving) {
      const angle = this.camTheta + Math.atan2(moveX, moveZ);
      this.velocity.x = Math.sin(angle) * this.speed;
      this.velocity.z = Math.cos(angle) * this.speed;
      // Face movement direction
      this.mesh.rotation.y = angle;
    } else {
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;
    }

    // 3. Jump
    if ((input.jump || input.mobileJump) && this.isGrounded) {
      this.velocity.y  = this.jumpForce;
      this.isGrounded  = false;
      input.consumeJump();
    } else {
      input.consumeJump && input.mobileJump && input.consumeJump();
    }

    // 4. Gravity
    this.velocity.y += this.gravity * dt;

    // 5. Integrate position
    const newPos = this.position.clone().addScaledVector(this.velocity, dt);

    // 6. Collisions
    this.isGrounded = resolveCollisions(newPos, this.velocity, collidables);

    // 7. Apply
    this.position.copy(newPos);
    this.mesh.position.copy(this.position);

    // 8. Fall respawn
    if (this.position.y < -30) this.respawn();

    // 9. Walking animation
    if (moving && this.isGrounded) {
      this._walkTime += dt * 10;
      const swing = Math.sin(this._walkTime) * 0.5;
      this.armRGroup.rotation.x  =  swing;
      this.armLGroup.rotation.x  = -swing;
      this.rightLeg.rotation.x   = -swing;
      this.leftLeg.rotation.x    =  swing;
    } else {
      this._walkTime = 0;
      this.armRGroup.rotation.x  = 0;
      this.armLGroup.rotation.x  = 0;
      this.rightLeg.rotation.x   = 0;
      this.leftLeg.rotation.x    = 0;
    }

    // 10. Camera
    this.camTheta -= input.lookDX;
    this.camPhi    = Math.max(0.15, Math.min(1.3, this.camPhi + input.lookDY));
    input.lookDX   = 0;
    input.lookDY   = 0;

    const target = this.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const sp  = Math.sin(this.camPhi);
    const cp  = Math.cos(this.camPhi);
    const st  = Math.sin(this.camTheta);
    const ct  = Math.cos(this.camTheta);
    camera.position.set(
      target.x + sp * st * this.camDist,
      target.y + cp * this.camDist,
      target.z + sp * ct * this.camDist
    );
    camera.lookAt(target);
  }

  respawn() {
    this.position.copy(this.spawnPoint).add(new THREE.Vector3(0, 2, 0));
    this.velocity.set(0, 0, 0);
  }

  setSpawn(x, y, z) {
    this.spawnPoint.set(x, y, z);
  }

  destroy() {
    this.scene.remove(this.mesh);
  }
}
