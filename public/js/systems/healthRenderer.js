import HealthComp from '../comps/healthComp.js';
import Transform from '../ecs/comps/transform.js';
import { RendererSlave } from '../ecs/systems/rendererMaster.js';

export default class HealthRenderer extends RendererSlave {
  /**
   * @type {import("../ecs/systems/rendererMaster.js").RendererSlaveAction}
   */
  update = (ctx2d, { entMger }) => {
    for (const ent of entMger.getEntsWithComp_t(HealthComp)) {
      const health = entMger.getComp_t(ent, HealthComp);
      const t = entMger.getComp_t(ent, Transform);
      if (!health || !t) return;

      ctx2d.fillStyle = 'black';
      ctx2d.fillRect(t.pos.x - 20, t.pos.y + 20, 40, 3);

      ctx2d.fillStyle = 'red';
      ctx2d.fillRect(
        t.pos.x - 20,
        t.pos.y + 20,
        (health.curHp / health.maxHp) * 40,
        3,
      );
    }
  };
}
