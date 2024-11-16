import { PlayerComp } from '../player.js';
import HazardComp from '/js/comps/hazardComp.js';
import HealthComp from '/js/comps/healthComp.js';
import MovementComp from '/js/comps/movementComp.js';
import { CollisionLayer } from '/js/constants.js';
import PolygonCollider from '/js/ecs/comps/polygonCollider.js';
import Sprite from '/js/ecs/comps/sprite.js';
import Transform from '/js/ecs/comps/transform.js';
import Sys from '/js/ecs/core/sys.js';
import Vector2d from '/js/ecs/util/vector2d.js';
import loadImage from '/js/util/loadImage.js';

export class ChaserComp {
  /**
   * @param {Object} [opts]
   * @param {number} [opts.sqrRadius]
   * @param {number} [opts.damagedMs]
   */
  constructor({ sqrRadius = 35 * 35, damagedMs = 500 } = {}) {
    this.sqrRadius = sqrRadius;
    this.damagedMs = damagedMs;

    this.bias = Math.random();
  }

  wasDamaged = false;
}

export class ChaserSys extends Sys {
  /** @type {import('js/ecs/core/sys.js').SysAction} */
  start = ({ entMger, evtBus }) => {
    evtBus.on(
      'apply_hazard',
      /** @type {import('systems/hazardSys.js').HazardEventListener} */
      ({ ent1, ent2 }) => {
        const chaser =
          entMger.getComp_t(ent1, ChaserComp) ||
          entMger.getComp_t(ent2, ChaserComp);

        if (chaser) this.#applyDamagedTimeout(chaser);
      },
    );
  };

  /**
   * @param {ChaserComp} chaser
   */
  #applyDamagedTimeout(chaser) {
    if (chaser.wasDamaged) return;

    chaser.wasDamaged = true;
    setTimeout(() => {
      chaser.wasDamaged = false;
    }, chaser.damagedMs);
  }

  /** @type {import('js/ecs/core/sys.js').SysAction} */
  update = ({ entMger }) => {
    const player_ent = entMger.getEntsWithComp_t(PlayerComp).next().value;
    if (player_ent == null) return;

    const player_t = entMger.getComp_t(player_ent, Transform);
    if (!player_t) return;

    for (const ent of entMger.getEntsWithComp_t(ChaserComp)) {
      const chaser = entMger.getComp_t(ent, ChaserComp);
      const t = entMger.getComp_t(ent, Transform);
      const mv = entMger.getComp_t(ent, MovementComp);
      if (!chaser || !t || !mv) continue;

      if (chaser.wasDamaged) {
        mv.targetDir = Vector2d.perpendicular(
          player_t.pos.cpy().sub(t.pos).norm().neg(),
        ).mul(-1 + 2 * Math.round(chaser.bias));
      } else if (player_t.pos.cpy().sub(t.pos).sqrMag() <= chaser.sqrRadius) {
        mv.targetDir = Vector2d.perpendicular(
          player_t.pos.cpy().sub(t.pos).norm(),
        ).mul(-1 + 2 * Math.round(chaser.bias));
      } else {
        mv.targetDir = player_t.pos.cpy().sub(t.pos).norm();
      }

      mv.targetRot = Math.atan2(mv.targetDir.y, mv.targetDir.x);
    }
  };
}

/**
 * @param {import('js/ecs/core/entMger.js').default} entMger
 * @param {[number, number]} pos
 * @param {number} rot
 */
export async function createChaser(entMger, pos, rot) {
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
        'https://upload.wikimedia.org/wikipedia/commons/0/01/THESCARYGUY2011B400.jpg',
      ),
      width: 28,
      height: 25,
      offrot: Math.PI / 2,
    }),
    new MovementComp(),
    new ChaserComp(),
    new HazardComp(25, 'enemy', ['enemy']),
  );
}
