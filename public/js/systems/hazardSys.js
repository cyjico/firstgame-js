import HazardComp from '../comps/hazardComp.js';
import HealthComp from '../comps/healthComp.js';
import Polygon2dCollider, {
  CollisionState,
} from '../ecs/comps/polygon2dCollider.js';
import Sys from '../ecs/core/sys.js';

export default class HazardSys extends Sys {
  /** @type {import("../ecs/core/sys.js").SysAction} */
  fixedUpdate = ({ entMger }) => {
    for (const ent of entMger.getEntsWithComp_t(HazardComp)) {
      const hazard = entMger.getComp_t(ent, HazardComp);
      const poly2dCol = entMger.getComp_t(ent, Polygon2dCollider);
      if (!hazard || !poly2dCol) return;

      if (
        poly2dCol.info.state & CollisionState.ENTER &&
        poly2dCol.info.otherEntId
      ) {
        const other_health = entMger.getComp_t(ent, HealthComp);
        if (!other_health) return;

        other_health.curHp -= hazard.dmg;
        if (other_health.curHp <= 0)
          entMger.destroyEnt(poly2dCol.info.otherEntId);
      }
    }
  };
}
