import Vector2d from '../ecs/util/vector2d.js';

export default class MovementComp {
  constructor({
    spd = 0.4,
    smoothness = 0.01,
    dir: dirDelta = Vector2d.zero,
    targetDir = Vector2d.zero,
    rotSpeed = 0.004,
    rotSmoothness = 0.04,
    rot: rotDelta = 0,
    targetRot = 0,
  } = {}) {
    this.spd = spd;
    this.smoothness = smoothness;
    this.targetDir = targetDir;
    this._dirDelta = dirDelta;

    this.rotSpeed = rotSpeed;
    this.rotSmoothness = rotSmoothness;
    this.targetRot = targetRot;
    this._rotDelta = rotDelta;
  }
}
