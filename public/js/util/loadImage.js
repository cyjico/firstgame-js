/**
 * @type {Map<string, CanvasImageSource>}
 */
const imageCache = new Map();

/**
 * @param {string} url
 */
export default async function loadImage(url) {
  const anchor = document.createElement('a');
  anchor.href = url;
  url = anchor.href;

  if (!imageCache.has(url)) {
    imageCache.set(
      url,
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (_ev, _src, _lineno, _colno, error) => reject(error);
        img.src = url;
      }),
    );
  }

  return imageCache.get(url);
}
