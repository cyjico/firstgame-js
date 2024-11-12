import Sys from '../core/sys.js';

export const MOUSE_BUTTON = {
  PRIMARY: 1,
  SECONDARY: 2,
  AUXILIARY: 4,
  FOURTH: 8,
  FIFTH: 16,
};

/**
 * System for handling mouse and keyboard input.
 *
 * NOTE: Should be placed at the end of the systems stack.
 */
export default class InputSys extends Sys {
  /**
   * @type {{ down: Set<string>, pressed: Set<string>, up: Set<string> }}
   */
  keys = {
    down: new Set(),
    pressed: new Set(),
    up: new Set(),
  };

  mouse = {
    x: 0,
    y: 0,
    buttons: {
      down: 0,
      pressed: 0,
    },
  };

  /**
   * @param {HTMLElement} [baseElement]
   */
  constructor(baseElement = document.body) {
    super();
    window.addEventListener('keydown', this.#onKeyDown);
    window.addEventListener('keyup', this.#onKeyUp);

    baseElement.addEventListener('mousedown', this.#onMouseDown);
    baseElement.addEventListener('mouseup', this.#onMouseUp);
    baseElement.addEventListener('mousemove', this.#onMouseMove);
  }

  /**
   * @type {import('../core/sys.js').SysAction}
   */
  update = () => {
    this.keys.down.clear();
    this.keys.up.clear();

    this.mouse.buttons.down = 0;
  };

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

    this.mouse.x = event.clientX - bRect.left;
    this.mouse.y = event.clientY - bRect.top;
  };
}
