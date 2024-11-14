import Transform2d from '../ecs/comps/transform2d.js';
import inputHandler from '../ecs/systems/inputHandler.js';
import HazardComp from './hazardComp.js';
import InvComp from './invComp.js';
import MovementComp from './movementComp.js';

/**
 * @param {Object} opts
 * @param {string} opts.name
 * @param {number} opts.range
 * @param {number} opts.projDmg
 * @param {number} opts.projSpd
 * @param {number} opts.projCount
 * @param {import('../ecs/comps/sprite.js').default} opts.projSprite
 * @param {import('../ecs/comps/polygon2dCollider.js').default} opts.projCollider
 */
export default function createRangedWeapon({
  name,
  projDmg,
  projSpd,
  projCount,
  projSprite,
  projCollider,
}) {
  const _projDmg = projDmg;
  const _projSpd = projSpd;
  const _projCount = projCount;
  const _projSprite = projSprite;
  const _projCollider = projCollider;

  return InvComp.createItem({
    name: `RangedWeapon::${name}`,
    canUse: () => {
      return true;
    },
    use: (t, entMger, ent) => {
      const t2d = entMger.getComp_t(ent, Transform2d);
      if (!t2d) return;

      const dir = inputHandler.mouse.pos.cpy().sub(t2d.pos).normed();
      for (let i = 0; i < _projCount; i++) {
        createProjectile(entMger, dir, _projSpd, [
          new Transform2d([t2d.pos.x, t2d.pos.y], Math.atan2(dir.y, dir.x)),
          _projSprite,
          _projCollider,
          new HazardComp(_projDmg),
        ]);
      }
    },
  });
}

/**
 * @param {import("../ecs/core/entMger.js").default} entMger
 * @param {import("../ecs/util/vector2d.js").default} dir
 * @param {number} spd
 * @param {[
 *   Transform2d,
 *   import('../ecs/comps/sprite.js').default,
 *   import('../ecs/comps/polygon2dCollider.js').default,
 *   HazardComp
 * ]} comps
 */
function createProjectile(entMger, dir, spd, [t2d, sprite, poly2dCod, hdmger]) {
  const movComp = new MovementComp();
  movComp.dir = movComp.targetDir = dir;
  movComp.spd = spd;
  movComp.targetRot = 0;

  entMger.addComps(
    entMger.createEnt(),
    t2d,
    sprite,
    poly2dCod,
    hdmger,
    movComp,
  );
}
