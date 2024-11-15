export default class HazardComp {
  /**
   * @param {number} dmg
   * @param {string} [tag]
   * @param {string[]} [excludeTags]
   */
  constructor(dmg, tag = '', excludeTags = []) {
    this.dmg = dmg;
    this.tag = tag;
    this.excludeTags = new Set(excludeTags);
  }
}
