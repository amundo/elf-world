---
title: Designing a Conlang Game
author: Patrick Hall
css: blog.css
---

## 2025-07-10

### Introduction

I have been interested in designing a conlang-based game for some time. The idea is to create a world where players can explore and interact using a constructed language (conlang) that they learn as they play.

A key feature of the game is that the language is actually linked in to the commands and functions of entities in the game. For instance, before being able to give an object to another entity, the player must learn the verb for "give" in the conlang. This creates a natural incentive for players to learn and use the language as they progress through the game.

### Procedural world generation

As always happens when I start working on this project, I end up getting drawn down rabbit holes related to procedural generation. It’s undeniably fun to work on, and using AI it is easy to make prototypes. I made some progress with various approaches, I will list them here, but I am going to back away from this topic to focus on the language part of the project next. Anyway, here are the prototypes:

#### 🧝‍♂️ Elf World Realm Editor

This was the first design. It’s based on a simple painting metaphor, but also has a procedural "base" generation functionality. 

<figure>
<a href=../editor/realm-editor.html>
<img src=images/elf-world-realm-editor-screenshot.png alt="Realm Editor Screenshot" style="width: 400px;"/>
</a>
<figcaption><a href=../editor/realm-editor.html>Realm Editor</a></figcaption>
</figure>

It uses a very simple noise function:

```js
function noise(x, y, scale) {
  const seed = 123.456
  const n = Math.sin(x * scale + seed) * Math.cos(y * scale + seed)
  return (n + 1) / 2
} 
```

I tried randomizing the seed (`Math.random() * 100`), but it made the results very chaotic. I’m not sure why the simple fixed seed works better, but it does. 


##### **Pros**

* Entity panel is nice, and adding entities is fun.
* Portals are cool, but I think they might be too complex for a first version of the game.
* Entities are ok
* The concept of combining procedural and manual design is a keeper. 

##### **Cons**

* Doesn’t do much in the way of procedural generation. The noise function is too simple.
* "Biomes" are starkly defined, and the transitions are abrupt.
* There’s not really "biomes" here, just entities and terrains.



<a href="sample-realm-editor-data.json">Sample data structure output</a>


#### Biome Painter

This prototype has a more sophisticated approach to procedural generation. It uses Simplex Noise to create a more natural-looking terrain. The biomes are defined with multiple colors, allowing for smoother transitions between them.

<figure>
<a href=../editor/biome-painter.html>
<img src=images/biome-painter-screenshot.png alt="Biome Painter Screenshot" style="width: 400px;"/>
</a>
<figcaption><a href=../editor/biome-painter.html>Biome Painter</a></figcaption>
</figure>


##### **Pros**

* Simplex Noise is working
* Brush is pretty neat
* Has a good representation of "biomes" with color gradients and biome-specific entities with probabilities and emojis
* Very easy to fill up a map fast

##### **Cons**

* Zoom is wonky
* Feathered brushes are converted to stark boundaries when terrain noise is applied


#### Perlin map Editor

Actually the first one I built, still looks pretty good. 


<figure>
<a href=../editor/perlin-map-editor.html>
<img src=images/perlin-map-editor-screenshot.png alt="Perlin Map Editor Screenshot" style="width: 400px;"/>
</a>
<figcaption><a href=../editor/perlin-map-editor.html>Perlin Map Editor</a></figcaption>
</figure>

##### **Pros**

* Perlin noise works pretty well
* Generated terrain looks nice
* Colors are stark but pretty pleasant

##### **Cons**

* No editing or painting, only procedural generation
* Emoji probabilities are not biome-specific
* No export yet



#### Biome generator

This design uses noise to generate elevation-related biomes.

Here is the entirety of hte code:

```js
import { SimplexNoise } from './simplex-noise.js'
const size = 50
const map = document.querySelector('#map')
const simplex = new SimplexNoise()

// Normalize noise to [0, 1]
function noise2d(seed, x, y, scale) {
  return (simplex.noise2D(seed + x * scale, seed + y * scale) + 1) / 2
}

function getBiome(elev, moist, temp) {
  if (elev < 0.3) return '🌊' // ocean
  if (elev > 0.8 && temp < 0.3) return '🏔️' // snowy mountain
  if (elev > 0.8 && moist < 0.3) return '⛰️' // rocky mountain
  if (elev > 0.6 && moist > 0.6) return '🌲' // alpine forest
  if (moist > 0.7 && temp > 0.5) return '🌳' // forest
  if (moist > 0.4 && temp > 0.5) return '🌾' // grassland
  if (moist < 0.3) return '🏜️' // desert
  return '🌱' // plains
}

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const elevation = noise2d(1.5, x, y, 0.05)
    const moisture = noise2d(2.5, x, y, 0.05)
    const temperature = 1 - Math.abs(y / size - 0.5) + noise2d(3.5, x, y, 0.05) * 0.2

    const emoji = getBiome(elevation, moisture, temperature)

    const tile = document.createElement('div')
    tile.className = 'tile'
    tile.textContent = emoji
    map.appendChild(tile)
  }
}
```

<figure>
<a href=../editor/realm-editor.html>
<img src=images/biome-generation-screenshot-fullpage.png alt="Biome Generation Screenshot" style="width: 400px;"/>
</a>
<figcaption><a href=../editor/biome-generation.html>Biome Generation</a></figcaption>
</figure>

##### **Pros**

* Simplex noise works well
* Biome shapes look good
* Uses multiple noise maps for elevation, moisture, and temperature

##### **Cons**

* Colors not rendering
* Hard to evaluate, needs emoji scattering
* Might want to separate elevation from biomes

Actually I think this is a workable approach for the first run. But needs terrains and entities added.

#### Conclusion and plan

All three of these have good features:

1. Brush is useful
2. Biomes with terrain-specific entities with probabilities is a keeper
3. Not sure I see any difference between Perlin and Simplex noise in this context, but Simplex is supposed to be better for 2D
4. The painting interface with terrains, entities, and portals is very cool

I think I will combine the brush and biome/entity panel from the Realm Editor with the Simplex noise and biome color gradients from the Biome Painter. I will also add biome-specific entity probabilities.

Fancy future things to try:

1. More than one noise map, one for elevation, one for moisture, one for temperature
2. More sophisticated biome definitions based on elevation, moisture, and temperature ranges
3. Smoother transitions between biomes based on the above factors

### Code review

Okay, enough of procedural generation for now. I will focus on the language part of the project next. But I will keep these prototypes around as a reference for when I want to improve the world generation later.

But let’s review all the files (and posisble move things around to be neater):

```
Updated .tree.json with excludes: .*
├── audio
│   ├── fairy-ambient.mp3
│   ├── woodland-fantasy.mp3
│   └── wraith-ambient.mp3
├── basic-lexicon.json
├── blog
│   ├── blog.css
│   ├── blog.html
│   ├── blog.md
│   ├── header.html
│   ├── images
│   │   ├── biome-generation-screenshot-fullpage.png
│   │   ├── biome-painter-screenshot.png
│   │   ├── elf-world-realm-editor-screenshot.png
│   │   └── perlin-map-editor-screenshot.png
│   └── sample-realm-editor-data.json
├── CommandProcessor.js
├── conlang.html
├── ConlangEngine.js
├── css
│   ├── colors.css
│   ├── colors.html
│   └── elf-world.css
├── deno.json
├── deno.lock
├── editor
│   ├── biome-generation.html
│   ├── biome-painter.html
│   ├── perlin-map-editor.html
│   ├── realm-editor.html
│   └── simplex-noise.js
├── ElfWorld.js
├── entities
│   └── index.json
├── Entity.js
├── GameWorld.js
├── Lexicon.js
├── Player.js
├── realms
│   ├── crystal-caverns.json
│   ├── fairy.json
│   ├── forest.json
│   ├── index.json
│   ├── sealand.json
│   ├── secrets.json
│   └── wraith.json
├── realms.json
├── simplex-noise.ts
├── TerrainGenerator.js
└── UIManager.js
```


The stuff that I’m actually concerned with for now is, in order of importance:


```
├── conlang.html
├── ElfWorld.js
├── CommandProcessor.js
├── ConlangEngine.js
├── css
│   ├── colors.css
│   ├── colors.html
│   └── elf-world.css
├── entities
│   └── index.json
├── Entity.js
├── GameWorld.js
├── Lexicon.js
├── Player.js
├── simplex-noise.ts
├── TerrainGenerator.js
└── UIManager.js
```

`conlang.html` is the point of entry for the game. It loads the CSS and JS files, and sets up the basic HTML structure.

The markup looks like this:

```html
  <div class="loading" id="loadingScreen">Loading Elf World</div>

  <div class="view" id="gameView" style="display: none;">
    <div class="game-pane">
      <div id="world" class="world"></div>
      <div class="ui" id="inventory">Inventory: 🍎</div>
      <div class="realm-info" id="realmInfo">Loading...</div>
      <div class="audio-controls" id="audioToggle" title="Toggle Audio">🔇</div>
      <div class="dialogue" id="dialogueBox">Hello!</div>
      <div class="realm-transition" id="transition"></div>
    </div>

    <div class="console-pane">
      <div class="console-header" id="consoleHeader">WORD LEARN</div>
      <div class="command-output" id="commandOutput"></div>
      <div class="command-input-area">
        <span class="command-prompt">></span>
        <input type="text" class="command-input" id="commandInput" placeholder="Type commands here...">
      </div>
    </div>
  </div>

  <script type="module" src="./ElfWorld.js"></script>
```

So we’ve got a game pane and a console pane, which is really the conlang pane. There are also some UI controls like inventory, realm info, audio toggle, dialogue box, and realm transition. I think what I want to do for now is remove:

* Inventory
* Audio
* Transitions (just one realm for now)
* Dialogue box (not needed yet)

This will leave us with a simpler interface to start with. The game pane will just show the world and the realm info, and the console pane will be for learning and using the conlang.

Here’s the import graph for `ElfWorld.js`:

```
// ElfWorld.js - Main game module

import { ConlangEngine } from './ConlangEngine.js'
import { GameWorld } from './GameWorld.js'
import { UIManager } from './UIManager.js'
import { CommandProcessor } from './CommandProcessor.js'
```

And here’s what each of these modules does:

* `ConlangEngine.js`: Manages the constructed language
* `GameWorld.js`: Manages the game world, including the grid, camera, and entities.
* `UIManager.js`: Manages the user interface, including rendering the world and handling user input.
* `CommandProcessor.js`: Processes player commands, translating them into game actions. 


### Emoji ideas

It’s fun to think about how different emojis might be used in the game. Here are some ideas:

#### Memories 

* 📽️ - projector that displays memories
* 🎥 - film camera that records memories
* 🎬 - clapper board to start recording
* 📷 - camera for taking photos
* 📸 - camera taking a photo
* 🖼️ - framed picture to view photos
* 🪞 - mirror to see self
* 🔮 - crystal ball to see visions
* 🪄 - magic wand to cast spells
* 🧙‍♂️ - wizard to teach spells
* 🧝‍♂️ - elf to teach language

#### Quests and quest givers

* 🧚‍♀️ - fairy to give quests
* 🧛‍♂️ - vampire to give dark quests
* 🧟‍♂️ - zombie to give survival quests
* 🧞‍♂️ - genie to grant wishes
* 🧜‍♀️ - mermaid to give underwater quests
* 🧚‍♂️ - pixie to give mischievous quests
* 🧙‍♀️ - sorceress to teach advanced spells
* 🧝‍♀️ - high elf to teach advanced language


#### Scrolls, writing, written language

* 📜 - scroll to read ancient texts
* 📃 - page with curl to read notes
* 📄 - page facing up to read documents
* 📑 - bookmark tabs to mark important pages
* 📚 - books to read multiple texts
* 📖 - open book to read stories
* 🖋️ - fountain pen to write elegantly
* ✒️ - black nib to write formally
* 🖊️ - pen to write casually
* 🖌️ - paintbrush to create art
* 📝 - memo to jot down quick notes
* 🗒️ - spiral notepad to keep a journal
* 🗓️ - spiral calendar to plan events
* 📆 - tear-off calendar to track days
* 📇 - card index to organize information
* 📈 - chart increasing to track progress
* 📉 - chart decreasing to track setbacks
* 📊 - bar chart to visualize data
* 📋 - clipboard to manage tasks
* 📅 - calendar to schedule activities
* 🗃️ - card file box to store documents
* 🗄️ - file cabinet to organize files
* 🗂️ - open file folder to access information
* 🗞️ - rolled-up newspaper to read news
* 📰 - newspaper to stay informed
* 🏷️ - label to categorize items
* 🔖 - bookmark to save important pages
* 💼 - briefcase to carry important documents
* 📁 - file folder to organize papers
* 📂 - open file folder to access files
* 🗑️ - wastebasket to discard unwanted items

#### Computers and technology

* 💻 - laptop to access digital world
* 🖥️ - desktop computer to work on projects
* 🖨️ - printer to produce physical copies
* 🖱️ - computer mouse to navigate interfaces
* 🖲️ - trackball to control cursor
* 💾 - floppy disk to save progress
* 💿 - optical disk to store data
* 📀 - DVD to watch movies
* 📼 - VHS tape to watch old recordings
* 📷 - camera to capture moments
* 📸 - camera with flash to take photos
* 📹 - video camera to record videos
* 🎥 - movie camera to create films
* 📺 - television to watch shows
* 📻 - radio to listen to broadcasts


#### broadcasting, radio, and communication

* 📡 - satellite antenna to receive signals
* 📢 - loudspeaker to amplify sound
* 📣 - megaphone to project voice
* 📞 - telephone receiver to make calls
* ☎️ - telephone to communicate
* 📠 - fax machine to send documents
* 📱 - mobile phone to stay connected
* 🕹️ - joystick to control games
* 🎮 - video game to play
* 🎰 - slot machine to gamble
* 🎲 - game die to play board games
* ♟️ - chess pawn to strategize
* 🎯 - direct hit to aim for goals
* 🎳 - bowling to have fun



## 2025-07-11

### Procedural generation follow-up

Well, guess who went back down the rabbit hole of procedural generation? This guy. I read about using temperature, moisture, and elevation to define biomes, and I thought it sounded like a good idea. So I have been toying with a biome generator that incorporates these factors.

<figure>
<a href=../editor/biomes-sidebar.html>
<img src=images/biome-sidebar-screenshot.png alt="Biomes Sidebar Screenshot" style="width: 400px;"/>
</a>
<figcaption><a href=../editor/biomse-sidebar.html>Biome editor with Sidebar</a></figcaption>
</figure>


This thing is fun to play with, but probably not practical for my purposes. Anyway, you can share links like:

[../editor/biomes-sidebar.html#elev=1&moist=1.6&temp=0.8&noise=0.3&color=0.1&ocean=0.4&mount=0.6&desert=0.4&grid=50](../editor/biomes-sidebar.html#elev=1&moist=1.6&temp=0.8&noise=0.3&color=0.1&ocean=0.4&mount=0.6&desert=0.4&grid=50)

Or

[../editor/biomes-sidebar.html#elev=1.4&moist=0.8&temp=1.4&noise=0.06&color=0.5&ocean=0.3&mount=0.74&desert=0.12&grid=75](../editor/biomes-sidebar.html#elev=1.4&moist=0.8&temp=1.4&noise=0.06&color=0.5&ocean=0.3&mount=0.74&desert=0.12&grid=75)

It’s not quite intuitive yet, but twiddling knobs is sort of interesting. 
