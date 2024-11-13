import Matrix3x3 from '../util/matrix3x3.js';
import Vector2d from '../util/vector2d.js';

export default class Sprite {
  /**
   * @param {Object} options
   * @param {CanvasImageSource} [options.img]
   * @param {number} [options.width]
   * @param {number} [options.height]
   * @param {[number, number]} [options.offpos]
   * @param {number} [options.offrot]
   */
  constructor({
    img = undefined,
    width = 25,
    height = 25,
    offpos = [0, 0],
    offrot = 1.5708,
  }) {
    /** @type {CanvasImageSource | undefined} */
    this.img = img;

    /** @type {number} */
    this.width = width;
    /** @type {number} */
    this.height = height;

    /** @type {Vector2d} */
    this.offpos = new Vector2d(...offpos);

    /**
     * Rotation in radians.
     *
     * @type {number}
     */
    this.offrot = offrot;
  }

  getOffsetTransformationMatrix() {
    return Matrix3x3.createTRS(this.offpos, this.offrot, Vector2d.one);
  }
}
