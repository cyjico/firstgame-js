import HazardComp from '../comps/hazardComp.js';
import HealthComp from '../comps/healthComp.js';
import Polygon2dCollider from '../ecs/comps/polygon2dCollider.js';
import Sys from '../ecs/core/sys.js';

export default class HazardSys extends Sys {
  /** @type {import("../ecs/core/sys.js").SysAction} */
  start = ({ evtBus, entMger }) => {
    evtBus.on(
      'collision_enter',
      /** @type {import('../ecs/systems/polygon2dCollision.js').CollisionEventListener} */
      ({ ent1, ent2 }) => {
        const $ = this.#structurizeEntities(entMger, ent1, ent2);
        if (!$) return;

        $.other.health.curHp -= $.self.hazard.dmg;
        if ($.other.health.curHp <= 0) entMger.destroyEnt($.other_id);
      },
    );
  };

  /**
   * @param {import('../ecs/core/entMger.js').default} entMger
   * @param {number} ent1
   * @param {number} ent2
   */
  #structurizeEntities(entMger, ent1, ent2) {
    let self = ent1;
    let other = ent2;
    let hazard = entMger.getComp_t(self, HazardComp);
    if (!hazard) {
      self = ent2;
      other = ent1;

      hazard = entMger.getComp_t(self, HazardComp);
      if (!hazard) return null;
    }

    const poly2dCol = entMger.getComp_t(self, Polygon2dCollider);
    const other_health = entMger.getComp_t(other, HealthComp);
    if (!poly2dCol || !other_health) return null;

    return {
      self_id: self,
      self: {
        hazard,
        poly2dCol,
      },
      other_id: other,
      other: {
        health: other_health,
      },
    };
  }
}
