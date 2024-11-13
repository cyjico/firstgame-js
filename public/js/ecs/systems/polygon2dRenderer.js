import Polygon2d from '../comps/polygon2d.js';
import Polygon2dMaterial from '../comps/polygon2dMaterial.js';
import Transform2d from '../comps/transform2d.js';
import { RendererSlave } from './rendererMaster.js';

export default class Polygon2dRenderer extends RendererSlave {
  constructor() {
    super();
  }

  /**
   * @type {import('./rendererMaster.js').RendererSlaveAction}
   */
  update = (ctx2d, ginfo) => {
    const ents = ginfo.entMger.getEntsWithComp_t(Polygon2d);
    for (const ent of ents) {
      const polygon = /** @type {Polygon2d} */ (
        ginfo.entMger.getComp_t(ent, Polygon2d)
      );

      const transform = ginfo.entMger.getComp_t(ent, Transform2d);
      if (!transform) continue;

      const npoly = polygon.calcTransformed(transform);

      ctx2d.save();

      const material = ginfo.entMger.getComp_t(ent, Polygon2dMaterial);
      if (material) material.setStyling(ctx2d);

      ctx2d.beginPath();

      ctx2d.moveTo(npoly.verts[0].x, npoly.verts[0].y);

      for (let i = 1; i < npoly.verts.length; i++) {
        ctx2d.lineTo(npoly.verts[i].x, npoly.verts[i].y);
      }

      ctx2d.lineTo(npoly.verts[0].x, npoly.verts[0].y);

      ctx2d.fill();
      ctx2d.stroke();

      ctx2d.closePath();
      ctx2d.restore();
    }
  };
}
