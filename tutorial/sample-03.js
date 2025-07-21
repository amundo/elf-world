import { World } from './world.js'
let world = new World()
await world.load('world1.json')
world.debugRender()