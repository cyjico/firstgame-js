'use strict';

import createGame from './createGame.js';
import debounce from './util/debounce.js';

const CANVAS = (() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw new Error('Cannot find a canvas element');

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', debounce(resizeCanvas));
  resizeCanvas();

  return canvas;
})();

const CTX2D = /** @type {CanvasRenderingContext2D} */ (CANVAS.getContext('2d'));

const GAME_LOOP = await createGame(CANVAS, CTX2D);
GAME_LOOP.start();
