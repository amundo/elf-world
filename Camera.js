class Camera {
  constructor(config) {
    this.config = config
    this.x = 0
    this.y = 0
    this.viewWidth = 10
    this.viewHeight = 8
    this.player = null
  }

  setPlayer(player) {
    this.player = player
  }

  setViewSize(width, height) {
    this.viewWidth = width
    this.viewHeight = height
  }

  getDeadZone() {
    const marginX = Math.floor(this.viewWidth / 4) // dead zone is centered smaller
    const marginY = Math.floor(this.viewHeight / 4)
    return {
      minX: this.x - marginX,
      maxX: this.x + marginX,
      minY: this.y - marginY,
      maxY: this.y + marginY,
    }
  }

  // trackPlayer() {
  //   if (!this.player) return
  //   const dz = this.getDeadZone()

  //   if (this.player.x < dz.minX || this.player.x > dz.maxX ||
  //       this.player.y < dz.minY || this.player.y > dz.maxY) {
  //     this.focusAt(this.player.x, this.player.y)
  //   }
  // }

  //debug version
  trackPlayer() {
    if (!this.player) return
    this.focusAt(this.player.x, this.player.y)
  }

  focusAt(x, y) {
    this.x = this.clamp(x, 0, this.config.cols - 1)
    this.y = this.clamp(y, 0, this.config.rows - 1)
  }
  getVisibleBounds() {
    const halfW = Math.floor(this.viewWidth / 2)
    const halfH = Math.floor(this.viewHeight / 2)

    let startX = this.x - halfW
    let startY = this.y - halfH

    // Clamp start so it stays within the world bounds
    startX = this.clamp(startX, 0, this.config.cols - this.viewWidth)
    startY = this.clamp(startY, 0, this.config.rows - this.viewHeight)

    return {
      startX,
      endX: startX + this.viewWidth,
      startY,
      endY: startY + this.viewHeight,
    }
  }

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
  }
}

export { Camera }
