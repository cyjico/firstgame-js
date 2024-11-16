export default class InvComp {
  /**
   * @param {InvComp_Item[]} items
   */
  constructor(items) {
    this.items = items;
    this.curItemIdx = 0;
  }
}

export class InvComp_Item {
  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * @type {InvComp_Item_CanUseAction}
   * @abstract
   */
  canUse = () => {
    throw new Error('canUse() must be implemented by a subclass');
  };

  /**
   * @type {InvComp_Item_UseAction}
   * @abstract
   */
  use = () => {
    throw new Error('use() must be implemented by a subclass');
  };
}

/**
 * @typedef {(
 *   info: {
 *     t: number,
 *     entMger: import('../ecs/core/entMger.js').default,
 *     evtBus: import('../ecs/evtBus.js').default,
 *   },
 *   ent: number
 * ) => boolean} InvComp_Item_CanUseAction
 */

/**
 * @typedef {(
 *   info: {
 *     t: number,
 *     entMger: import('../ecs/core/entMger.js').default,
 *     evtBus: import('../ecs/evtBus.js').default,
 *   },
 *   ent: number
 * ) => void} InvComp_Item_UseAction
 */
