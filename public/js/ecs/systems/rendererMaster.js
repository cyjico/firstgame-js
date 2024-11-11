import System from '../core/system.js';

export default class RendererMaster extends System {
  /**
   * @type {{
   *   start: RendererSlave[],
   *   fixedUpdate: RendererSlave[],
   *   update: RendererSlave[],
   * }}
   */
  #slvs = {
    start: [],
    fixedUpdate: [],
    update: [],
  };

  /**
   * @param {CanvasRenderingContext2D} ctx2d
   * @param {...RendererSlave} rendererSlaves
   */
  constructor(ctx2d, ...rendererSlaves) {
    super();

    this.ctx2d = new WeakRef(ctx2d);

    for (let i = 0; i < rendererSlaves.length; i++) {
      const slv = rendererSlaves[i];

      if (slv.start) this.#slvs.start.push(slv);
      if (slv.update) this.#slvs.update.push(slv);
    }
  }

  /**
   * @type {import('../core/system.js').SystemAction}
   */
  start = (ginfo) => {
    const ctx2d = this.ctx2d.deref();
    if (!ctx2d) {
      console.warn(`Tried starting to render but failed.`);
      return;
    }

    for (let i = 0; i < this.#slvs.start.length; i++)
      this.#slvs.start[i].start?.(ctx2d, ginfo);
  };

  /**
   * @type {import('../core/system.js').SystemAction}
   */
  update = (ginfo) => {
    const ctx2d = this.ctx2d.deref();
    if (!ctx2d) {
      console.warn(`Tried rendering but failed.`);
      return;
    }

    ctx2d.clearRect(0, 0, ctx2d.canvas.width, ctx2d.canvas.height);
    ctx2d.save();

    for (let i = 0; i < this.#slvs.update.length; i++)
      this.#slvs.update[i].update?.(ctx2d, ginfo);

    ctx2d.restore();
  };
}

/**
 * @typedef {(
 *   ctx2d: CanvasRenderingContext2D,
 *   ginfo: import('../gameLoop.js').GameLoopInfo
 * ) => void} RendererSlaveAction
 */

/**
 * A base class for all RendererSlaves.
 */
export class RendererSlave {
  /**
   * Called when a GameLoop starts.
   *
   * @type {null | RendererSlaveAction}
   */
  start = null;

  /**
   * Called at every available animation frame.
   * This will always be called AFTER fixedUpdate gets called.
   *
   * @type {null | RendererSlaveAction}
   */
  update = null;
}
