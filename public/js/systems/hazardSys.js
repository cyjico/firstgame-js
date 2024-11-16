import HazardComp from '../comps/hazardComp.js';
import HealthComp from '../comps/healthComp.js';
import Sys from '../ecs/core/sys.js';

/**
 * @typedef {(data: {
 *   ent1: number,
 *   ent2: number
 * }) => void} HazardEventListener
 */

export default class HazardSys extends Sys {
  /** @type {import("../ecs/core/sys.js").SysAction} */
  start = ({ evtBus, entMger }) => {
    evtBus.on(
      'collision_enter',
      /** @type {import('../ecs/systems/polygonCollision.js').CollisionEventListener} */
      ({ ent1, ent2 }) => {
        if (
          this.#applyHazard(entMger, ent1, ent2) ||
          this.#applyHazard(entMger, ent2, ent1)
        )
          evtBus.emit('apply_hazard', {
            ent1,
            ent2,
          });
      },
    );
  };

  /**
   * @param {import('../ecs/core/entMger.js').default} entMger
   * @param {number} selfId Entity applying the hazard.
   * @param {number} otherId Entity receiving the hazard.
   */
  #applyHazard(entMger, selfId, otherId) {
    const hazard = entMger.getComp_t(selfId, HazardComp);
    const other_health = entMger.getComp_t(otherId, HealthComp);
    if (!hazard || !other_health) return false;

    const other_hazard = entMger.getComp_t(otherId, HazardComp);
    if (other_hazard && hazard.excludeTags.has(other_hazard.tag)) return false;

    other_health.curHp -= hazard.dmg;

    if (other_health.curHp <= 0) entMger.destroyEnt(otherId);
    return true;
  }
}
