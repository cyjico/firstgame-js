import PolygonCollider, { CollisionState } from '../comps/polygonCollider.js';
import Transform from '../comps/transform.js';
import Sys from '../core/sys.js';
import {
  calcMinTranslationVec,
  testBoundsBounds,
} from './polygonCollision.util.js';

/**
 * @typedef {(data: {
 *   mtv: import('../util/vector2d.js').default,
 *   ent1: number,
 *   ent2: number
 * }) => void} CollisionEventListener
 */

/**
 * @param {number} prevState
 * @param {boolean} isColliding
 */
function getNewState(prevState, isColliding) {
  if (isColliding) {
    if (prevState === CollisionState.NONE) return CollisionState.ENTER;

    return CollisionState.STAY;
  }

  if (prevState === CollisionState.STAY) return CollisionState.EXIT;

  return CollisionState.NONE;
}

export default class PolygonCollision extends Sys {
  constructor(isResolver = false) {
    super();

    this.isResolver = isResolver;
  }

  /**
   * @type {import('../core/sys.js').SysAction}
   */
  fixedUpdate = ({ entMger, evtBus }) => {
    /**
     * Contains the collisions that were already calculated.
     * `main_ent_id => other_ent_id`
     *
     * @type {Map<number, Set<number>>}
     */
    const wasCalculated = new Map();

    for (const ent1 of entMger.getEntsWithComp_t(PolygonCollider)) {
      const col1 = entMger.getComp_t(ent1, PolygonCollider);
      if (!col1) continue;

      const t1 = entMger.getComp_t(ent1, Transform);
      if (!t1) continue;

      const nearbyEnts = entMger.getEntsWithComp_t(PolygonCollider);
      for (const ent2 of nearbyEnts) {
        if (ent1 === ent2 || wasCalculated.get(ent1)?.has(ent2)) {
          continue;
        }

        const col2 = entMger.getComp_t(ent2, PolygonCollider);
        const t2 = entMger.getComp_t(ent2, Transform);
        if (!col2 || !t2) continue;

        // Cache ent1 and ent2 interaction as having been calculated already.
        if (!wasCalculated.get(ent1)?.add(ent2))
          wasCalculated.set(ent1, new Set([ent2]));
        if (!wasCalculated.get(ent2)?.add(ent1))
          wasCalculated.set(ent2, new Set([ent1]));

        const mtv = this.calcCollision(col1, t1, col2, t2);

        if (!mtv) {
          col1.trySetInfo(ent2, {
            mtv: null,
            other: ent2,
            state: getNewState(col1.tryGetInfo(ent2).state, false),
          });
          col2.trySetInfo(ent1, {
            mtv: null,
            other: ent1,
            state: getNewState(col2.tryGetInfo(ent1).state, false),
          });
          continue;
        }

        const info1 = {
          mtv: mtv.cpy(),
          other: ent2,
          state: getNewState(col1.tryGetInfo(ent2).state, true),
        };
        col1.trySetInfo(ent2, info1);

        const info2 = {
          mtv: mtv.cpy().neg(),
          other: ent1,
          state: getNewState(col2.tryGetInfo(ent1).state, true),
        };
        col2.trySetInfo(ent1, info2);

        evtBus.emit(`collision_${CollisionState.toString(info1.state)}`, {
          mtv,
          ent1,
          ent2,
        });

        if (this.isResolver && !col1.rules.phantom && !col2.rules.phantom) {
          const mtvHalf = mtv.cpy().mul(0.8);
          t1.pos.add(mtvHalf);
          t2.pos.sub(mtvHalf);
        }
      }
    }
  };

  /**
   * @param {PolygonCollider} col1
   * @param {Transform} t1
   * @param {PolygonCollider} col2
   * @param {Transform} t2
   */
  calcCollision(col1, t1, col2, t2) {
    if (
      ((col1.rules.mask & col2.rules.layer) === 0 &&
        (col2.rules.mask & col1.rules.layer) === 0) ||
      !testBoundsBounds(col1.calcAabb(t1), col2.calcAabb(t2))
    )
      return null;

    return calcMinTranslationVec(
      col2.calcTransformed(t2),
      col1.calcTransformed(t1),
    );
  }
}
