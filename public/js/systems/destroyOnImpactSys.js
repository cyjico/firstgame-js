import { DestroyOnImpact } from '../comps/destroyOnImpactComp.js';
import Sys from '../ecs/core/sys.js';

export default class DestroyOnImpactSys extends Sys {
  /**
   * @type {import('../ecs/core/sys.js').SysAction}
   */
  start = ({ evtBus, entMger }) => {
    evtBus.on(
      'collision_enter',
      /** @type {import('../ecs/systems/polygonCollision.js').CollisionEventListener} */
      ({ ent1, ent2 }) => {
        this.#applyDestroyOnImpact(entMger, ent1);
        this.#applyDestroyOnImpact(entMger, ent2);
      },
    );
  };

  /**
   * @param {import('../ecs/core/entMger.js').default} entMger
   * @param {number} ent
   */
  #applyDestroyOnImpact(entMger, ent) {
    if (entMger.getComp_t(ent, DestroyOnImpact)) entMger.destroyEnt(ent);
  }
}
