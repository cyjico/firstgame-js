/**
 * @typedef {import('./core/system.js').default} System
 */

import EntMger from './core/entMger.js';

/**
 * @typedef {Object} GameLoopInfo
 * @prop {{
 *  fixedDt: number,
 *  fixedT: number,
 *  dt: number,
 *  t: number
 * }} time Various times in milliseconds.
 * @prop {() => EntMger} entMger
 */

export default class GameLoop {
  static DELTA_TIME_TARGET = (1 / 60) * 1000;

  entMger = new EntMger();

  /**
   * @type {{ start: System[]; fixedUpdate: System[]; update: System[]; }}
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
    entMger: () => this.entMger,
  };

  /**
   * @param {System[]} systems Array of systems. Execution is from first to last.
   */
  constructor(systems) {
    for (let i = 0; i < systems.length; i++) {
      const sys = systems[i];

      if (sys.start) this.#systems.start.push(sys);
      if (sys.update) this.#systems.update.push(sys);
      if (sys.fixedUpdate) this.#systems.fixedUpdate.push(sys);
    }
  }

  get systems() {
    return {
      /**
       * @template {Function} T
       * @param {T} sys
       */
      calcExists: (sys) => {
        for (let i = 0; i < this.#systems.start.length; i++)
          if (this.#systems.start[i] instanceof sys) return true;
        for (let i = 0; i < this.#systems.update.length; i++)
          if (this.#systems.update[i] instanceof sys) return true;
        for (let i = 0; i < this.#systems.fixedUpdate.length; i++)
          if (this.#systems.fixedUpdate[i] instanceof sys) return true;

        return false;
      },
      /**
       * @param {System} sys
       */
      push: (sys) => {
        if (this.info.time.dt !== 0)
          throw new Error(
            'Modification of systems during runtime is not allowed.',
          );

        if (sys.start) this.#systems.start.push(sys);
        if (sys.update) this.#systems.update.push(sys);
        if (sys.fixedUpdate) this.#systems.fixedUpdate.push(sys);
      },
    };
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
