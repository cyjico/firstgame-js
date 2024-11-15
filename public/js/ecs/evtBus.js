export default class EvtBus {
  constructor() {
    /** @type {Map<string, Function[]>} */
    this.listeners = new Map();
  }

  /**
   * Register an event listener for a specific event type.
   *
   * @template {Function} T
   * @param {string} event
   * @param {T} callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);

    this.listeners.get(event)?.push(callback);
  }

  /**
   * Trigger all listeners for a specific event.
   *
   * @param {string} event The event name/type.
   * @param {any} data The data to pass to listeners.
   */
  emit(event, data = null) {
    const arr = this.listeners.get(event);

    if (arr) for (let i = 0; i < arr.length; i++) arr[i](data);
  }

  /**
   * Removes a specific listener for a given event.
   *
   * @template {Function} T
   * @param {string} event
   * @param {T} callback
   */
  off(event, callback) {
    const index = this.listeners.get(event)?.indexOf(callback);

    if (typeof index === 'number' && index !== -1)
      this.listeners.get(event)?.splice(index, 1);
  }
}
