export default class HealthComp {
  /**
   * @param {number} [hp]
   */
  constructor(hp = 100) {
    this.curHp = this.maxHp = hp;
  }
}
