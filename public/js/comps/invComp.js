import { wrap } from '../ecs/util/mathplus.js';

export default class InvComp {
  /**
   * @param {InvComp_Item[]} items
   */
  constructor(items) {
    this.items = items;
    this.curItemIdx = 0;
  }

  getNextItem() {
    this.curItemIdx = wrap(this.curItemIdx + 1, 0, this.items.length);
    return this.items[this.curItemIdx];
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
 * @template T
 * @typedef {(
 *   info: {
 *     relT: number,
 *     relDt: number,
 *     entMger: import('../ecs/core/entMger.js').default,
 *     evtBus: import('../ecs/evtBus.js').default,
 *     ent: number,
 *     dir?: import('../ecs/util/vector2d.js').default
 *   },
 * ) => T} InvComp_Item_Action
 */

/**
 * @typedef {InvComp_Item_Action<boolean>} InvComp_Item_CanUseAction
 *
 * @typedef {InvComp_Item_Action<void>} InvComp_Item_UseAction
 */
