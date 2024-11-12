import Vector2d from '../util/vector2d.js';
import { getPolygonBounds, isPolygonClockwse } from './polygon2d.util.js';

/**
 * Represents a simple (clockwise) polygon whose vertices are in local/model space.
 */
export default class Polygon2d {
  /**
   * @protected
   * @type {Vertex[]}
   */
  _verts = [];

  /**
   * Also known as the "untransformed" minimum bounding box (OOBB).
   *
   * @protected
   * @type {Bounds2d}
   */
  _localOobb = {
    max: Vector2d.zero,
    min: Vector2d.zero,
  };

  /**
   * @param {Vertex[]} verts
   * @throws `verts` must be greater or equal to 3.
   */
  constructor(verts) {
    if (verts.length < 3)
      throw new RangeError('Polygon cannot have less than 3 vertices.');

    if (!verts[0].vnext || !verts[0].vprev) throw new TypeError('Not a vertex');

    this._verts = verts;
    this._localOobb = getPolygonBounds(this._verts);
  }

  /**
   * @type {Vertex[]}
   */
  get verts() {
    return this._verts;
  }

  /**
   * @returns {EdgeList}
   */
  edges() {
    const that = this;

    return {
      *[Symbol.iterator]() {
        for (let i = 0; i < that.verts.length; i++) yield this.get(i);
      },
      /**
       * Get edge at the specified index.
       *
       * @param {number} index
       * @returns {Readonly<Edge>}
       */
      get: (index) => {
        return {
          start: this._verts[index],
          end: this._verts[index].vnext,
          calcNormal: () => {
            const dir = this._verts[index].vnext
              .clone()
              .sub(this._verts[index])
              .normalized();
            return new Vector2d(-dir.y, dir.x);
          },
        };
      },
      /** @type {Readonly<number>} */
      length: this.verts.length,
    };
  }

  /**
   * @type {Readonly<Bounds2d>}
   */
  get localOobb() {
    return this._localOobb;
  }

  /**
   * @param {import('./transform2d.js').default} t
   * @returns {import('./polygon2d.js').Bounds2d} Transformed object-aligned bounding box.
   */
  calcGlobalOobb(t) {
    const mat = t.getLocalToWorldMatrix();

    return {
      min: mat.multiplyVector2(this._localOobb.min),
      max: mat.multiplyVector2(this._localOobb.max),
    };
  }

  /**
   * @param {import('./transform2d.js').default} t
   * @returns {import('./polygon2d.js').Bounds2d} Axis-aligned bounding box.
   */
  calcAabb(t) {
    const mat = t.getLocalToWorldMatrix();
    const min = Vector2d.positiveInfinity;
    const max = Vector2d.negativeInfinity;

    for (let i = 0; i < 2; i++) {
      const px = this.localOobb[i === 0 ? 'max' : 'min'].x;

      for (let j = 0; j < 2; j++) {
        const py = this.localOobb[j === 0 ? 'max' : 'min'].y;

        const p = mat.multiplyVector2(new Vector2d(px, py));
        if (p.x < min.x) min.x = p.x;
        if (p.x > max.x) max.x = p.x;
        if (p.y < min.y) min.y = p.y;
        if (p.y > max.y) max.y = p.y;
      }
    }

    return { min, max };
  }

  /**
   * @param {import('./transform2d.js').default} t
   * @returns {TransformedPolygon2d}
   */
  calcTransformed(t) {
    const m = t.getLocalToWorldMatrix();

    /**
     * @type {Vertex[]}
     */
    const nverts = [];
    for (let i = 0; i < this._verts.length; i++) {
      nverts.push(
        // @ts-ignore vprev and vnext will be NOT NULL once the loop ends.
        Object.assign(m.multiplyVector2(this._verts[i]), {
          vnext: null,
          vprev: null,
        }),
      );

      if (i > 0) {
        // Set previous vertex's next and current vertex's previous.
        nverts[i - 1].vnext = nverts[i];
        nverts[i].vprev = nverts[i - 1];
      }
    }
    nverts[nverts.length - 1].vnext = nverts[0];
    nverts[0].vprev = nverts[nverts.length - 1];

    const poly = new Polygon2d(nverts);
    return {
      verts: poly._verts,
      edges: poly.edges(),
      aabb: poly._localOobb,
      calcOobb: () => this.calcGlobalOobb(t),
    };
  }

  /**
   * @param {[number, number][]} verts Array of 2-long number arrays defining the polygon.
   * @param {boolean} [forceClockwise=true]
   */
  static fromArray(verts, forceClockwise = true) {
    if (verts.length < 3)
      throw new RangeError('Polygon cannot have less than 3 vertices.');

    if (forceClockwise && !isPolygonClockwse(verts)) verts.reverse();

    /** @type {Vertex[]} */
    const nverts = [];
    for (let i = 0; i < verts.length; i++) {
      nverts.push(
        // @ts-ignore vprev and vnext will be NOT NULL once the loop ends.
        Object.assign(new Vector2d(verts[i][0], verts[i][1]), {
          vnext: null,
          vprev: null,
        }),
      );

      if (i > 0) {
        // Set previous vertex's next and current vertex's previous.
        nverts[i - 1].vnext = nverts[i];
        nverts[i].vprev = nverts[i - 1];
      }
    }
    nverts[nverts.length - 1].vnext = nverts[0];
    nverts[0].vprev = nverts[nverts.length - 1];

    return new Polygon2d(nverts);
  }

  /**
   * Assumes the polygon is anchored at its centre.
   *
   * @param {number} width
   * @param {number} height
   */
  static fromRect(width, height) {
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;

    return Polygon2d.fromArray([
      [-halfWidth, -halfHeight],
      [halfWidth, -halfHeight],
      [halfWidth, halfHeight],
      [-halfWidth, halfHeight],
    ]);
  }
}

/**
 * @typedef {Object} Bounds2d Bounding box, bounds for short.
 * @prop {Readonly<Vector2d>} max For axis-aligned bounding boxes, it is usually the bottom-right point.
 * @prop {Readonly<Vector2d>} min For axis-aligned bounding boxes, it is usually the top-left point.
 */

/**
 * @typedef {Vector2d & { vprev: Vertex, vnext: Vertex }} Vertex Vertex in a polygon.
 */

/**
 * @typedef {Object} Edge Edge in a polygon.
 * @prop {Vertex} start Starting vertex of the edge.
 * @prop {Vertex} end Ending vertex of the edge.
 * @prop {() => Vector2d} calcNormal Normal vector to the edge.
 */

/**
 * @typedef {{
 *   [Symbol.iterator](): Generator<Readonly<Edge>, void, unknown>;
 *   get: (index: number) => Readonly<Edge>;
 *   length: Readonly<number>;
 * }} EdgeList
 */

/**
 * @typedef {{
 *   verts: Vertex[],
 *   edges: EdgeList,
 *   aabb: Bounds2d,
 *   calcOobb: () => Bounds2d
 * }} TransformedPolygon2d
 */
