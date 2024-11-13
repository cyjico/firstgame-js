import Polygon2d from './polygon2d.js';

export const CollisionState = {
  NONE: 1,
  ENTER: 2,
  COLLIDING: 4,
  EXIT: 8,
  WIDE_COLLIDING: 2 | 4 | 8,
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
 * @prop {import('../util/vector2d.js').default | null} mtv Minimum translation vector relative to self.
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
   * @param {import("./polygon2d.js").Vertex[]} verts
   * @param {Object} [opts] Skips procssing and assigns the properties directly.
   * @param {import('./polygon2d.js').Edge[]} [opts.edges] Edges of the vertices.
   * @param {import('./polygon2d.js').Bounds2d} [opts.oobb] Object-oriented bounds of the vertices.
   * @param {number} [opts.layer] Collision layer. It defaults to 1.
   * @param {number} [opts.mask] Collision mask. It defaults to 1.
   * @param {boolean} [opts.phantom] Doesn't register a physical reaction with other colliders.
   */
  constructor(
    verts,
    {
      edges = undefined,
      oobb = undefined,
      layer = 0b1,
      mask = 0b1,
      phantom = false,
    } = {},
  ) {
    super(verts, { edges, oobb });

    this.rules = {
      layer,
      mask,
      phantom,
    };
  }

  /**
   * @param {[number, number][]} verts Array of 2-long number arrays defining the polygon.
   * @param {boolean} [forceClockwise=true]
   */
  static fromArray(verts, forceClockwise = true) {
    const x = Polygon2d.fromArray(verts, forceClockwise);
    return new Polygon2dCollider(x.verts, {
      edges: x.edges,
      oobb: x.oobb,
    });
  }

  /**
   * Assumes the polygon is anchored at its centre.
   *
   * @param {number} width
   * @param {number} height
   */
  static fromRect(width, height) {
    const x = Polygon2d.fromRect(width, height);
    return new Polygon2dCollider(x.verts, {
      edges: x.edges,
      oobb: x.oobb,
    });
  }
}
