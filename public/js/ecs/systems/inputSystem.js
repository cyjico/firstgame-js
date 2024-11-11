import System from '../core/system.js';

/**
 * System for handling mouse and keyboard input.
 *
 * NOTE: SHOULD be put at the end of the system stack.
 */
export default class InputSystem extends System {
  /** @type {Object.<string, { down: boolean, held: boolean, released: boolean }> } */
  keys = {};
  mouse = {
    x: 0,
    y: 0,
    buttonsClick: 0,
    buttonsDown: 0,
    /**
     * @param {'prim'|'seco'|'aux'|'4th'|'5th'} button
     */
    getButton(button) {
      if (button === 'prim' && this.buttonsDown & 1) return true;
      if (button === 'seco' && this.buttonsDown & 2) return true;
      if (button === 'aux' && this.buttonsDown & 4) return true;
      if (button === '4th' && this.buttonsDown & 8) return true;
      if (button === '5th' && this.buttonsDown & 16) return true;

      return false;
    },
    /**
     * @param {'prim'|'seco'|'aux'|'4th'|'5th'} button
     */
    getButtonClicked(button) {
      if (button === 'prim' && this.buttonsClick & 1) return true;
      if (button === 'seco' && this.buttonsClick & 2) return true;
      if (button === 'aux' && this.buttonsClick & 4) return true;
      if (button === '4th' && this.buttonsClick & 8) return true;
      if (button === '5th' && this.buttonsClick & 16) return true;

      return false;
    },
  };

  /**
   * @param {HTMLElement} [baseElement]
   */
  constructor(baseElement = document.body) {
    super();
    this.keys = {};

    window.addEventListener('keydown', this.#onKeyDown.bind(this));
    window.addEventListener('keyup', this.#onKeyUp.bind(this));

    baseElement.addEventListener('mousemove', this.#onMouseMove.bind(this));
    baseElement.addEventListener('mousedown', this.#onMouseDown.bind(this));
    baseElement.addEventListener('mouseup', this.#onMouseUp.bind(this));
  }

  /**
   * @type {import('../core/system.js').SystemAction} gInfo
   */
  update = () => {
    this.mouse.buttonsClick = 0;
  };

  /**
   * @param {KeyboardEvent} event
   */
  #onKeyDown(event) {
    if (!this.keys[event.key]) {
      this.keys[event.key] = {
        down: false,
        held: false,
        released: false,
      };
    }

    this.keys[event.key].down = !event.repeat;
    this.keys[event.key].held = event.repeat;
    this.keys[event.key].released = false;
  }

  /**
   * @param {KeyboardEvent} event
   */
  #onKeyUp(event) {
    if (!this.keys[event.key]) {
      this.keys[event.key] = {
        down: false,
        held: false,
        released: false,
      };
    }

    this.keys[event.key].down = false;
    this.keys[event.key].held = false;
    this.keys[event.key].released = true;
  }

  /**
   * @param {MouseEvent} event
   */
  #onMouseMove(event) {
    const bRect = /** @type {HTMLElement} */ (
      event.target
    ).getBoundingClientRect();

    this.mouse.x = event.clientX - bRect.left;
    this.mouse.y = event.clientY - bRect.top;
  }

  /**
   * @param {MouseEvent} event
   */
  #onMouseDown(event) {
    this.mouse.buttonsDown = this.mouse.buttonsClick = event.buttons;
  }

  /**
   * @param {MouseEvent} event
   */
  #onMouseUp(event) {
    this.mouse.buttonsDown = event.buttons;
  }

  /**
   * @param {string} key
   * @param {boolean} [isCaseSensitive=true]
   */
  isKeyDown(key, isCaseSensitive = true) {
    if (isCaseSensitive) this.keys[key]?.down ?? false;

    return (
      (this.keys[key.toLowerCase()]?.down ||
        this.keys[key.toUpperCase()]?.down) ??
      false
    );
  }

  /**
   * @param {string} key
   * @param {boolean} [isCaseSensitive=true]
   */
  isKeyPressed(key, isCaseSensitive = true) {
    if (isCaseSensitive)
      (this.keys[key]?.down || this.keys[key]?.held) ?? false;

    return (
      (this.keys[key.toLowerCase()]?.down ||
        this.keys[key.toLowerCase()]?.held ||
        this.keys[key.toUpperCase()]?.down ||
        this.keys[key.toUpperCase()]?.held) ??
      false
    );
  }

  /**
   * @param {string} key
   * @param {boolean} [isCaseSensitive=true]
   */
  isKeyReleased(key, isCaseSensitive = true) {
    if (isCaseSensitive) this.keys[key]?.released ?? false;

    return (
      (this.keys[key.toLowerCase()]?.released ||
        this.keys[key.toUpperCase()]?.released) ??
      false
    );
  }
}
