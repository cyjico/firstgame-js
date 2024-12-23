import EntMger from './core/entMger.js';
import EvtBus from './evtBus.js';
import inputHandler from './systems/inputHandler.js';

/**
 * @typedef {Object} GameLoopInfo
 * @prop {{
 *  fixedDt: number,
 *  fixedT: number,
 *  dt: number,
 *  t: number
 * }} time Various times in milliseconds.
 * @prop {EntMger} entMger
 * @prop {EvtBus} evtBus
 */

export default class GameLoop {
  static DELTA_TIME_TARGET = (1 / 144) * 1000;

  entMger = new EntMger();
  evtBus = new EvtBus();

  /**
   * @type {{
   *   start: import('./core/sys.js').default[],
   *   fixedUpdate: import('./core/sys.js').default[],
   *   update: import('./core/sys.js').default[],
   * }}
   */
  #systems = {
    start: [],
    fixedUpdate: [],
    update: [],
  };

  /**
   * @type {GameLoopInfo}
   */
  info = {
    time: {
      fixedDt: (1 / 50) * 1000,
      fixedT: 0,
      dt: 0,
      t: 0,
    },
    entMger: this.entMger,
    evtBus: this.evtBus,
  };

  /**
   * @param {import('./core/sys.js').default[]} [systems] Array of systems. Execution is from first to last.
   */
  constructor(systems = []) {
    this.setSystems(systems);
  }

  /**
   * @param {import('./core/sys.js').default[]} systems Array of systems. Execution is from first to last.
   */
  setSystems(systems) {
    this.#systems = {
      start: [],
      update: [],
      fixedUpdate: [],
    };

    systems.push(inputHandler);
    for (let i = 0; i < systems.length; i++) {
      const sys = systems[i];

      if (sys.start) this.#systems.start.push(sys);
      if (sys.update) this.#systems.update.push(sys);
      if (sys.fixedUpdate) this.#systems.fixedUpdate.push(sys);
    }
  }

  start = () => {
    this.info.time.t = this.info.time.fixedT = performance.now();
    this.info.time.dt = 0;

    for (let i = 0; i < this.#systems.start.length; i++)
      this.#systems.start[i].start?.(this.info);

    requestAnimationFrame(this.#update);
  };

  /**
   * @param {DOMHighResTimeStamp} timestamp
   */
  #update = (timestamp) => {
    // Call fixedUpdate
    while (this.info.time.fixedT < timestamp) {
      this.info.time.fixedT += this.info.time.fixedDt;

      for (let i = 0; i < this.#systems.fixedUpdate.length; i++)
        this.#systems.fixedUpdate[i].fixedUpdate?.(this.info);
    }

    this.info.time.dt = timestamp - this.info.time.t;

    // Call update
    if (this.info.time.dt >= GameLoop.DELTA_TIME_TARGET) {
      this.info.time.t += this.info.time.dt;

      for (let i = 0; i < this.#systems.update.length; i++)
        this.#systems.update[i].update?.(this.info);
    }

    requestAnimationFrame(this.#update);
  };
}
