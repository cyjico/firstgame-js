import Transform from '../ecs/comps/transform.js';
import HazardComp from './hazardComp.js';
import { InvComp_Item } from './invComp.js';
import MovementComp from './movementComp.js';
import { DestroyOnOutOfBoundsComp } from './destroyOnOutOfBoundsComp.js';
import { DestroyOnImpact } from './destroyOnImpactComp.js';

export default class RangedWeapon extends InvComp_Item {
  /**
   * @param {string} name
   * @param {Object} opts
   * @param {number} opts.range
   * @param {number} opts.dmg
   * @param {number} opts.cooldownMs
   * @param {Object} projOpts
   * @param {number} projOpts.spd
   * @param {number} projOpts.count
   * @param {import('../ecs/comps/sprite.js').default} projOpts.sprite
   * @param {import('../ecs/comps/polygonCollider.js').default} projOpts.collider
   */
  constructor(name, { range, dmg, cooldownMs }, projOpts) {
    super(`RangedWeapon::${name}`);

    this._range = range;
    this._dmg = dmg;
    this._cooldownMs = cooldownMs;

    this._proj = projOpts;

    this._lastUse = 0;
  }

  /**
   * @type {import('./invComp.js').InvComp_Item_CanUseAction}
   */
  canUse = ({ relT }) => this._lastUse + this._cooldownMs <= relT;

  /**
   * @type {import('./invComp.js').InvComp_Item_UseAction}
   */
  use = ({ relT, entMger, ent, dir }) => {
    const t = entMger.getComp_t(ent, Transform);
    if (!dir || !t) return;

    for (let i = 0; i < this._proj.count; i++) {
      createProjectile(entMger, dir, this._proj.spd, {
        transform: new Transform([t.pos.x, t.pos.y], Math.atan2(dir.y, dir.x)),
        sprite: this._proj.sprite,
        collider: this._proj.collider,
        hazard: new HazardComp(this._dmg),
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
 * @param {HazardComp} comps.hazard
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
