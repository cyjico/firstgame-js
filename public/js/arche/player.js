import Polygon2dCollider from '../ecs/comps/polygon2dCollider.js';
import Transform2d from '../ecs/comps/transform2d.js';
import Sys from '../ecs/core/sys.js';
import inputHandler, { MOUSE_BUTTON } from '../ecs/systems/inputHandler.js';
import Vector2d from '../ecs/util/vector2d.js';
import MovementComp from '../comps/movementComp.js';
import InvComp from '../comps/invComp.js';
import loadImage from '../util/loadImage.js';
import Sprite from '../ecs/comps/sprite.js';
import { CollisionLayer } from '../constants.js';
import HealthComp from '../comps/healthComp.js';
import createRangedWeapon from '../comps/invComp.createRangedWeapon.js';
import { createChaser } from './enemy/chaser.js';

export class PlayerComp {}

export class PlayerSys extends Sys {
  /**
   * @type {import("../ecs/core/sys.js").SysAction} ginfo
   */
  update = ({ time, entMger }) => {
    // DEBUGGING
    if (inputHandler.mouse.buttons.down & MOUSE_BUTTON.PRIMARY) {
      createChaser(entMger, [
        inputHandler.mouse.pos.x,
        inputHandler.mouse.pos.y,
      ], -Math.PI + Math.random() * Math.PI * 2);
    }

    const ent = entMger.getEntsWithComp_t(PlayerComp).next().value;
    if (ent == null) return;

    const t2d = entMger.getComp_t(ent, Transform2d);
    const movComp = entMger.getComp_t(ent, MovementComp);
    if (!t2d || !movComp) return;

    movComp.targetDir = Vector2d.zero;

    if (inputHandler.isKeyPressed('w'))
      movComp.targetDir = Vector2d.fromRadians(t2d.rot);
    if (inputHandler.isKeyPressed('s'))
      movComp.targetDir = Vector2d.fromRadians(t2d.rot + Math.PI);

    if (inputHandler.isKeyPressed('d')) movComp.targetRot += 0.06;
    if (inputHandler.isKeyPressed('a')) movComp.targetRot -= 0.06;

    if (inputHandler.keys.down.has('x')) {
      const invComp = entMger.getComp_t(ent, InvComp);

      if (
        invComp &&
        invComp.items[invComp.curItemIdx]?.canUse(time.t, entMger, ent)
      )
        invComp.items[invComp.curItemIdx].use(time.t, entMger, ent);
    }
  };
}

/**
 * @param {import('../ecs/core/entMger.js').default} entMger
 * @param {[number, number]} pos
 */
export async function createPlayer(entMger, pos) {
  const poly2dcol = Polygon2dCollider.fromRect(28, 25);
  const proj_poly2dcol = Polygon2dCollider.fromRect(40, 25);
  poly2dcol.rules.layer = proj_poly2dcol.rules.layer = CollisionLayer.PLAYER;
  poly2dcol.rules.mask = proj_poly2dcol.rules.mask =
    CollisionLayer.DEFAULT | CollisionLayer.ENEMY;

  entMger.addComps(
    entMger.createEnt(),
    new PlayerComp(),
    new HealthComp(),
    poly2dcol,
    new Transform2d(pos, -Math.PI / 2),
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
      createRangedWeapon({
        name: 'default',
        range: 10,
        projSpd: 1,
        projDmg: 25,
        projCount: 1,
        projSprite: new Sprite({
          img: await loadImage(
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsf53D6qW-r1u5qULvvnESTXHirMs-m6ASJA&s',
          ),
          width: 40,
          height: 25,
          offrot: Math.PI,
        }),
        projCollider: proj_poly2dcol,
      }),
    ]),
  );
}
