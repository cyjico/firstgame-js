import Transform from '../ecs/comps/transform.js';
import { InvComp_Item } from './invComp.js';
import MovementComp from './movementComp.js';
import { DestroyOnOutOfBoundsComp } from './destroyOnOutOfBoundsComp.js';
import { DestroyOnImpact } from './destroyOnImpactComp.js';

export default class RangedWeapon extends InvComp_Item {
  /**
   * @param {string} name
   * @param {Object} opts
   * @param {number} opts.sqrRange
   * @param {number} opts.cooldownMs
   * @param {Object} projOpts
   * @param {number} projOpts.spd
   * @param {number} projOpts.count
   * @param {import('./hazardComp.js').default} projOpts.hazard
   * @param {import('../ecs/comps/sprite.js').default} projOpts.sprite
   * @param {import('../ecs/comps/polygonCollider.js').default} projOpts.collider
   */
  constructor(name, { sqrRange, cooldownMs }, projOpts) {
    super(`RangedWeapon::${name}`);

    this._sqrRange = sqrRange;
    this._cooldownMs = cooldownMs;

    this._projOpts = projOpts;

    this._lastUse = 0;
  }

  /**
   * @type {import('./invComp.js').InvComp_Item_CanUseAction}
   */
  canUse = ({ relT, sqrDir: dirSqr }) =>
    dirSqr.sqrMag() <= this._sqrRange &&
    this._lastUse + this._cooldownMs <= relT;

  /**
   * @type {import('./invComp.js').InvComp_Item_UseAction}
   */
  use = ({ relT, entMger, ent, sqrDir: dirSqr }) => {
    const t = entMger.getComp_t(ent, Transform);
    if (!t) return;

    const dir = dirSqr.normed();
    for (let i = 0; i < this._projOpts.count; i++) {
      createProjectile(entMger, dir, this._projOpts.spd, {
        transform: new Transform([t.pos.x, t.pos.y], Math.atan2(dir.y, dir.x)),
        hazard: this._projOpts.hazard,
        sprite: this._projOpts.sprite,
        collider: this._projOpts.collider,
      });
    }

    this._lastUse = relT;
  };
}

/**
 * @param {import('../ecs/core/entMger.js').default} entMger
 * @param {import("../ecs/util/vector2d.js").default} dir
 * @param {number} spd
 * @param {Object} comps
 * @param {Transform} comps.transform
 * @param {import('../ecs/comps/sprite.js').default} comps.sprite
 * @param {import('../ecs/comps/polygonCollider.js').default} comps.collider
 * @param {import('./hazardComp.js').default} comps.hazard
 */
export function createProjectile(
  entMger,
  dir,
  spd,
  { transform, sprite, collider, hazard },
) {
  entMger.addComps(
    entMger.createEnt(),
    transform,
    sprite,
    collider,
    hazard,
    new MovementComp({
      spd: spd,
      targetDir: dir,
      targetRot: transform.rot,
    }),
    new DestroyOnOutOfBoundsComp(Math.max(sprite.width, sprite.height) * 1.1),
    new DestroyOnImpact(),
  );
}
