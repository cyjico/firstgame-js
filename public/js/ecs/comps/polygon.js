import Vector2d from '../util/vector2d.js';
import { isClockwise } from './polygon.util.js';

/**
 * Represents a 2-dimensional convex clockwise polygon.
 */
export default class Polygon {
  /**
   * Vertices in local space.
   *
   * @protected
   * @type {Vertex[]}
   */
  _verts = [];

  /**
   * Edges in local space.
   *
   * @protected
   * @type {Edge[]}
   */
  _edges = [];

  /**
   * Object-oriented bounds in local space.
   *
   * @protected
   * @type {Bounds}
   */
  _oobb = {
    max: Vector2d.zero,
    min: Vector2d.zero,
  };

  /**
   * @param {Vertex[]} verts
   * @param {Object} [opts]
   * @param {Edge[]} [opts.edges] Edges of the vertices.
   * @param {Bounds} [opts.oobb] Object-oriented bounds of the vertices.
   * @throws `verts` must be greater or equal to 3.
   */
  constructor(verts, { edges = undefined, oobb = undefined } = {}) {
    if (verts.length < 3)
      throw new RangeError('Polygon cannot have less than 3 vertices.');

    if (!verts[0].vnext || !verts[0].vprev) throw new TypeError('Not a vertex');

    this._verts = verts;
    if (edges) this._edges = edges;
    if (oobb) this._oobb = oobb;

    if (!edges || !oobb) {
      if (!edges) this._edges = [];

      if (!oobb)
        this._oobb = {
          min: Vector2d.positiveInfinity,
          max: Vector2d.negativeInfinity,
        };

      for (let i = 0; i < this._verts.length; i++) {
        if (!edges) {
          this._edges.push({
            start: this._verts[i],
            end: this._verts[i].vnext,
            calcNormal() {
              const dir = this.end.cpy().sub(this.start).normed();

              return new Vector2d(-dir.y, dir.x);
            },
          });
        }

        if (!oobb) {
          if (this._verts[i].x < this._oobb.min.x)
            this._oobb.min.x = this._verts[i].x;

          if (this._verts[i].x > this._oobb.max.x)
            this._oobb.max.x = this._verts[i].x;

          if (this._verts[i].y < this._oobb.min.y)
            this._oobb.min.y = this._verts[i].y;

          if (this._verts[i].y > this._oobb.max.y)
            this._oobb.max.y = this._verts[i].y;
        }
      }
    }
  }

  get verts() {
    return this._verts;
  }

  get edges() {
    return this._edges;
  }

  get oobb() {
    return this._oobb;
  }

  /**
   * @param {import('./transform.js').default} t
   * @returns {import('./polygon.js').Bounds} Transformed object-aligned bounding box.
   */
  calcWorldOobb(t) {
    const mat = t.getLocalToWorldMatrix();

    return {
      min: mat.multiplyVector2(this._oobb.min),
      max: mat.multiplyVector2(this._oobb.max),
    };
  }

  /**
   * @param {import('./transform.js').default} t
   * @returns {import('./polygon.js').Bounds} Axis-aligned bounding box.
   */
  calcAabb(t) {
    const mat = t.getLocalToWorldMatrix();
    const min = Vector2d.positiveInfinity;
    const max = Vector2d.negativeInfinity;

    for (let i = 0; i < 2; i++) {
      const px = this.oobb[i === 0 ? 'max' : 'min'].x;

      for (let j = 0; j < 2; j++) {
        const py = this.oobb[j === 0 ? 'max' : 'min'].y;

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
   * @param {import('./transform.js').default} t
   * @returns {TransformedPolygon}
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

    const npoly = new Polygon(nverts);

    return {
      verts: npoly.verts,
      edges: npoly.edges,
      aabb: npoly.oobb,
      calcOobb: () => this.calcWorldOobb(t),
    };
  }

  /**
   * @param {[number, number][]} verts Array of 2-long number arrays defining the polygon.
   * @param {boolean} [forceClockwise=true]
   */
  static fromArray(verts, forceClockwise = true) {
    if (verts.length < 3)
      throw new RangeError('Polygon cannot have less than 3 vertices.');

    if (forceClockwise && !isClockwise(verts)) verts.reverse();

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

    return new Polygon(nverts);
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

    return Polygon.fromArray([
      [-halfWidth, -halfHeight],
      [halfWidth, -halfHeight],
      [halfWidth, halfHeight],
      [-halfWidth, halfHeight],
    ]);
  }
}

/**
 * @typedef {Object} Bounds Bounding box, bounds for short.
 * @prop {Vector2d} max For axis-aligned bounding boxes, it is usually the bottom-right point.
 * @prop {Vector2d} min For axis-aligned bounding boxes, it is usually the top-left point.
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
 *   verts: Vertex[],
 *   edges: Edge[],
 *   aabb: Bounds,
 *   calcOobb: () => Bounds
 * }} TransformedPolygon
 */
