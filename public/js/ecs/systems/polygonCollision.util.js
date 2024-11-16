import Vector2d from '../util/vector2d.js';

/**
 * @param {import('../comps/polygon.js').Bounds} boundsA
 * @param {import('../comps/polygon.js').Bounds} boundsB
 */
export function testBoundsBounds(boundsA, boundsB) {
  return (
    boundsA.min.x <= boundsB.max.x &&
    boundsA.min.y <= boundsB.max.y &&
    boundsA.max.x >= boundsB.min.x &&
    boundsA.max.y >= boundsB.min.y
  );
}

/**
 * @param {Vector2d} startA
 * @param {Vector2d} endA
 * @param {Vector2d} startB
 * @param {Vector2d} endB
 */
export function testLineLine_c(startA, endA, startB, endB) {
  const uA =
    ((endB.x - startB.x) * (startA.y - startB.y) -
      (endB.y - startB.y) * (startA.x - startB.x)) /
    ((endB.y - startB.y) * (endA.x - startA.x) -
      (endB.x - startB.x) * (endA.y - startA.y));

  const uB =
    ((endA.x - startA.x) * (startA.y - startB.y) -
      (endA.y - startA.y) * (startA.x - startB.x)) /
    ((endB.y - startB.y) * (endA.x - startA.x) -
      (endB.x - startB.x) * (endA.y - startA.y));

  if (uA >= 0 && uA < 1 && uB >= 0 && uB < 1) {
    return [
      {
        point: new Vector2d(
          startA.x + uA * (endA.x - startA.x),
          startA.y + uA * (endA.y - startA.y),
        ),
        normal: new Vector2d(
          (1 - uA) * (startA.x - endA.x),
          (1 - uA) * (startA.y - endA.y),
        ),
      },
    ];
  }

  return [];
}

/**
 * @param {Vector2d} startA
 * @param {Vector2d} endA
 * @param {Vector2d} startB
 * @param {Vector2d} endB
 */
export function testLineLine(startA, endA, startB, endB) {
  return testLineLine_c(startA, endA, startB, endB).length > 0;
}

/**
 * Calculate the minimum translation vector by finding the separating axis with the smallest
 * overlap between the two polygons.
 *
 * @param {import('../comps/polygon.js').TransformedPolygon} poly1
 * @param {import('../comps/polygon.js').TransformedPolygon} poly2
 * @returns {Vector2d | null}
 */
export function calcMinTranslationVec(poly1, poly2) {
  let smallestOverlap = Infinity;
  let smallestAxis = Vector2d.positiveInfinity;

  // Find the smallest overlap and its corresponding axis.
  const edges = [poly1.edges, poly2.edges];
  for (let i = 0; i < edges.length; i++) {
    for (let j = 0; j < edges[i].length; j++) {
      const axis = edges[i][j].calcNormal();

      const proj1 = projectVerts(poly1.verts, axis);
      const proj2 = projectVerts(poly2.verts, axis);

      const overlap =
        Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);

      // If there's no overlap, there's no collision.
      if (overlap <= 0) return null;

      if (overlap < smallestOverlap) {
        smallestOverlap = overlap;
        smallestAxis = axis;
      }
    }
  }

  const mtv = smallestAxis.cpy().mul(smallestOverlap);

  // Make sure the minimum translation vector points to `poly2`.
  const p2c = poly2.aabb.max.cpy().add(poly2.aabb.min).div(2);
  const p1c = poly1.aabb.max.cpy().add(poly1.aabb.min).div(2);
  const dir = p2c.sub(p1c);
  return Vector2d.dot(mtv, dir) < 0 ? mtv.neg() : mtv;
}

/**
 * Projects the vertices of a polygon onto a given axis.
 *
 * @param {Readonly<Readonly<import('../comps/polygon.js').Vertex>[]>} verts
 * @param {Vector2d} axis
 */
export function projectVerts(verts, axis) {
  let min = Vector2d.dot(verts[0], axis);
  let max = min;

  for (let i = 1; i < verts.length; i++) {
    const proj = Vector2d.dot(verts[i], axis);

    min = Math.min(min, proj);
    max = Math.max(max, proj);
  }

  return { min, max };
}
