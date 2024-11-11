import Polygon2d from './polygon2d.js';

export const CollisionState = {
  NONE: 1,
  ENTER: 2,
  COLLIDING: 4,
  EXIT: 8,
  WCOLLIDING: 2 | 4 | 8,
  /** @param {number} num  */
  toString(num) {
    const val = [];

    if (num & 1) val.push('NONE');
    if (num & 2) val.push('ENTER');
    if (num & 4) val.push('COLLIDING');
    if (num & 8) val.push('EXIT');

    return val.join(' & ');
  },
};

/**
 * @typedef {Object} CollisionInfo
 * @prop {import('../math/vector2d.js').default | null} mtv Minimum translation vector relative to self.
 * @prop {number | null} self
 * @prop {number | null} other
 */

export default class Polygon2dCollider extends Polygon2d {
  prevColState = CollisionState.NONE;
  curColState = CollisionState.NONE;

  /** @type {CollisionInfo} */
  curColInfo = {
    mtv: null,
    self: null,
    other: null,
  };

  /**
   * @param {readonly import('./polygon2d.js').Vertex[]} verts
   */
  constructor(verts) {
    super(verts);
  }

  /**
   * @param {[number, number][]} verts Array of 2-long number arrays defining the polygon.
   * @param {boolean} [forceClockwise=true]
   */
  static fromArray(verts, forceClockwise = true) {
    return new Polygon2dCollider(
      Polygon2d.fromArray(verts, forceClockwise).verts,
    );
  }

  /**
   * Assumes the polygon is anchored at its centre.
   *
   * @param {number} width
   * @param {number} height
   */
  static fromRect(width, height) {
    return new Polygon2dCollider(Polygon2d.fromRect(width, height).verts);
  }
}
