/**
 * @template {Function} T
 * @param {T} fn
 * @param {number} delay
 * @returns {T}
 */
export default function debounce(fn, delay = 250) {
  /** @type {number | undefined} */
  let timeoutId;

  // @ts-ignore
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
