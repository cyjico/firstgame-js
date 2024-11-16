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
   * @param {number} [opts.cooldownMs]
   */
  constructor({ sqrRadius = 35 * 35, cooldownMs = 500 } = {}) {
    this.sqrRadius = sqrRadius;
    this.cooldownMs = cooldownMs;

    this.bias = Math.random();
  }

  isCooldown = false;
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

        if (chaser) this.#applyCooldown(chaser);
      },
    );
  };

  /**
   * @param {ChaserComp} chaser
   */
  #applyCooldown(chaser) {
    if (chaser.isCooldown) return;

    chaser.isCooldown = true;
    setTimeout(() => {
      chaser.isCooldown = false;
    }, chaser.cooldownMs);
  }

  /** @type {import('js/ecs/core/sys.js').SysAction} */
  update = ({ entMger }) => {
    const player_ent = entMger.getEntsWithComp_t(PlayerComp).next().value;
    if (player_ent == null) return;

    const player_t = entMger.getComp_t(player_ent, Transform);
    const player_col = entMger.getComp_t(player_ent, PolygonCollider);
    if (!player_t || !player_col) return;

    for (const ent of entMger.getEntsWithComp_t(ChaserComp)) {
      const chaser = entMger.getComp_t(ent, ChaserComp);
      const t = entMger.getComp_t(ent, Transform);
      const mv = entMger.getComp_t(ent, MovementComp);
      const col = entMger.getComp_t(ent, PolygonCollider);
      if (!chaser || !t || !mv || !col) continue;

      if (
        chaser.isCooldown ||
        player_t.pos.cpy().sub(t.pos).sqrMag() <= chaser.sqrRadius
      ) {
        mv.targetDir = Vector2d.perpendicular(
          player_t.pos.cpy().sub(t.pos).norm(),
        ).mul(-1 + 2 * Math.round(chaser.bias));
        continue;
      }

      mv.targetDir = player_t.pos.cpy().sub(t.pos).norm();
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
