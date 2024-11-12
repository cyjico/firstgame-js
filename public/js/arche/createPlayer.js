import Polygon2d from '../ecs/comps/polygon2d.js';
import Polygon2dCollider from '../ecs/comps/polygon2dCollider.js';
import Sprite from '../ecs/comps/sprite.js';
import Transform2d from '../ecs/comps/transform2d.js';
import { MOUSE_BUTTON } from '../ecs/systems/inputSys.js';
import Vector2d from '../ecs/util/vector2d.js';
import loadImage from '../util/loadImage.js';
import createBullet from './createBullet.js';

const POLY2DCOL_RECT = Polygon2dCollider.fromRect(50, 50);

/**
 * @param {import('../ecs/core/entMger.js').default} entMger
 * @param {import('../ecs/systems/inputSys.js').default} inputSys
 * @param {[number, number]} pos
 */
export default function createPlayer(entMger, inputSys, pos) {
  const id = entMger.createEnt();
  const t2d = new Transform2d(pos, -Math.PI / 2);
  let sprite = new Sprite({
    width: 50,
    height: 50,
  });

  loadImage(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/512px-Tux.svg.png',
  ).then((img) => {
    sprite.image = img;

    entMger.addComps(id, POLY2DCOL_RECT, t2d, sprite);
  });

  /** @type {import('../ecs/core/sys.js').default} */
  const sys = {
    start: null,
    update: (ginfo) => {
      const dtSec = ginfo.time.dt * 0.001;

      if (inputSys.keys.pressed.has('w'))
        t2d.pos.add(Vector2d.fromRadians(t2d.rot).mul(dtSec).mul(250));

      if (inputSys.keys.pressed.has('s'))
        t2d.pos.add(
          Vector2d.fromRadians(t2d.rot).negate().mul(dtSec).mul(250),
        );

      if (inputSys.keys.pressed.has('d')) t2d.rot += dtSec * 5;
      if (inputSys.keys.pressed.has('a')) t2d.rot -= dtSec * 5;

      if (inputSys.mouse.buttons.down & MOUSE_BUTTON.PRIMARY) {
        ginfo
          .entMger()
          .addComps(
            ginfo.entMger().createEnt(),
            new Transform2d([inputSys.mouse.x, inputSys.mouse.y]),
            Polygon2d.fromRect(25, 25),
            Polygon2dCollider.fromRect(25, 25),
          );
      }

      if (inputSys.keys.down.has('x')) {
        const dir = new Vector2d(inputSys.mouse.x, inputSys.mouse.y)
          .sub(t2d.pos)
          .normalize();
        createBullet(entMger, 'player', dir, 500, t2d.pos, Math.atan2(dir.y, dir.x));
      }
    },
    fixedUpdate: null,
  };

  return {
    sys,
  };
}
