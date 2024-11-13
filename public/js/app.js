'use strict';

import PlayerSys, { createPlayer } from './arche/player.js';
import GameLoop from './ecs/gameLoop.js';
import Polygon2dCollision from './ecs/systems/polygon2dCollision.js';
import Polygon2dRenderer from './ecs/systems/polygon2dRenderer.js';
import RendererMaster from './ecs/systems/rendererMaster.js';
import SpriteRenderer from './ecs/systems/spriteRenderer.js';
import BoundaryCheckSys from './systems/boundaryCheckSys.js';
import HealthRenderer from './systems/healthRenderer.js';
import MovementSys from './systems/movementSys.js';
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

const GAME_LOOP = (() => {
  const gameLoop = new GameLoop();
  createPlayer(gameLoop.entMger, [CANVAS.width / 2, CANVAS.height / 2]);

  gameLoop.setSystems([
    new PlayerSys(),
    new MovementSys(),
    new BoundaryCheckSys(CANVAS),
    new Polygon2dCollision(true),
    new RendererMaster(
      CTX2D,
      new HealthRenderer(),
      new SpriteRenderer(),
      new Polygon2dRenderer(),
    ),
  ]);

  return gameLoop;
})();

GAME_LOOP.start();
