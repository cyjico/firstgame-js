import HealthComp from '../comps/healthComp.js';
import Transform2d from '../ecs/comps/transform2d.js';
import { RendererSlave } from '../ecs/systems/rendererMaster.js';

export default class HealthRenderer extends RendererSlave {
  /**
   * @type {import("../ecs/systems/rendererMaster.js").RendererSlaveAction}
   */
  update = (ctx2d, { entMger }) => {
    for (const ent of entMger.getEntsWithComp_t(HealthComp)) {
      const hcomp = entMger.getComp_t(ent, HealthComp);
      const t2d = entMger.getComp_t(ent, Transform2d);
      if (!hcomp || !t2d) return;

      ctx2d.fillStyle = 'black';
      ctx2d.fillRect(t2d.pos.x - 20, t2d.pos.y + 20, 40, 3);

      ctx2d.fillStyle = 'red';
      ctx2d.fillRect(
        t2d.pos.x - 20,
        t2d.pos.y + 20,
        (hcomp.curHp / hcomp.maxHp) * 40,
        3,
      );
    }
  };
}
