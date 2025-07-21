// EntityCatalog.js - Helper class for managing entity definitions

export class EntityCatalog {
  constructor(catalogData) {
    this.catalog = catalogData || {}
    this.flatIndex = this.buildFlatIndex()
  }

  // Build a flat index for quick lookups
  buildFlatIndex() {
    const index = new Map()

    for (const [category, entities] of Object.entries(this.catalog)) {
      for (const [id, entity] of Object.entries(entities)) {
        index.set(id, {
          ...entity,
          id,
          category,
          type: this.getEntityType(category),
        })
      }
    }

    return index
  }

  getEntityType(category) {
    const typeMap = {
      "objects": "object",
      "npcs": "npc",
      "enemies": "enemy",
      "portals": "portal",
    }
    return typeMap[category] || "object"
  }

  findEntity(entityId) {
    return this.flatIndex.get(entityId) || null
  }

  getEntitiesByCategory(category) {
    const entities = []
    for (const [id, entity] of this.flatIndex.entries()) {
      if (entity.category === category) {
        entities.push(entity)
      }
    }
    return entities
  }

  getAllEntities() {
    return Array.from(this.flatIndex.values())
  }

  getEntityCategories() {
    return Object.keys(this.catalog)
  }

  addCustomEntity(category, id, entityData) {
    if (!this.catalog[category]) {
      this.catalog[category] = {}
    }

    this.catalog[category][id] = entityData

    // Rebuild index
    this.flatIndex = this.buildFlatIndex()
  }

  exportCatalog() {
    return JSON.stringify(this.catalog, null, 2)
  }
}
