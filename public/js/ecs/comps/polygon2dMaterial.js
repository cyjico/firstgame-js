/**
 * @typedef {Object} MaterialConfig
 * @property {number} [lineWidth]
 * @property {CanvasLineCap} [lineCap]
 * @property {CanvasLineJoin} [lineJoin]
 * @property {number} [miterLimit]
 * @property {number[]} [lineDash]
 * @property {number} [lineDashOffset]
 * @property {string|CanvasGradient|CanvasPattern} [fillStyle]
 * @property {string|CanvasGradient|CanvasPattern} [strokeStyle]
 */

export default class Polygon2dMaterial {
  /**
   * @param {MaterialConfig} [config]
   */
  constructor({
    lineWidth,
    lineCap,
    lineJoin,
    miterLimit,
    lineDash,
    lineDashOffset,
    fillStyle,
    strokeStyle,
  } = {}) {
    /**
     * @type {number | undefined}
     */
    this.lineWidth = lineWidth;
    /**
     * @type {CanvasLineCap | undefined}
     */
    this.lineCap = lineCap;
    /**
     * @type {CanvasLineJoin | undefined}
     */
    this.lineJoin = lineJoin;
    /**
     * @type {number | undefined}
     */
    this.miterLimit = miterLimit;
    /**
     * @type {number[] | undefined}
     */
    this.lineDash = lineDash;
    /**
     * @type {number | undefined}
     */
    this.lineDashOffset = lineDashOffset;
    /**
     * @type {string | CanvasGradient | CanvasPattern | undefined}
     */
    this.fillStyle = fillStyle;
    /**
     * @type {string | CanvasGradient | CanvasPattern | undefined}
     */
    this.strokeStyle = strokeStyle;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx2d
   */
  setStyling(ctx2d) {
    if (this.lineWidth) ctx2d.lineWidth = this.lineWidth;

    if (this.lineCap) ctx2d.lineCap = this.lineCap;

    if (this.lineJoin) ctx2d.lineJoin = this.lineJoin;

    if (this.miterLimit) ctx2d.miterLimit = this.miterLimit;

    if (this.lineDash) ctx2d.setLineDash(this.lineDash);

    if (this.lineDashOffset) ctx2d.lineDashOffset = this.lineDashOffset;

    if (this.fillStyle) ctx2d.fillStyle = this.fillStyle;

    if (this.strokeStyle) ctx2d.strokeStyle = this.strokeStyle;
  }
}
