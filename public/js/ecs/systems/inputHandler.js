import Sys from '../core/sys.js';
import Vector2d from '../util/vector2d.js';

export const MOUSE_BUTTON = {
  PRIMARY: 1,
  SECONDARY: 2,
  AUXILIARY: 4,
  FOURTH: 8,
  FIFTH: 16,
};

/**
 * Handles mouse and keyboard input.
 *
 * NEVER add this manually.
 * It is automatically pushed by `GameLoop` to the end of the system stack.
 */
const inputHandler = new (class InputHandler extends Sys {
  /**
   * @type {{ down: Set<string>, pressed: Set<string>, up: Set<string> }}
   */
  keys = {
    down: new Set(),
    pressed: new Set(),
    up: new Set(),
  };

  mouse = {
    pos: Vector2d.zero,
    buttons: {
      down: 0,
      pressed: 0,
    },
  };

  constructor() {
    super();
    window.addEventListener('keydown', this.#onKeyDown);
    window.addEventListener('keyup', this.#onKeyUp);

    document.addEventListener('mousedown', this.#onMouseDown);
    document.addEventListener('mouseup', this.#onMouseUp);
    document.addEventListener('mousemove', this.#onMouseMove);
  }

  /**
   * @type {import('../core/sys.js').SysAction}
   */
  update = () => {
    this.keys.up.clear();
    this.keys.down.clear();

    this.mouse.buttons.down = 0;
  };

  /**
   * @param {string} key
   */
  isKeyDown = (key) => inputHandler.keys.down.has(key);

  /**
   * @param {string} key
   */
  isKeyPressed = (key) => inputHandler.keys.pressed.has(key);

  /**
   * @param {string} key
   */
  isKeyUp = (key) => inputHandler.keys.up.has(key);

  /**
   * @param {KeyboardEvent} event
   */
  #onKeyDown = (event) => {
    if (!event.repeat) this.keys.down.add(event.key);

    this.keys.pressed.add(event.key);
  };

  /**
   * @param {KeyboardEvent} event
   */
  #onKeyUp = (event) => {
    this.keys.up.add(event.key);
    this.keys.pressed.delete(event.key);
  };

  /**
   * @param {MouseEvent} event
   */
  #onMouseDown = (event) => {
    this.mouse.buttons.down = this.mouse.buttons.pressed = event.buttons;
  };

  /**
   * @param {MouseEvent} event
   */
  #onMouseUp = (event) => {
    this.mouse.buttons.pressed = event.buttons;
  };

  /**
   * @param {MouseEvent} event
   */
  #onMouseMove = (event) => {
    const bRect = /** @type {HTMLElement} */ (
      event.target
    ).getBoundingClientRect();

    this.mouse.pos.set(event.clientX - bRect.left, event.clientY - bRect.top);
  };
})();

export default inputHandler;
