'use strict';

import { ChaserSys } from './arche/enemy/chaser.js';
import { ShooterSys } from './arche/enemy/shooter.js';
import { PlayerSys, createPlayer } from './arche/player.js';
import GameLoop from './ecs/gameLoop.js';
import PolygonCollision from './ecs/systems/polygonCollision.js';
import PolygonRenderer from './ecs/systems/polygonRenderer.js';
import RendererMaster from './ecs/systems/rendererMaster.js';
import SpriteRenderer from './ecs/systems/spriteRenderer.js';
import DestroyOnImpactSys from './systems/destroyOnImpactSys.js';
import DestroyOnOutOfBoundsSys from './systems/destroyOnOutOfBoundsSys.js';
import HazardSys from './systems/hazardSys.js';
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
    new ChaserSys(),
    new ShooterSys(),
    new MovementSys(),
    new PolygonCollision(true),
    new HazardSys(),
    new DestroyOnImpactSys(),
    new DestroyOnOutOfBoundsSys(CANVAS),
    new RendererMaster(
      CTX2D,
      new HealthRenderer(),
      new SpriteRenderer(),
      new PolygonRenderer(),
    ),
  ]);

  return gameLoop;
})();

GAME_LOOP.start();
