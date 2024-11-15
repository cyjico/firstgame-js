import MovementComp from '../comps/movementComp.js';
import Transform2d from '../ecs/comps/transform2d.js';
import Sys from '../ecs/core/sys.js';
import { lerp } from '../ecs/util/mathplus.js';
import Vector2d from '../ecs/util/vector2d.js';

export default class MovementSys extends Sys {
  /**
   * @type {import('../ecs/core/sys.js').SysAction}
   */
  fixedUpdate = ({ entMger, time }) => {
    for (const ent of entMger.getEntsWithComp_t(MovementComp)) {
      const movComp = entMger.getComp_t(ent, MovementComp);
      const t2d = entMger.getComp_t(ent, Transform2d);
      if (!movComp || !t2d) return;

      movComp.dir = Vector2d.lerp(
        movComp.dir,
        movComp.targetDir,
        movComp.smoothness * time.fixedDt,
      );

      t2d.pos.add(movComp.dir.cpy().mul(movComp.spd * time.fixedDt));

      movComp.rot = lerp(
        movComp.rot,
        movComp.targetRot,
        movComp.rotSmoothness * time.fixedDt,
      );

      t2d.rot += movComp.rot * movComp.rotSpeed * time.fixedDt;
    }
  };
}
