import Polygon2d from '../ecs/comps/polygon2d.js';
import Polygon2dCollider from '../ecs/comps/polygon2dCollider.js';
import Polygon2dMaterial from '../ecs/comps/polygon2dMaterial.js';
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

class PlayerComp {}

export default class PlayerSys extends Sys {
  /**
   * @type {import("../ecs/core/sys.js").SysAction} ginfo
   */
  update = (ginfo) => {
    const ent = ginfo.entMger.getEntsWithComp_t(PlayerComp).next().value;
    if (ent == null) return;

    const t2d = ginfo.entMger.getComp_t(ent, Transform2d);
    const movComp = ginfo.entMger.getComp_t(ent, MovementComp);
    if (!t2d || !movComp) return;

    movComp.targetDir = Vector2d.zero;

    if (inputHandler.isKeyPressed('w'))
      movComp.targetDir = Vector2d.fromRadians(t2d.rot);
    if (inputHandler.isKeyPressed('s'))
      movComp.targetDir = Vector2d.fromRadians(t2d.rot + Math.PI);

    movComp.targetRot = 0;

    if (inputHandler.isKeyPressed('d')) movComp.targetRot = 1;
    if (inputHandler.isKeyPressed('a')) movComp.targetRot = -1;

    if (inputHandler.keys.down.has('x')) {
      const invComp = ginfo.entMger.getComp_t(ent, InvComp);

      if (
        invComp &&
        invComp.items[invComp.curItemIdx]?.canUse(
          ginfo.time.t,
          ginfo.entMger,
          ent,
        )
      )
        invComp.items[invComp.curItemIdx].use(ginfo.time.t, ginfo.entMger, ent);
    }

    // DEBUGGING
    if (inputHandler.mouse.buttons.down & MOUSE_BUTTON.PRIMARY) {
      ginfo.entMger.addComps(
        ginfo.entMger.createEnt(),
        new Transform2d([inputHandler.mouse.pos.x, inputHandler.mouse.pos.y]),
        Polygon2d.fromRect(25, 25),
        Polygon2dCollider.fromRect(25, 25),
        new Polygon2dMaterial({
          lineWidth: 2,
          fillStyle: '#f5bd0d',
        }),
      );
    }
  };
}

/**
 * @param {import('../ecs/core/entMger.js').default} entMger
 * @param {[number, number]} pos
 */
export async function createPlayer(entMger, pos) {
  const poly2dcol = Polygon2dCollider.fromRect(28, 25);
  poly2dcol.rules.layer = CollisionLayer.PLAYER;
  poly2dcol.rules.mask = CollisionLayer.DEFAULT | CollisionLayer.ENEMY;

  const proj_poly2dcol = Polygon2dCollider.fromRect(40, 25);
  proj_poly2dcol.rules.layer = CollisionLayer.PLAYER;
  proj_poly2dcol.rules.mask = CollisionLayer.DEFAULT | CollisionLayer.ENEMY;

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
    new MovementComp(),
    new InvComp([
      createRangedWeapon({
        name: 'default',
        range: 10,
        projSpd: 1,
        projDmg: 10,
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
