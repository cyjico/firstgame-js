import Polygon from '../comps/polygon.js';
import PolygonMaterial from '../comps/polygonMaterial.js';
import Transform from '../comps/transform.js';
import { RendererSlave } from './rendererMaster.js';

export default class PolygonRenderer extends RendererSlave {
  constructor() {
    super();
  }

  /**
   * @type {import('./rendererMaster.js').RendererSlaveAction}
   */
  update = (ctx2d, { entMger }) => {
    const ents = entMger.getEntsWithComp_t(Polygon);
    for (const ent of ents) {
      const polygon = /** @type {Polygon} */ (entMger.getComp_t(ent, Polygon));

      const transform = entMger.getComp_t(ent, Transform);
      if (!transform) continue;

      const npoly = polygon.calcTransformed(transform);

      ctx2d.save();

      const material = entMger.getComp_t(ent, PolygonMaterial);
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
