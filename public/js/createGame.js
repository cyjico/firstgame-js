import { BulletSys } from './arche/createBullet.js';
import createPlayer from './arche/createPlayer.js';
import GameLoop from './ecs/gameLoop.js';
import InputSys from './ecs/systems/inputSys.js';
import Polygon2dCollision from './ecs/systems/polygon2dCollision.js';
import Polygon2dRenderer from './ecs/systems/polygon2dRenderer.js';
import RendererMaster from './ecs/systems/rendererMaster.js';
import SpriteRenderer from './ecs/systems/spriteRenderer.js';

/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx2d
 */
export default async function createGame(canvas, ctx2d) {
  const gameLoop = new GameLoop();
  const inputSys = new InputSys(canvas);

  gameLoop.setSystems([
    createPlayer(gameLoop.entMger, inputSys).sys,
    new BulletSys(canvas),
    new Polygon2dCollision(true),
    new RendererMaster(ctx2d, new Polygon2dRenderer(), new SpriteRenderer()),
    inputSys,
  ]);

  return gameLoop;
}
