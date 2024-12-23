import { wrap } from '../util/mathplus.js';
import Matrix3x3 from '../util/matrix3x3.js';
import Vector2d from '../util/vector2d.js';

export default class Transform {
  /**
   * Rotation in radians.
   *
   * @protected
   * @type {number}
   */
  _rot = 0;

  constructor(pos = [0, 0], rot = 0, scl = [1, 1]) {
    /**
     * @type {Vector2d}
     */
    this.pos = new Vector2d(pos[0], pos[1]);
    this.rot = rot;
    /**
     * @type {Vector2d}
     */
    this.scl = new Vector2d(scl[0], scl[1]);
  }

  get rot() {
    return this._rot;
  }

  set rot(value) {
    this._rot = wrap(value, -Math.PI, Math.PI);
  }

  /**
   * Matrix that transforms a point from local space into world space.
   */
  getLocalToWorldMatrix() {
    return Matrix3x3.createTRS(this.pos, this.rot, this.scl);
  }

  /**
   * Matrix that transforms a point from world space into local space.
   */
  getWorldToLocalMatrix() {
    return this.getLocalToWorldMatrix().inverse;
  }
}
