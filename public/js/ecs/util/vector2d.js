import { RAD_TO_DEG, clamp } from './mathplus.js';

export default class Vector2d {
  /** @type {number} */
  x = 0;
  /** @type {number} */
  y = 0;

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {Vector2d}
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * @returns {Vector2d}
   */
  neg() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  /**
   * @param {Vector2d} vector
   * @returns {Vector2d}
   */
  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  /**
   * @param {Vector2d} vector
   * @returns {Vector2d}
   */
  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  /**
   * @param {number} n
   * @returns {Vector2d}
   */
  div(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }

  /**
   * @param {number} n
   * @returns {Vector2d}
   */
  mul(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  /**
   * @param {Vector2d} vector
   * @returns {boolean}
   */
  equals(vector) {
    return this.cpy().sub(vector).sqrMag() < Number.EPSILON;
  }

  /**
   * @param {Vector2d} vector
   * @returns {boolean}
   */
  notEquals(vector) {
    return this.cpy().sub(vector).sqrMag() >= Number.EPSILON;
  }

  /**
   * @param {number} [radix=10]
   * @returns {string}
   */
  toString(radix = 10) {
    return `(${this.x.toString(radix)}, ${this.y.toString(radix)})`;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  sqrMag() {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * @returns {Vector2d}
   */
  norm() {
    const mag = this.mag();
    if (mag > Number.EPSILON) return this.div(mag);
    else return this.set(0, 0);
  }

  /**
   * @returns {Vector2d} Copy (aka 'clone') of the vector.
   */
  cpy() {
    return new Vector2d(this.x, this.y);
  }

  /**
   * @returns {Vector2d} Normalized copy of the vector.
   */
  normed() {
    return this.cpy().norm();
  }

  /**
   * @returns {Vector2d}
   */
  static get zero() {
    return new Vector2d(0, 0);
  }

  /**
   * @returns {Vector2d}
   */
  static get one() {
    return new Vector2d(1, 1);
  }

  /**
   * @returns {Vector2d}
   */
  static get positiveInfinity() {
    return new Vector2d(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
  }

  /**
   * @returns {Vector2d}
   */
  static get negativeInfinity() {
    return new Vector2d(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
  }

  /**
   * @returns {Vector2d}
   */
  static get up() {
    return new Vector2d(0, -1);
  }

  /**
   * @returns {Vector2d}
   */
  static get right() {
    return new Vector2d(1, 0);
  }

  /**
   * @returns {Vector2d}
   */
  static get down() {
    return new Vector2d(0, 1);
  }

  /**
   * @returns {Vector2d}
   */
  static get left() {
    return new Vector2d(-1, 0);
  }

  /**
   * @param {number} rad
   * @returns {Vector2d} Vector converted from an angle in radians.
   */
  static fromRadians(rad) {
    return new Vector2d(Math.cos(rad), Math.sin(rad));
  }

  /**
   * Angle between two vectors.
   *
   * @param {Vector2d} from
   * @param {Vector2d} to
   * @returns {number} Angle in radians.
   */
  static angle(from, to) {
    const denominator = Math.sqrt(Math.abs(from.sqrMag() * to.sqrMag()));
    if (denominator < 1e-15) return 0;

    const dot = clamp(Vector2d.dot(from, to) / denominator, -1, 1);
    return Math.acos(dot);
  }

  /**
   * @param {Vector2d} vector
   * @param {number} maxLength
   * @returns {Vector2d}
   */
  static clampMagnitude(vector, maxLength) {
    if (vector.sqrMag() > maxLength * maxLength)
      return vector.normed().mul(maxLength);
    else return vector;
  }

  /**
   * @param {Vector2d} from
   * @param {Vector2d} to
   * @returns {number}
   */
  static distance(from, to) {
    return from.cpy().sub(to).mag();
  }

  /**
   * @param {Vector2d} lhs
   * @param {Vector2d} rhs
   * @returns {number}
   */
  static dot(lhs, rhs) {
    return lhs.x * rhs.x + lhs.y * rhs.y;
  }

  /**
   * @param {Vector2d} v1
   * @param {Vector2d} v2
   * @param {number} t
   * @returns {Vector2d}
   */
  static lerp(v1, v2, t) {
    return this.unclampedLerp(v1, v2, clamp(t, 0, 1));
  }

  /**
   * @param {Vector2d} v1
   * @param {Vector2d} v2
   * @param {number} t
   * @returns {Vector2d}
   */
  static unclampedLerp(v1, v2, t) {
    return new Vector2d(v1.x + (v2.x - v1.x) * t, v1.y + (v2.y - v1.y) * t);
  }

  /**
   * @param {Vector2d} lhs
   * @param {Vector2d} rhs
   * @returns {Vector2d}
   */
  static max(lhs, rhs) {
    return new Vector2d(Math.max(lhs.x, rhs.x), Math.max(lhs.y, rhs.y));
  }

  /**
   * @param {Vector2d} lhs
   * @param {Vector2d} rhs
   * @returns {Vector2d}
   */
  static min(lhs, rhs) {
    return new Vector2d(Math.min(lhs.x, rhs.x), Math.min(lhs.y, rhs.y));
  }

  /**
   * @param {Vector2d} current
   * @param {Vector2d} target
   * @param {number} maxDistanceDelta
   * @returns {Vector2d}
   */
  static moveTowards(current, target, maxDistanceDelta) {
    const difference = target.cpy().sub(current);
    const distance = difference.mag();
    if (distance <= maxDistanceDelta || distance < Number.EPSILON)
      return target;
    else
      return difference.cpy().div(distance).mul(maxDistanceDelta).add(current);
  }

  /**
   * @param {Vector2d} direction
   * @returns {Vector2d}
   */
  static perpendicular(direction) {
    return new Vector2d(-direction.y, direction.x);
  }

  /**
   * @param {Vector2d} vector
   * @param {Vector2d} onNormal
   * @returns {Vector2d}
   */
  static project(vector, onNormal) {
    const sqrMag = onNormal.sqrMag();
    if (sqrMag < Number.EPSILON) return Vector2d.zero;
    else return onNormal.mul(Vector2d.dot(vector, onNormal)).div(sqrMag);
  }

  /**
   * @param {Vector2d} direction
   * @param {Vector2d} normal
   * @returns {Vector2d}
   */
  static reflect(direction, normal) {
    return direction
      .cpy()
      .mul(-2 * Vector2d.dot(normal, direction))
      .add(direction);
  }

  /**
   * @param {Vector2d} lhs
   * @param {Vector2d} rhs
   * @returns {Vector2d}
   */
  static scale(lhs, rhs) {
    return new Vector2d(lhs.x * rhs.x, lhs.y * rhs.y);
  }

  /**
   * @param {Vector2d} from
   * @param {Vector2d} to
   * @returns {number}
   */
  static signedAngle(from, to) {
    return (
      Math.atan2(from.x * to.y - from.y * to.x, from.x * to.x + from.y * to.y) *
      RAD_TO_DEG
    );
  }
}
