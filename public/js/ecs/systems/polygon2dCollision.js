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
 * @param {boolean} isColliding
 * @param {Polygon2dCollider} collider
 */
function updtColState(isColliding, collider) {
  if (isColliding) {
    collider.curColState =
      collider.prevColState & CollisionState.NONE
        ? CollisionState.ENTER
        : CollisionState.COLLIDING;
  } else {
    collider.curColState =
      collider.prevColState & CollisionState.COLLIDING
        ? CollisionState.EXIT
        : CollisionState.NONE;
  }
}

export default class Polygon2dCollision extends Sys {
  constructor(isResolver = false) {
    super();

    this.isResolver = isResolver;
    /**
     * For updating the AABB tree.
     *
     * @type {Set<number>}
     */
    this.prevEnts = new Set();
  }

  /**
   * @type {import('../core/sys.js').SysAction}
   */
  fixedUpdate = (ginfo) => {
    const entMger = ginfo.entMger();

    /** Current frame cache; resets every frame. */
    const fcache = {
      /**
       * Contains the collisions that were already calculated.
       * `main_ent_id => other_ent_id`
       *
       * @type {Map<number, Set<number>>}
       */
      col: new Map(),
      /**
       * Contains the reset'ted collision infos.
       */
      rst: new Set(),
    };

    const curEnts = new Set(entMger.getEntsWithComp_t(Polygon2dCollider));

    const ents = entMger.getEntsWithComp_t(Polygon2dCollider);
    for (const ent1 of ents) {
      const c1 = entMger.getComp_t(ent1, Polygon2dCollider);
      if (!c1) continue;

      const t1 = entMger.getComp_t(ent1, Transform2d);
      if (!t1) continue;

      if (!fcache.rst.has(ent1)) {
        fcache.rst.add(ent1);
        c1.prevColState = c1.curColState;
        updtColState(false, c1);
      }

      const nearbyEnts = entMger.getEntsWithComp_t(Polygon2dCollider);

      for (const ent2 of nearbyEnts) {
        if (
          ent1 === ent2 ||
          fcache.col.get(ent1)?.has(ent2) ||
          fcache.col.get(ent2)?.has(ent1)
        )
          continue;

        const c2 = entMger.getComp_t(ent2, Polygon2dCollider);
        const t2 = entMger.getComp_t(ent2, Transform2d);
        if (!c2 || !t2) continue;

        // Save as having been calculated already.
        if (!fcache.col.has(ent1)) fcache.col.set(ent1, new Set());
        fcache.col.get(ent1)?.add(ent2);

        if (
          (c1.rules.mask & c2.rules.layer) === 0 &&
          (c2.rules.mask & c1.rules.layer) === 0
        )
          continue;

        if (!testBoundsBounds(c1.calcAabb(t1), c2.calcAabb(t2))) continue;

        const tc1 = c1.calcTransformed(t1);
        const tc2 = c2.calcTransformed(t2);

        const mtv = calcMinTranslationVec(tc1, tc2);
        if (mtv) {
          updtColState(true, c1);

          if (!fcache.rst.has(ent1)) {
            fcache.rst.add(ent1);
            c1.prevColState = c1.curColState;
            updtColState(true, c2);
          }

          c1.curColInfo.mtv = mtv;
          c2.curColInfo.mtv = mtv.negate();

          if (this.isResolver) {
            const mtvHalf = mtv.clone().mul(0.5);
            t1.pos.add(mtvHalf);
            t2.pos.sub(mtvHalf);
          }
        }
      }
    }

    this.prevEnts = curEnts;
  };
}
