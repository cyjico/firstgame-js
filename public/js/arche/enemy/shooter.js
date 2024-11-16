import { ChaserComp } from './chaser.js';
import HazardComp from '/js/comps/hazardComp.js';
import HealthComp from '/js/comps/healthComp.js';
import InvComp from '/js/comps/invComp.js';
import MovementComp from '/js/comps/movementComp.js';
import { CollisionLayer } from '/js/constants.js';
import PolygonCollider from '/js/ecs/comps/polygonCollider.js';
import Sprite from '/js/ecs/comps/sprite.js';
import Transform from '/js/ecs/comps/transform.js';
import Sys from '/js/ecs/core/sys.js';
import loadImage from '/js/util/loadImage.js';

export class ShooterComp {}

export class ShooterSys extends Sys {
  /**
   * @type {import('/js/ecs/core/sys.js').SysAction}
   */
  update = () => {

  }
}

/**
 * @param {import('js/ecs/core/entMger.js').default} entMger
 * @param {[number, number]} pos
 * @param {number} rot
 */
export async function createShooter(entMger, pos, rot) {
  const polycol = PolygonCollider.fromRect(28, 25);
  polycol.rules.layer = CollisionLayer.ENEMY;
  polycol.rules.mask =
    CollisionLayer.DEFAULT | CollisionLayer.ENEMY | CollisionLayer.PLAYER;

  entMger.addComps(
    entMger.createEnt(),
    new HealthComp(),
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
    new InvComp([]),
    new HazardComp(0, 'enemy', ['enemy']),
  );
}
