import * as THREE from 'three';

const _box       = new THREE.Box3();
const _playerBox = new THREE.Box3();

/**
 * Resolve collisions between the player AABB and an array of collidable meshes.
 * Modifies newPos and velocity in place.
 * Returns true if the player is grounded.
 */
export function resolveCollisions(newPos, velocity, collidables) {
  const RADIUS = 0.38;
  const HEIGHT = 2.2;
  let grounded = false;

  for (const obj of collidables) {
    if (!obj.visible) continue;

    _box.setFromObject(obj);

    const pMin = new THREE.Vector3(newPos.x - RADIUS, newPos.y,          newPos.z - RADIUS);
    const pMax = new THREE.Vector3(newPos.x + RADIUS, newPos.y + HEIGHT, newPos.z + RADIUS);
    _playerBox.set(pMin, pMax);

    if (!_playerBox.intersectsBox(_box)) continue;

    const overlapX = Math.min(pMax.x - _box.min.x, _box.max.x - pMin.x);
    const overlapY = Math.min(pMax.y - _box.min.y, _box.max.y - pMin.y);
    const overlapZ = Math.min(pMax.z - _box.min.z, _box.max.z - pMin.z);

    if (overlapY <= overlapX && overlapY <= overlapZ) {
      const playerCenterY = newPos.y + HEIGHT / 2;
      const platCenterY   = (_box.min.y + _box.max.y) / 2;

      if (playerCenterY < platCenterY) {
        // Landing on top of platform
        newPos.y = _box.max.y;
        if (velocity.y < 0) velocity.y = 0;
        grounded = true;

        // Carry player with moving platform
        if (obj.userData.velocity) {
          newPos.x += obj.userData.velocity.x;
          newPos.z += obj.userData.velocity.z;
        }
      } else {
        // Hitting ceiling
        newPos.y = _box.min.y - HEIGHT;
        if (velocity.y > 0) velocity.y = 0;
      }
    } else if (overlapX <= overlapZ) {
      const platCX = (_box.min.x + _box.max.x) / 2;
      if (newPos.x < platCX) newPos.x = _box.min.x - RADIUS;
      else                   newPos.x = _box.max.x + RADIUS;
      velocity.x = 0;
    } else {
      const platCZ = (_box.min.z + _box.max.z) / 2;
      if (newPos.z < platCZ) newPos.z = _box.min.z - RADIUS;
      else                   newPos.z = _box.max.z + RADIUS;
      velocity.z = 0;
    }
  }

  return grounded;
}
