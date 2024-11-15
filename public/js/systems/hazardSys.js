import HazardComp from '../comps/hazardComp.js';
import HealthComp from '../comps/healthComp.js';
import Polygon2dCollider, {
  CollisionState,
} from '../ecs/comps/polygon2dCollider.js';
import Sys from '../ecs/core/sys.js';

export default class HazardSys extends Sys {
  /** @type {import("../ecs/core/sys.js").SysAction} */
  fixedUpdate = (ginfo) => {
    for (const ent of ginfo.entMger.getEntsWithComp_t(HazardComp)) {
      const hazard = ginfo.entMger.getComp_t(ent, HazardComp);
      const poly2dCol = ginfo.entMger.getComp_t(ent, Polygon2dCollider);
      if (!hazard || !poly2dCol) return;

      if (
        poly2dCol.curColState & CollisionState.ENTER &&
        poly2dCol.curColInfo.other
      ) {
        const other_health = ginfo.entMger.getComp_t(
          poly2dCol.curColInfo.other,
          HealthComp,
        );
        if (!other_health) return;

        other_health.curHp -= hazard.dmg;
        if (other_health.curHp <= 0)
          ginfo.entMger.destroyEnt(poly2dCol.curColInfo.other);
      }
    }
  };
}
