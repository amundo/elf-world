// Enhanced terrain generation for GameWorld.js

class TerrainGenerator {
  constructor(config) {
    this.config = config
    this.seed = Math.random() * 1000
  }

  // Simple noise function (simplified Perlin noise)
  noise(x, y, scale = 0.1) {
    const n = Math.sin(x * scale + this.seed) * Math.cos(y * scale + this.seed)
    return (n + 1) / 2 // Normalize to 0-1
  }

  // Generate coherent terrain using noise
  generateCoherentTerrain(realm, rows, cols) {
    const terrain = realm.terrain
    const terrainMap = Array.from({ length: rows }, () => Array(cols).fill(null))
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const noiseValue = this.noise(x, y, 0.2)
        
        if (noiseValue < terrain.accent.weight) {
          terrainMap[y][x] = terrain.accent.color
        } else if (noiseValue < terrain.accent.weight + terrain.secondary.weight) {
          terrainMap[y][x] = terrain.secondary.color
        } else {
          terrainMap[y][x] = terrain.primary.color
        }
      }
    }
    
    return terrainMap
  }

  // Generate terrain with features (rivers, paths, clearings)
  generateWithFeatures(realm, rows, cols) {
    // Start with base terrain
    const terrainMap = this.generateCoherentTerrain(realm, rows, cols)
    
    // Add features if defined
    if (realm.terrain.features) {
      for (const feature of realm.terrain.features) {
        this.addFeature(terrainMap, feature, rows, cols)
      }
    }
    
    return terrainMap
  }

  addFeature(terrainMap, feature, rows, cols) {
    switch (feature.type) {
      case 'river':
        this.addRiver(terrainMap, feature, rows, cols)
        break
      case 'path':
        this.addPath(terrainMap, feature, rows, cols)
        break
      case 'clearing':
        this.addClearing(terrainMap, feature, rows, cols)
        break
    }
  }

  addRiver(terrainMap, feature, rows, cols) {
    const width = feature.width || 1
    const color = feature.color
    
    if (feature.direction === 'horizontal') {
      const riverY = Math.floor(rows / 2)
      for (let x = 0; x < cols; x++) {
        for (let w = 0; w < width; w++) {
          const y = riverY + w - Math.floor(width / 2)
          if (y >= 0 && y < rows) {
            terrainMap[y][x] = color
          }
        }
      }
    } else if (feature.direction === 'vertical') {
      const riverX = Math.floor(cols / 2)
      for (let y = 0; y < rows; y++) {
        for (let w = 0; w < width; w++) {
          const x = riverX + w - Math.floor(width / 2)
          if (x >= 0 && x < cols) {
            terrainMap[y][x] = color
          }
        }
      }
    }
  }

  addPath(terrainMap, feature, rows, cols) {
    const color = feature.color
    const width = feature.width || 1
    
    // Simple path from center to edges
    const centerX = Math.floor(cols / 2)
    const centerY = Math.floor(rows / 2)
    
    // Horizontal path
    for (let x = 0; x < cols; x++) {
      terrainMap[centerY][x] = color
    }
    
    // Vertical path
    for (let y = 0; y < rows; y++) {
      terrainMap[y][centerX] = color
    }
  }

  addClearing(terrainMap, feature, rows, cols) {
    const radius = feature.radius || 2
    const color = feature.color
    const count = feature.count || 1
    
    for (let i = 0; i < count; i++) {
      const centerX = Math.floor(Math.random() * cols)
      const centerY = Math.floor(Math.random() * rows)
      
      for (let y = Math.max(0, centerY - radius); y <= Math.min(rows - 1, centerY + radius); y++) {
        for (let x = Math.max(0, centerX - radius); x <= Math.min(cols - 1, centerX + radius); x++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
          if (distance <= radius) {
            terrainMap[y][x] = color
          }
        }
      }
    }
  }

  // Cellular automata for cave-like patterns
  generateCavePattern(realm, rows, cols, iterations = 3) {
    let grid = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => Math.random() > 0.45)
    )
    
    for (let i = 0; i < iterations; i++) {
      grid = this.smoothGrid(grid, rows, cols)
    }
    
    // Convert boolean grid to colors
    const terrainMap = Array.from({ length: rows }, () => Array(cols).fill(null))
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        terrainMap[y][x] = grid[y][x] 
          ? realm.terrain.primary.color 
          : realm.terrain.secondary.color
      }
    }
    
    return terrainMap
  }

  smoothGrid(grid, rows, cols) {
    const newGrid = Array.from({ length: rows }, () => Array(cols).fill(false))
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const neighbors = this.countNeighbors(grid, x, y, rows, cols)
        newGrid[y][x] = neighbors >= 4
      }
    }
    
    return newGrid
  }

  countNeighbors(grid, x, y, rows, cols) {
    let count = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx
        const ny = y + dy
        
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
          count++ // Count edges as walls
        } else if (dx !== 0 || dy !== 0) {
          if (grid[ny][nx]) count++
        }
      }
    }
    return count
  }
}

// Updated applyTerrain method for GameWorld.js
function applyTerrainImproved(realm) {
  const generator = new TerrainGenerator(this.config)
  
  // Choose generation method based on realm type
  let terrainMap
  if (realm.terrain.features) {
    terrainMap = generator.generateWithFeatures(realm, this.config.rows, this.config.cols)
  } else if (realm.name.includes('Cave') || realm.name.includes('Wraith')) {
    terrainMap = generator.generateCavePattern(realm, this.config.rows, this.config.cols)
  } else {
    terrainMap = generator.generateCoherentTerrain(realm, this.config.rows, this.config.cols)
  }
  
  // Apply the terrain map to tiles
  for (let y = 0; y < this.config.rows; y++) {
    for (let x = 0; x < this.config.cols; x++) {
      const tile = this.tileElements[y][x]
      tile.style.backgroundColor = terrainMap[y][x]
    }
  }
}

if(import.meta.main){
  const realm = {
    name: "Cave Realm",
    terrain: {
      primary: { color: "#333333" },
      secondary: { color: "#666666" },
      features: [
        { type: "cave", color: "#444444", width: 3 },
        { type: "river", color: "#0000FF", width: 1 }
      ]
    }
  }

  const generator = new TerrainGenerator({ rows: 10, cols: 10 })
  const terrainMap = generator.generateWithFeatures(realm, 10, 10)

  console.log(terrainMap)
}