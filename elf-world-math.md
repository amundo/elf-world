---
title: "Emoji Zelda Game: Viewport, Movement, and Camera Math"
description: A breakdown of the mathematical logic behind viewport sizing, player movement, and camera behavior in a DOM-only, grid-based emoji-style top-down game inspired by classic Zelda mechanics.
author: Patrick Hall
---


This game is a DOM-only, grid-based, emoji-style top-down game inspired by classic Zelda mechanics. It runs entirely in the browser using HTML, CSS Grid, and JavaScript.

This document explains the **mathematical logic** behind:

- The **viewport sizing**
- The **player movement**
- The **camera behavior**

---

## 📐 1. Viewport and Tile Sizing

### World Grid
The entire world is a fixed-size grid:

```js
const COLS = 30   // number of tiles horizontally
const ROWS = 20   // number of tiles vertically
````

### Viewport Grid

We define how many tiles should **visibly fit** on screen at any given time:

```js
const VIEW_WIDTH = 10   // tiles shown across the screen
const VIEW_HEIGHT = 8   // tiles shown vertically
```

### Dynamic Tile Sizing

We calculate the width and height of each tile so that the visible area perfectly fills the screen:

```js
tileWidth = window.innerWidth / VIEW_WIDTH
tileHeight = window.innerHeight / VIEW_HEIGHT
```

This ensures:

* 10 tiles fit across the full width
* 8 tiles fit down the full height
* No scrollbars, no empty space, and tiles scale responsively

---

## 🕹️ 2. Player Movement

The player’s position is represented by `(px, py)` coordinates in grid space:

```js
let px = 15
let py = 10
```

Each time an arrow key is pressed:

```js
function move(dx, dy) {
  px = clamp(px + dx, 0, COLS - 1)
  py = clamp(py + dy, 0, ROWS - 1)
}
```

* `clamp()` ensures the player doesn’t move off the edge of the world.
* The player's DOM element is positioned absolutely using:

```js
playerEl.style.left = `${px * tileWidth}px`
playerEl.style.top = `${py * tileHeight}px`
```

This multiplies their grid position by the size of a tile to compute pixel position.

---

## 🎥 3. Laggy Camera System

The camera does not follow the player *immediately*. Instead, it centers the player only **when they approach the edge of the viewport**.

### Camera Position

We track camera center coordinates separately:

```js
let cameraX = px
let cameraY = py
```

Then compute the visible window of tiles:

```js
const marginX = Math.floor(VIEW_WIDTH / 2)
const marginY = Math.floor(VIEW_HEIGHT / 2)

const offsetX = (cameraX - marginX) * tileWidth
const offsetY = (cameraY - marginY) * tileHeight
```

This means:

* The top-left corner of the view is always `(cameraX - marginX, cameraY - marginY)`
* The visible grid is centered around the camera
* If the player moves too far from the camera, we adjust the camera

### Camera Adjustment

```js
if (px < cameraX - marginX + 1)
  cameraX = clamp(px + marginX - 1, marginX, COLS - marginX - 1)

if (px > cameraX + marginX - 1)
  cameraX = clamp(px - marginX + 1, marginX, COLS - marginX - 1)

... same for y ...
```

This keeps the camera “laggy”:

* It **doesn’t move** unless the player nears the edge of the screen.
* It **snaps** when the player exceeds the center margin.

### World Scrolling

Finally, the `world` and `player` containers are moved:

```js
worldEl.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`
playerEl.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`
```

So even though the world is much larger than the viewport, only the portion near the player is visible.

---

## 📊 Summary

| Concept                 | Formula / Logic                               |
| ----------------------- | --------------------------------------------- |
| `tileWidth`             | `window.innerWidth / VIEW_WIDTH`              |
| `tileHeight`            | `window.innerHeight / VIEW_HEIGHT`            |
| Player DOM position     | `px * tileWidth`, `py * tileHeight`           |
| Camera center           | `(cameraX, cameraY)`                          |
| Camera offset           | `(cameraX - marginX) * tileWidth`             |
| Camera movement trigger | When player nears edge of visible window      |
| Clamp world movement    | `clamp(val, min, max)` to avoid overscrolling |

---

## 🚀 Tips for Extensions

* Add collision logic to block movement on tree tiles 🌲
* Show NPCs or enemies using emojis (🐍, 👹, etc.)
* Add an inventory or dialogue box

Happy hacking!

