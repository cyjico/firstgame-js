import Vector2d from './vector2d.js';

export default class Matrix3x3 {
  constructor(
    m00 = 0,
    m01 = 0,
    m02 = 0,
    m10 = 0,
    m11 = 0,
    m12 = 0,
    m20 = 0,
    m21 = 0,
    m22 = 0,
  ) {
    // m[row][column]

    /**
     * m00 m01 m02
     * m10 m11 m12
     * m20 m21 m22
     */
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;

    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;

    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
  }

  determinant() {
    return (
      this.m00 * (this.m11 * this.m22 - this.m21 * this.m12) -
      this.m01 * (this.m10 * this.m22 - this.m12 * this.m20) +
      this.m02 * (this.m10 * this.m21 - this.m11 * this.m20)
    );
  }

  /**
   * @throws Matrix must have a determinant that isn't 0.
   */
  inverse() {
    const determinant = this.determinant();

    if (determinant === 0)
      throw new RangeError('Cannot invert a matrix whose determinant is 0.');

    const invDet = 1 / determinant;
    return new Matrix3x3(
      // Row 1
      (this.m11 * this.m22 - this.m21 * this.m12) * invDet,
      (this.m02 * this.m21 - this.m01 * this.m22) * invDet,
      (this.m01 * this.m12 - this.m02 * this.m11) * invDet,
      // Row 2
      (this.m12 * this.m20 - this.m10 * this.m22) * invDet,
      (this.m00 * this.m22 - this.m02 * this.m20) * invDet,
      (this.m10 * this.m02 - this.m00 * this.m12) * invDet,
      // Row 3
      (this.m10 * this.m21 - this.m20 * this.m11) * invDet,
      (this.m20 * this.m01 - this.m00 * this.m21) * invDet,
      (this.m00 * this.m11 - this.m10 * this.m01) * invDet,
    );
  }

  transpose() {
    return new Matrix3x3(
      this.m00,
      this.m10,
      this.m20,
      this.m01,
      this.m11,
      this.m21,
      this.m02,
      this.m12,
      this.m22,
    );
  }

  /**
   * Transforms a position by this matrix (does not mutate the vector).
   *
   * @param {Vector2d} vector2d
   */
  multiplyVector2(vector2d) {
    return new Vector2d(
      this.m00 * vector2d.x + this.m01 * vector2d.y + this.m02,
      this.m10 * vector2d.x + this.m11 * vector2d.y + this.m12,
    );
  }

  /**
   * @param {Matrix3x3} matrix
   */
  multiplyMatrix3x3(matrix) {
    return new Matrix3x3(
      this.m00 * matrix.m00 + this.m10 * matrix.m01 + this.m20 * matrix.m02,
      this.m01 * matrix.m00 + this.m11 * matrix.m01 + this.m21 * matrix.m02,
      this.m02 * matrix.m00 + this.m12 * matrix.m01 + this.m22 * matrix.m02,

      this.m00 * matrix.m10 + this.m10 * matrix.m11 + this.m20 * matrix.m12,
      this.m01 * matrix.m10 + this.m11 * matrix.m11 + this.m21 * matrix.m12,
      this.m02 * matrix.m10 + this.m12 * matrix.m11 + this.m22 * matrix.m12,

      this.m00 * matrix.m20 + this.m10 * matrix.m21 + this.m20 * matrix.m22,
      this.m01 * matrix.m20 + this.m11 * matrix.m21 + this.m21 * matrix.m22,
      this.m02 * matrix.m20 + this.m12 * matrix.m21 + this.m22 * matrix.m22,
    );
  }

  /**
   * @param {Vector2d} translation
   */
  static createTranslation(translation) {
    return new Matrix3x3(1, 0, translation.x, 0, 1, translation.y, 0, 0, 1);
  }

  /**
   * @param {number} rotation Angle in radians to rotate.
   */
  static createRotation(rotation) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // Clockwise rotation.
    return new Matrix3x3(cos, -sin, 0, sin, cos, 0, 0, 0, 1);
  }

  /**
   * @param {Vector2d} scale
   */
  static createScale(scale) {
    return new Matrix3x3(scale.x, 0, 0, 0, scale.y, 0, 0, 0, 1);
  }

  /**
   * Creates a translation, rotation, and scaling matrix.
   *
   * @param {Vector2d} translation
   * @param {number} rotation Angle in radians to rotate.
   * @param {Vector2d} scale
   * @returns {Matrix3x3}
   */
  static createTRS(translation, rotation, scale) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return new Matrix3x3(
      scale.x * cos,
      scale.y * -sin,
      translation.x,
      scale.x * sin,
      scale.y * cos,
      translation.y,
      0,
      0,
      1,
    );
  }
}
