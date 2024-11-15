import Polygon2dCollider, {
  CollisionState,
} from '../comps/polygon2dCollider.js';
import Transform2d from '../comps/transform2d.js';
import Sys from '../core/sys.js';
import {
  calcMinTranslationVec,
  testBoundsBounds,
} from './polygon2dCollision.util.js';

/**
 * @param {number} prevState
 * @param {boolean} isColliding
 */
function getNewState(prevState, isColliding) {
  if (isColliding) {
    return prevState & CollisionState.NONE
      ? CollisionState.ENTER
      : CollisionState.STAY;
  }

  return prevState & CollisionState.STAY
    ? CollisionState.EXIT
    : CollisionState.NONE;
}

export default class Polygon2dCollision extends Sys {
  constructor(isResolver = false) {
    super();

    this.isResolver = isResolver;
  }

  /**
   * @type {import('../core/sys.js').SysAction}
   */
  fixedUpdate = ({ entMger }) => {
    /**
     * Current frame cache; resets every frame.
     */
    const fcache = {
      /**
       * Contains the collisions that were already calculated.
       * `main_ent_id => other_ent_id`
       *
       * @type {Map<number, Set<number>>}
       */
      col: new Map(),
      /**
       * Contains the reset[ted] collision infos.
       */
      rst: new Set(),
    };

    for (const ent1 of entMger.getEntsWithComp_t(Polygon2dCollider)) {
      const col1 = entMger.getComp_t(ent1, Polygon2dCollider);
      if (!col1) continue;

      const t1 = entMger.getComp_t(ent1, Transform2d);
      if (!t1) continue;

      // Reset ent1 if ent1 wasn't reset[ted] in the current frame.
      if (!fcache.rst.has(ent1)) {
        fcache.rst.add(ent1);
        col1.info.prevState = col1.info.state;
        col1.info.state = getNewState(col1.info.prevState, false);
      }

      const nearbyEnts = entMger.getEntsWithComp_t(Polygon2dCollider);
      for (const ent2 of nearbyEnts) {
        if (ent1 === ent2 || fcache.col.get(ent1)?.has(ent2)) continue;

        const col2 = entMger.getComp_t(ent2, Polygon2dCollider);
        const t2 = entMger.getComp_t(ent2, Transform2d);
        if (!col2 || !t2) continue;

        // Cache ent1 and ent2 interaction as having been calculated already.
        if (!fcache.col.get(ent1)?.add(ent2))
          fcache.col.set(ent1, new Set([ent2]));
        if (!fcache.col.get(ent2)?.add(ent1))
          fcache.col.set(ent2, new Set([ent1]));

        if (
          (col1.rules.mask & col2.rules.layer) === 0 &&
          (col2.rules.mask & col1.rules.layer) === 0
        )
          continue;

        if (!testBoundsBounds(col1.calcAabb(t1), col2.calcAabb(t2))) continue;

        const tc1 = col1.calcTransformed(t1);
        const tc2 = col2.calcTransformed(t2);

        const mtv = calcMinTranslationVec(tc1, tc2);
        if (mtv) {
          col1.info.state = getNewState(col1.info.prevState, true);
          col1.info.otherEntId = ent2;
          col1.info.mtv = mtv;

          // Reset ent2 if ent2 wasn't reset[ted] in the current frame.
          if (!fcache.rst.has(ent2)) {
            fcache.rst.add(ent2);
            col2.info.prevState = col2.info.state;
          }
          
          col2.info.state = getNewState(col1.info.prevState, true);
          col2.info.otherEntId = ent1;
          col2.info.mtv = mtv.neg();

          if (this.isResolver && !col1.rules.phantom && !col2.rules.phantom) {
            const mtvHalf = mtv.cpy().mul(0.5);
            t1.pos.add(mtvHalf);
            t2.pos.sub(mtvHalf);
          }
        }
      }
    }
  };
}
