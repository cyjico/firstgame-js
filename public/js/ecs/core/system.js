/**
 * @typedef {(ginfo: import('../gameLoop.js').GameLoopInfo) => void} SystemAction
 */

/**
 * A base class for all Systems.
 */
export default class System {
  /**
   * Called when a GameLoop starts.
   *
   * @type {null | SystemAction}
   */
  start = null;

  /**
   * Called at every available animation frame.
   * This will always be called AFTER fixedUpdate gets called.
   *
   * @type {null | SystemAction}
   */
  update = null;

  /**
   * Called at a fixed frame rate.
   * This will always be called BEFORE update gets called.
   *
   * @type {null | SystemAction}
   */
  fixedUpdate = null;
}

