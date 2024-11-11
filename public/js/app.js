'use strict';

import Polygon2d from './ecs/comps/polygon2d.js';
import Polygon2dCollider from './ecs/comps/polygon2dCollider.js';
import Polygon2dMaterial from './ecs/comps/polygon2dMaterial.js';
import Sprite from './ecs/comps/sprite.js';
import Transform2d from './ecs/comps/transform2d.js';
import GameLoop from './ecs/gameLoop.js';
import Vector2d from './ecs/math/vector2d.js';
import InputSystem from './ecs/systems/inputSystem.js';
import Polygon2dCollision from './ecs/systems/polygon2dCollision.js';
import Polygon2dRenderer from './ecs/systems/polygon2dRenderer.js';
import RendererMaster from './ecs/systems/rendererMaster.js';
import SpriteRenderer from './ecs/systems/spriteRenderer.js';
import debounce from './shared/debounce.js';
import loadImage from './shared/loadImage.js';

const CANVAS = /** @type {HTMLCanvasElement} */ (
  document.querySelector('canvas')
);

function resizeCanvas() {
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
}
window.addEventListener('resize', debounce(resizeCanvas));
resizeCanvas();

const CTX2D = /** @type {CanvasRenderingContext2D} */ (CANVAS.getContext('2d'));

const RECT_POLY2D = Polygon2d.fromRect(50, 50);
const MAT_POLY2D = new Polygon2dMaterial({
  fillStyle: '#fff',
});

const INPUT_SYSTEM = new InputSystem(CANVAS);
const GAME_LOOP = new GameLoop([
  {
    start: null,
    fixedUpdate: null,
    update: (gInfo) => {
      const entMger = gInfo.entMger();
      const fixedDtSec = gInfo.time.fixedDt * 0.001;

      const t = entMger.getComp_t(PLAYER.id, Transform2d);
      if (!t) return;

      if (INPUT_SYSTEM.isKeyPressed('w', false))
        t.pos.add(Vector2d.fromRadians(t.rot).mul(fixedDtSec).mul(250));

      if (INPUT_SYSTEM.isKeyPressed('s', false))
        t.pos.add(
          Vector2d.fromRadians(t.rot).negate().mul(fixedDtSec).mul(250),
        );

      if (INPUT_SYSTEM.isKeyPressed('a', false)) t.rot -= fixedDtSec * 4;
      if (INPUT_SYSTEM.isKeyPressed('d', false)) t.rot += fixedDtSec * 4;

      if (INPUT_SYSTEM.mouse.getButtonClicked('prim'))
        entMger.addComps(
          entMger.createEnt(),
          Polygon2dCollider.fromRect(50, 50),
          new Transform2d([INPUT_SYSTEM.mouse.x, INPUT_SYSTEM.mouse.y]),
          RECT_POLY2D,
          MAT_POLY2D,
        );
    },
  },
  new Polygon2dCollision(true),
  new RendererMaster(CTX2D, new Polygon2dRenderer(), new SpriteRenderer()),
  INPUT_SYSTEM,
]);

const PLAYER = await (async () => {
  const __id = GAME_LOOP.entMger.createEnt();
  GAME_LOOP.entMger.addComps(
    __id,
    Polygon2dCollider.fromRect(50, 50),
    new Transform2d([50, 50]),
    new Sprite({
      image: await loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/512px-Tux.svg.png',
      ),
      width: 50,
      height: 50,
    }),
  );

  return {
    id: __id,
  };
})();

GAME_LOOP.start();
