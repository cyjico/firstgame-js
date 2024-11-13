import { OutOfBoundsComp } from '../comps/outOfBoundsComp.js';
import Transform2d from '../ecs/comps/transform2d.js';
import Sys from '../ecs/core/sys.js';

export default class BoundaryCheckSys extends Sys {
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
  update = (ginfo) => {
    for (const ent of ginfo.entMger.getEntsWithComp_t(OutOfBoundsComp)) {
      const obComp = ginfo.entMger.getComp_t(ent, OutOfBoundsComp);
      const t2d = ginfo.entMger.getComp_t(ent, Transform2d);
      if (!obComp || !t2d) continue;

      if (
        t2d.pos.x < -obComp.size ||
        t2d.pos.x > this.canvas.width + obComp.size ||
        t2d.pos.y < -obComp.size ||
        t2d.pos.y > this.canvas.height + obComp.size
      )
        ginfo.entMger.destroyEnt(ent);
    }
  };
}
