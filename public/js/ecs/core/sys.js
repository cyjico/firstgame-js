/**
 * @typedef {(ginfo: import('../gameLoop.js').GameLoopInfo) => void} SysAction
 */

/**
 * A base class for all systems.
 */
export default class Sys {
  /**
   * Called when a GameLoop starts.
   *
   * @type {null | SysAction}
   */
  start = null;

  /**
   * Called at every available animation frame.
   * This will always be called AFTER fixedUpdate gets called.
   *
   * @type {null | SysAction}
   */
  update = null;

  /**
   * Called at a fixed frame rate.
   * This will always be called BEFORE update gets called.
   *
   * @type {null | SysAction}
   */
  fixedUpdate = null;
}

