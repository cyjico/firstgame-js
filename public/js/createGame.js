import Polygon2d from './ecs/comps/polygon2d.js';
import Polygon2dCollider from './ecs/comps/polygon2dCollider.js';
import Polygon2dMaterial from './ecs/comps/polygon2dMaterial.js';
import Sprite from './ecs/comps/sprite.js';
import Transform2d from './ecs/comps/transform2d.js';
import GameLoop from './ecs/gameLoop.js';
import Vector2d from './ecs/util/vector2d.js';
import InputSys from './ecs/systems/inputSys.js';
import Polygon2dCollision from './ecs/systems/polygon2dCollision.js';
import Polygon2dRenderer from './ecs/systems/polygon2dRenderer.js';
import RendererMaster from './ecs/systems/rendererMaster.js';
import SpriteRenderer from './ecs/systems/spriteRenderer.js';
import loadImage from './util/loadImage.js';

/**
 * @param {HTMLCanvasElement}        canvas
 * @param {CanvasRenderingContext2D} ctx2d
 */
export default async function createGame(canvas, ctx2d) {
  const inputSystem = new InputSys(canvas);
  const gameLoop = new GameLoop();

  const player = await createUser(gameLoop, inputSystem);

  gameLoop.setSystems([
    player.system,
    new Polygon2dCollision(true),
    new RendererMaster(ctx2d, new Polygon2dRenderer(), new SpriteRenderer()),
    inputSystem,
  ]);

  return gameLoop;
}

/**
 * @param {GameLoop}    gameLoop
 * @param {InputSys} inputSystem
 */
async function createUser(gameLoop, inputSystem) {
  const id = gameLoop.entMger.createEnt();
  const t2d = new Transform2d([50, 50]);
  const sprite = new Sprite({
    image: await loadImage(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/512px-Tux.svg.png',
    ),
    width: 50,
    height: 50,
  });

  gameLoop.entMger.addComps(
    id,
    Polygon2dCollider.fromRect(50, 50),
    t2d,
    sprite,
  );

  const __poly2dRect = Polygon2d.fromRect(50, 50);
  const __poly2dMat = new Polygon2dMaterial({
    fillStyle: '#fff',
  });

  /** @type {import('./ecs/core/sys.js').default} */
  const system = {
    start: null,
    update: (ginfo) => {
      const fixedDtSec = ginfo.time.fixedDt * 0.001;

      if (inputSystem.isKeyPressed('w', false))
        t2d.pos.add(Vector2d.fromRadians(t2d.rot).mul(fixedDtSec).mul(250));

      if (inputSystem.isKeyPressed('s', false))
        t2d.pos.add(
          Vector2d.fromRadians(t2d.rot).negate().mul(fixedDtSec).mul(250),
        );

      if (inputSystem.isKeyPressed('a', false)) t2d.rot -= fixedDtSec * 4;
      if (inputSystem.isKeyPressed('d', false)) t2d.rot += fixedDtSec * 4;

      if (inputSystem.mouse.getButtonClicked('prim'))
        ginfo
          .entMger()
          .addComps(
            ginfo.entMger().createEnt(),
            Polygon2dCollider.fromRect(50, 50),
            new Transform2d([inputSystem.mouse.x, inputSystem.mouse.y]),
            __poly2dRect,
            __poly2dMat,
          );
    },
    fixedUpdate: null,
  };

  return {
    system,
  };
}
