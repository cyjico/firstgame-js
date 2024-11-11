import Matrix3x3 from '../math/matrix3x3.js';
import Vector2d from '../math/vector2d.js';

export default class Transform2d {
  constructor(pos = [0, 0], rot = 0, scl = [1, 1]) {
    /**
     * @type {Vector2d}
     */
    this.pos = new Vector2d(pos[0], pos[1]);
    /**
     * Rotation in radians.
     *
     * @type {number}
     */
    this.rot = rot;
    /**
     * @type {Vector2d}
     */
    this.scl = new Vector2d(scl[0], scl[1]);
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
