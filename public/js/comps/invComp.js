export default class InvComp {
  /**
   * @param {InvComp_Item[]} items
   */
  constructor(items) {
    this.items = items;
    this.curItemIdx = 0;
  }

  /**
   * @param {Object} opts
   * @param {string} opts.name
   * @param {InvComp_Item_canUseAction} opts.canUse
   * @param {InvComp_Item_useAction} opts.use
   * @returns {InvComp_Item}
   */
  static createItem({ name, canUse, use }) {
    return {
      name,
      canUse,
      use,
    };
  }
}

/**
 * @typedef {Object} InvComp_Item
 * @prop {string} name
 * @prop {InvComp_Item_canUseAction} canUse
 * @prop {InvComp_Item_useAction} use
 */

/**
 * @typedef {(
 *   t: number,
 *   entMger: import('../ecs/core/entMger.js').default,
 *   ent: number
 * ) => boolean} InvComp_Item_canUseAction
 */

/**
 * @typedef {(
 *   t: number,
 *   entMger: import('../ecs/core/entMger.js').default,
 *   ent: number,
 * ) => void} InvComp_Item_useAction
 */
