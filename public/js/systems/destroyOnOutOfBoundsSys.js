import { DestroyOnOutOfBoundsComp } from '../comps/destroyOnOutOfBoundsComp.js';
import Transform from '../ecs/comps/transform.js';
import Sys from '../ecs/core/sys.js';

export default class DestroyOnOutOfBoundsSys extends Sys {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super();
    this.canvas = canvas;
  }

  /**
   * @type {import('../ecs/core/sys.js').SysAction}
   */
  update = ({ entMger }) => {
    for (const ent of entMger.getEntsWithComp_t(DestroyOnOutOfBoundsComp)) {
      const obComp = entMger.getComp_t(ent, DestroyOnOutOfBoundsComp);
      const t = entMger.getComp_t(ent, Transform);
      if (!obComp || !t) continue;

      if (
        t.pos.x < -obComp.size ||
        t.pos.x > this.canvas.width + obComp.size ||
        t.pos.y < -obComp.size ||
        t.pos.y > this.canvas.height + obComp.size
      )
        entMger.destroyEnt(ent);
    }
  };
}
