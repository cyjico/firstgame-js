import Matrix3x3 from '../math/matrix3x3.js';
import Vector2d from '../math/vector2d.js';

export default class Sprite {
  /**
   * @param {Object} options
   * @param {HTMLImageElement} [options.image]
   * @param {number} [options.width]
   * @param {number} [options.height]
   * @param {[number, number]} [options.pos]
   * @param {number} [options.rot]
   */
  constructor({
    image = undefined,
    width = 25,
    height = 25,
    pos = [0, 0],
    rot = 1.5708,
  }) {
    /** @type {HTMLImageElement | undefined} */
    this.image = image;

    /** @type {number} */
    this.width = width;
    /** @type {number} */
    this.height = height;

    /** @type {Vector2d} */
    this.pos = new Vector2d(pos[0], pos[1]);

    /**
     * Rotation in radians.
     *
     * @type {number}
     */
    this.rot = rot;
  }

  getLocalToWorldMatrix() {
    return Matrix3x3.createTRS(this.pos, this.rot, Vector2d.one);
  }
}
