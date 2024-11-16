import MovementComp from '../comps/movementComp.js';
import Transform from '../ecs/comps/transform.js';
import Sys from '../ecs/core/sys.js';
import { lerpRot, wrap } from '../ecs/util/mathplus.js';
import Vector2d from '../ecs/util/vector2d.js';

export default class MovementSys extends Sys {
  /**
   * @type {import('../ecs/core/sys.js').SysAction}
   */
  fixedUpdate = ({ entMger, time }) => {
    for (const ent of entMger.getEntsWithComp_t(MovementComp)) {
      const movComp = entMger.getComp_t(ent, MovementComp);
      const t = entMger.getComp_t(ent, Transform);
      if (!movComp || !t) return;

      movComp.__dirDelta__ = Vector2d.lerp(
        movComp.__dirDelta__,
        movComp.targetDir,
        movComp.smoothness * time.fixedDt,
      );

      t.pos.add(movComp.__dirDelta__.cpy().mul(movComp.spd * time.fixedDt));

      movComp.__rotDelta__ = lerpRot(
        movComp.__rotDelta__,
        wrap(movComp.targetRot - t.rot, -Math.PI, Math.PI),
        movComp.rotSmoothness * time.fixedDt,
      );

      t.rot += movComp.__rotDelta__ * movComp.rotSpeed * time.fixedDt;
    }
  };
}
