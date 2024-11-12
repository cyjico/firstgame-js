
/**
 * Calculates the area of a polygon.
 * Based on the sign of the calculated area, it is either counter-clockwse (<= 0) or clockwise (> 0).
 *
 * @param {[number, number][]} vertices
 */
export function isClockwise(vertices) {
  let area = 0;

  let previous = vertices[vertices.length - 1];
  for (let i = 0; i < vertices.length; i++) {
    area += (previous[0] + vertices[i][0]) * (previous[1] + vertices[i][1]);
    previous = vertices[i];
  }

  return Math.sign(area) > 0;
}
