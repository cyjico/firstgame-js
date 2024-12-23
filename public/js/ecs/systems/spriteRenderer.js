import Sprite from '../comps/sprite.js';
import Transform from '../comps/transform.js';
import { RendererSlave } from './rendererMaster.js';

export default class SpriteRenderer extends RendererSlave {
  constructor() {
    super();
  }

  /**
   * @type {import('./rendererMaster.js').RendererSlaveAction}
   */
  update = (ctx2d, { entMger }) => {
    if (!ctx2d) {
      console.warn(`Tried rendering but failed.`);
      return;
    }

    const ents = entMger.getEntsWithComp_t(Sprite);
    for (const ent of ents) {
      const spr = /** @type {Sprite} */ (entMger.getComp_t(ent, Sprite));

      const t = entMger.getComp_t(ent, Transform);
      if (!t || !spr.img) continue;

      ctx2d.save();

      const tmat = t.getLocalToWorldMatrix();
      ctx2d.transform(
        tmat.m00,
        tmat.m10,
        tmat.m01,
        tmat.m11,
        tmat.m02,
        tmat.m12,
      );

      const sprmat = spr.getOffsetTransformationMatrix();
      ctx2d.transform(
        sprmat.m00,
        sprmat.m10,
        sprmat.m01,
        sprmat.m11,
        sprmat.m02,
        sprmat.m12,
      );

      ctx2d.drawImage(
        spr.img,
        spr.width * -0.5,
        spr.height * -0.5,
        spr.width,
        spr.height,
      );

      ctx2d.restore();
    }
  };
}
