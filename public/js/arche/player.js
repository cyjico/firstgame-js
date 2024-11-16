import HealthComp from '../comps/healthComp.js';
import InvComp from '../comps/invComp.js';
import RangedWeapon from '../comps/invComp.rangedWeapon.js';
import MovementComp from '../comps/movementComp.js';
import { CollisionLayer } from '../constants.js';
import PolygonCollider from '../ecs/comps/polygonCollider.js';
import Sprite from '../ecs/comps/sprite.js';
import Transform from '../ecs/comps/transform.js';
import Sys from '../ecs/core/sys.js';
import inputHandler, { MOUSE_BUTTON } from '../ecs/systems/inputHandler.js';
import Vector2d from '../ecs/util/vector2d.js';
import loadImage from '../util/loadImage.js';
import { createChaser } from './enemy/chaser.js';

export class PlayerComp {}

export class PlayerSys extends Sys {
  /**
   * @type {import("../ecs/core/sys.js").SysAction} ginfo
   */
  update = ({ time, entMger, evtBus }) => {
    // DEBUGGING
    if (inputHandler.mouse.buttons.down & MOUSE_BUTTON.PRIMARY) {
      createChaser(
        entMger,
        [inputHandler.mouse.pos.x, inputHandler.mouse.pos.y],
        -Math.PI + Math.random() * Math.PI * 2,
      );
    }

    const ent = entMger.getEntsWithComp_t(PlayerComp).next().value;
    if (ent == null) return;

    const t = entMger.getComp_t(ent, Transform);
    const mov = entMger.getComp_t(ent, MovementComp);
    if (!t || !mov) return;

    mov.targetDir = Vector2d.zero;

    if (inputHandler.isKeyPressed('w'))
      mov.targetDir = Vector2d.fromRadians(t.rot);
    if (inputHandler.isKeyPressed('s'))
      mov.targetDir = Vector2d.fromRadians(t.rot + Math.PI);

    if (inputHandler.isKeyPressed('d')) mov.targetRot += 0.06;
    if (inputHandler.isKeyPressed('a')) mov.targetRot -= 0.06;

    if (inputHandler.keys.down.has('x')) {
      const inv = entMger.getComp_t(ent, InvComp);
      if (inv) {
        const inv_envInfo = {
          relT: time.t,
          relDt: time.dt,
          entMger,
          evtBus,
          ent,
        };

        if (inv.items[inv.curItemIdx]?.canUse(inv_envInfo)) {
          const dir = inputHandler.mouse.pos.cpy().sub(t.pos).normed();
          inv.items[inv.curItemIdx].use(
            Object.assign(
              {
                dir,
              },
              inv_envInfo,
            ),
          );
        }
      }
    }
  };
}

/**
 * @param {import('../ecs/core/entMger.js').default} entMger
 * @param {[number, number]} pos
 */
export async function createPlayer(entMger, pos) {
  const polycol = PolygonCollider.fromRect(28, 25);
  const proj_polycol = PolygonCollider.fromRect(40, 25);
  polycol.rules.layer = proj_polycol.rules.layer = CollisionLayer.PLAYER;
  polycol.rules.mask = proj_polycol.rules.mask =
    CollisionLayer.DEFAULT | CollisionLayer.ENEMY;

  entMger.addComps(
    entMger.createEnt(),
    new PlayerComp(),
    new HealthComp(),
    polycol,
    new Transform(pos, -Math.PI / 2),
    new Sprite({
      img: await loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/512px-Tux.svg.png',
      ),
      width: 28,
      height: 25,
    }),
    new MovementComp({
      targetRot: -Math.PI / 2,
    }),
    new InvComp([
      new RangedWeapon(
        'default',
        {
          range: 10,
          dmg: 25,
          cooldownMs: 0,
        },
        {
          spd: 1,
          count: 1,
          sprite: new Sprite({
            img: await loadImage(
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsf53D6qW-r1u5qULvvnESTXHirMs-m6ASJA&s',
            ),
            width: 40,
            height: 25,
            offrot: Math.PI,
          }),
          collider: proj_polycol,
        },
      ),
    ]),
  );
}
