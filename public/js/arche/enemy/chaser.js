import Sys from '../../../js/ecs/core/sys.js';
import HazardComp from '../../comps/hazardComp.js';
import HealthComp from '../../comps/healthComp.js';
import MovementComp from '../../comps/movementComp.js';
import { CollisionLayer } from '../../constants.js';
import Polygon2dCollider from '../../ecs/comps/polygon2dCollider.js';
import Sprite from '../../ecs/comps/sprite.js';
import Transform2d from '../../ecs/comps/transform2d.js';
import Vector2d from '../../ecs/util/vector2d.js';
import loadImage from '../../util/loadImage.js';
import { PlayerComp } from '../player.js';

export class ChaserComp {
  onCooldown = false;
}

export class ChaserSys extends Sys {
  /** @type {import('public/js/ecs/core/sys.js').SysAction} */
  update = ({ entMger }) => {
    const player_ent = entMger.getEntsWithComp_t(PlayerComp).next().value;
    if (player_ent == null) return;

    const player_t2d = entMger.getComp_t(player_ent, Transform2d);
    const player_col = entMger.getComp_t(player_ent, Polygon2dCollider);
    if (!player_t2d || !player_col) return;
    for (const ent of entMger.getEntsWithComp_t(ChaserComp)) {
      const chaser = entMger.getComp_t(ent, ChaserComp);
      const t2d = entMger.getComp_t(ent, Transform2d);
      const mv = entMger.getComp_t(ent, MovementComp);
      const col = entMger.getComp_t(ent, Polygon2dCollider);
      if (!chaser || !t2d || !mv || !col || chaser.onCooldown) continue;

      if (player_t2d.pos.cpy().sub(t2d.pos).sqrMag() <= 35 * 35) {
        mv.targetDir = Vector2d.zero;
        continue;
      }

      mv.targetDir = player_t2d.pos.cpy().sub(t2d.pos).norm();
      mv.targetRot = Math.atan2(mv.targetDir.y, mv.targetDir.x);
    }
  };
}

/**
 * @param {import('../../ecs/core/entMger.js').default} entMger
 * @param {[number, number]} pos
 * @param {number} rot
 */
export async function createChaser(entMger, pos, rot) {
  const poly2dcol = Polygon2dCollider.fromRect(28, 25);
  poly2dcol.rules.layer = CollisionLayer.ENEMY;
  poly2dcol.rules.mask =
    CollisionLayer.DEFAULT | CollisionLayer.ENEMY | CollisionLayer.PLAYER;

  entMger.addComps(
    entMger.createEnt(),
    new HealthComp(),
    poly2dcol,
    new Transform2d(pos, rot),
    new Sprite({
      img: await loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/0/01/THESCARYGUY2011B400.jpg',
      ),
      width: 28,
      height: 25,
      offrot: Math.PI / 2,
    }),
    new MovementComp(),
    new ChaserComp(),
    new HazardComp(5, 'enemy', ['enemy']),
  );
}
