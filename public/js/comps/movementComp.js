import Vector2d from '../ecs/util/vector2d.js';

export default class MovementComp {
  constructor({
    spd = 0.4,
    smoothness = 0.01,
    dir = Vector2d.zero,
    targetDir = Vector2d.zero,
    rotSpeed = 0.004,
    rotSmoothness = 0.02,
    rot = 0,
    targetRot = 0,
  } = {}) {
    this.spd = spd;
    this.smoothness = smoothness;
    this.dir = dir;
    this.targetDir = targetDir;
    this.rotSpeed = rotSpeed;
    this.rotSmoothness = rotSmoothness;
    this.rot = rot;
    this.targetRot = targetRot;
  }
}
