import HealthComp from '../comps/healthComp.js';
import createRangedWeapon from '../comps/invComp.createRangedWeapon.js';
import InvComp from '../comps/invComp.js';
import MovementComp from '../comps/movementComp.js';
import { CollisionLayer } from '../constants.js';
import Polygon2dCollider from '../ecs/comps/polygon2dCollider.js';
import Sprite from '../ecs/comps/sprite.js';
import Transform2d from '../ecs/comps/transform2d.js';
import loadImage from '../util/loadImage.js';

/**
 * @param {import('../ecs/core/entMger.js').default} entMger
 * @param {[number, number]} pos
 */
export async function createEnemy(entMger, pos) {
  const poly2dcol = Polygon2dCollider.fromRect(28, 25);
  const proj_poly2dcol = Polygon2dCollider.fromRect(40, 25);
  poly2dcol.rules.layer = proj_poly2dcol.rules.layer = CollisionLayer.ENEMY;
  poly2dcol.rules.mask = proj_poly2dcol.rules.mask =
    CollisionLayer.DEFAULT | CollisionLayer.PLAYER;

  entMger.addComps(
    entMger.createEnt(),
    new HealthComp(),
    poly2dcol,
    new Transform2d(pos, -Math.PI / 2),
    new Sprite({
      img: await loadImage(
        'https://i.pinimg.com/736x/e1/be/17/e1be17fc589c11b79f18d97bae156a89.jpg',
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
