/**
 * Manages entity creation, destruction, and their components.
 */
export default class EntMger {
  /**
   * `ent_id => comps => comp_instance`
   *
   * @type {Map<number, Map<string, InstanceType<any>>>}
   */
  #ent_CompsMap = new Map();

  /**
   * `comp => ent_id`
   *
   * @type {Map<string, Set<number>>}
   */
  #comp_EntsMap = new Map();

  /** @type {number[]} */
  #freeEntIds = [];
  #nextEntId = 0;

  /**
   * @returns {number} Created/reused entity ID.
   */
  createEnt() {
    const entityId = this.#freeEntIds.pop() ?? this.#nextEntId++;
    this.#ent_CompsMap.set(entityId, new Map());

    return entityId;
  }

  /**
   * @param {number} entityId
   */
  destroyEnt(entityId) {
    // Remove entity from components map and component-to-entity map
    if (!this.#ent_CompsMap.has(entityId)) return false;

    // Remove from the component-to-entity map
    const components = this.#ent_CompsMap.get(entityId);

    for (const compName in components)
      this.#comp_EntsMap.get(compName)?.delete(entityId);

    this.#ent_CompsMap.delete(entityId);
    this.#freeEntIds.push(entityId);
    return true;
  }

  /**
   * @template {object} T
   * @param {number} entityId
   * @param {T} component
   * @throws Component must have a constructor that isn't `Object`.
   */
  addComp(entityId, component) {
    // Get component name.
    let componentName = '';

    if (component.constructor.name === 'Object') {
      throw new TypeError(
        `Adding a component with constructor "Object" is not allowed. (ent:${entityId}).`,
      );
    }

    componentName = component.constructor.name;

    // Add component to entity-to-components map
    let components = this.#ent_CompsMap.get(entityId);
    if (!components) {
      components = new Map();
      this.#ent_CompsMap.set(entityId, components);
    }

    components.set(componentName, component);

    // Add entity to component-to-entity map
    if (!this.#comp_EntsMap.has(componentName))
      this.#comp_EntsMap.set(componentName, new Set());

    this.#comp_EntsMap.get(componentName)?.add(entityId);

    return this;
  }

  /**
   * @param {number} entityId
   * @param {...object} components
   */
  addComps(entityId, ...components) {
    for (let i = 0; i < components.length; i++) {
      this.addComp(entityId, components[i]);
    }

    return this;
  }

  /**
   * @param {number} entityId
   * @param {string} componentName
   */
  removeComp(entityId, componentName) {
    // Remove component from entity-to-components map
    this.#ent_CompsMap.get(entityId)?.delete(componentName);

    // Remove component from component-to-entity map
    this.#comp_EntsMap.delete(componentName);
  }

  /**
   * @param {number} entityId
   * @param {string} componentName
   * @returns {object | null}
   */
  getComp(entityId, componentName) {
    const comps = this.#ent_CompsMap.get(entityId);
    return comps?.get(componentName) ?? null;
  }

  /**
   * @template {Function} T
   * @param {number} entityId
   * @param {T} component
   * @returns {InstanceType<T> | null}
   */
  getComp_t(entityId, component) {
    const comps = this.#ent_CompsMap.get(entityId);
    return comps?.get(component.name) ?? null;
  }

  /**
   * @param {string} componentName
   * @return {SetIterator<number>}
   */
  getEntsWithComp(componentName) {
    const entities = this.#comp_EntsMap.get(componentName);
    return entities?.values() ?? new Set().values();
  }

  /**
   * @template {Function} T
   * @param {T} component
   * @return {SetIterator<number>}
   */
  getEntsWithComp_t(component) {
    return this.getEntsWithComp(component.name);
  }
}
