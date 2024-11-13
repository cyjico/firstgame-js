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
   * @param {import('../ecs/comps/sprite.js').default} opts.sprite
   * @param {InvComp_Item_canUseAction} opts.canUse
   * @param {InvComp_Item_useAction} opts.use
   */
  static createItem({ name, sprite, canUse, use }) {
    return {
      name,
      sprite,
      canUse,
      use,
    };
  }
}

/**
 * @typedef {Object} InvComp_Item
 * @prop {string} name
 * @prop {import('../ecs/comps/sprite.js').default} sprite
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
