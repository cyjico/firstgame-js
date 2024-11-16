import { createChaser } from '../arche/enemy/chaser.js';
import { createShooter } from '../arche/enemy/shooter.js';
import Sys from '../ecs/core/sys.js';

export default class EnemySpawner extends Sys {
  #canvas;
  #timeSinceLastSpawn;

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super();
    this.#canvas = canvas;
    this.#timeSinceLastSpawn = 0;
  }

  /** @type {import('../ecs/core/sys.js').SysAction} */
  start = ({ time }) => {
    this.#timeSinceLastSpawn = time.t;
  };

  /** @type {import("../ecs/core/sys.js").SysAction} */
  update = ({ time, entMger }) => {
    if (this.#timeSinceLastSpawn + 1000 > time.t) return;

    /** @type {[number, number]} */
    const pos = [
      Math.random() * this.#canvas.width,
      Math.random() * this.#canvas.height,
    ];

    const seed = Math.round(3 * Math.random());
    if (seed <= 2) createChaser(entMger, pos, 0);
    else createShooter(entMger, pos, 0);

    this.#timeSinceLastSpawn = time.t;
  };
}
