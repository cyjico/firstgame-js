import Vector2d from "../math/vector2d.js";

/**
 * Calculates the area of a polygon.
 * Based on the sign of the calculated area, it is either counter-clockwse (<= 0) or clockwise (> 0).
 *
 * @param {[number, number][]} vertices
 */
export function isPolygonClockwse(vertices) {
  let area = 0;

  let previous = vertices[vertices.length - 1];
  for (let i = 0; i < vertices.length; i++) {
    area += (previous[0] + vertices[i][0]) * (previous[1] + vertices[i][1]);
    previous = vertices[i];
  }

  return Math.sign(area) > 0;
}

/**
 * Calculates the bounding box for a polygon give an array of `Vector2d`.
 *
 * @param {Readonly<Readonly<Vector2d>[]>} verts
 * @returns {import("./polygon2d.js").Bounds2d}
 */
export function getPolygonBounds(verts) {
  const min = Vector2d.positiveInfinity;
  const max = Vector2d.negativeInfinity;

  for (let i = 0; i < verts.length; i++) {
    const vert = verts[i];

    if (vert.x < min.x) min.x = vert.x;
    if (vert.x > max.x) max.x = vert.x;
    if (vert.y < min.y) min.y = vert.y;
    if (vert.y > max.y) max.y = vert.y;
  }

  return { min, max };
}
