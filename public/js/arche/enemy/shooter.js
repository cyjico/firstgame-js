import HazardComp from '../../comps/hazardComp.js';
import HealthComp from '../../comps/healthComp.js';
import InvComp from '../../comps/invComp.js';
import RangedWeapon from '../../comps/invComp.rangedWeapon.js';
import MovementComp from '../../comps/movementComp.js';
import { CollisionLayer } from '../../constants.js';
import PolygonCollider from '../../ecs/comps/polygonCollider.js';
import Sprite from '../../ecs/comps/sprite.js';
import Transform from '../../ecs/comps/transform.js';
import Sys from '../../ecs/core/sys.js';
import Vector2d from '../../ecs/util/vector2d.js';
import loadImage from '../../util/loadImage.js';
import { PlayerComp } from '../player.js';
import { ChaserComp } from './chaser.js';

export class ShooterComp {
  constructor() {}
}

export class ShooterSys extends Sys {
  /**
   * @type {import('@js/ecs/core/sys.js').SysAction}
   */
  update = ({ time, entMger, evtBus }) => {
    const plyr_ent = entMger.getEntsWithComp_t(PlayerComp).next().value;
    if (plyr_ent == null) return;

    const plyr_t = entMger.getComp_t(plyr_ent, Transform);
    if (!plyr_t) return;

    for (const ent of entMger.getEntsWithComp_t(ShooterComp)) {
      const shooter = entMger.getComp_t(ent, ShooterComp);
      const t = entMger.getComp_t(ent, Transform);
      const inv = entMger.getComp_t(ent, InvComp);
      if (!shooter || !t || !inv) return;

      const inv_envInfo = {
        relT: time.t,
        relDt: time.dt,
        entMger,
        evtBus,
        ent,
        sqrDir: plyr_t.pos
          .cpy()
          .add(new Vector2d(-5 + 10 * Math.random(), -5 + 10 * Math.random()))
          .sub(t.pos),
      };

      if (inv.items[inv.curItemIdx]?.canUse(inv_envInfo))
        inv.items[inv.curItemIdx].use(inv_envInfo);
      else inv.getNextItem();
    }
  };
}

const PROJ_HAZARD = new HazardComp(15, 'enemy', ['enemy']);
const PROJ_SPRITE = new Sprite({
  img: await loadImage(
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsf53D6qW-r1u5qULvvnESTXHirMs-m6ASJA&s',
  ),
  width: 40,
  height: 25,
  offrot: Math.PI,
});

/**
 * @param {import('js/ecs/core/entMger.js').default} entMger
 * @param {[number, number]} pos
 * @param {number} rot
 * @param {number} [cooldownMs]
 */
export async function createShooter(entMger, pos, rot, cooldownMs = 700) {
  const polycol = PolygonCollider.fromRect(28, 25);
  polycol.rules.mask =
    CollisionLayer.DEFAULT | CollisionLayer.PLAYER | CollisionLayer.ENEMY;

  const proj_polycol = PolygonCollider.fromRect(40, 25);
  proj_polycol.rules.mask = CollisionLayer.DEFAULT | CollisionLayer.PLAYER;

  polycol.rules.layer = proj_polycol.rules.layer = CollisionLayer.ENEMY;

  entMger.addComps(
    entMger.createEnt(),
    new HealthComp(25),
    polycol,
    new Transform(pos, rot),
    new Sprite({
      img: await loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Noto_Emoji_Oreo_1f475.svg/480px-Noto_Emoji_Oreo_1f475.svg.png',
      ),
      width: 28,
      height: 25,
      offrot: Math.PI / 2,
    }),
    new MovementComp(),
    new ChaserComp({
      sqrRadius: 250 * 250,
    }),
    new InvComp([
      new RangedWeapon(
        'default',
        {
          sqrRange: 250 * 250,
          cooldownMs: cooldownMs,
        },
        {
          spd: 1,
          count: 1,
          hazard: PROJ_HAZARD,
          sprite: PROJ_SPRITE,
          collider: proj_polycol,
        },
      ),
    ]),
    new ShooterComp(),
  );
}
