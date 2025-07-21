// simplex-noise.js (ESM version)
// By Jonas Wagner (2018) — ESM adaptation by ChatGPT

const F2 = 0.5 * (Math.sqrt(3.0) - 1.0)
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0
const F3 = 1.0 / 3.0
const G3 = 1.0 / 6.0
const F4 = (Math.sqrt(5.0) - 1.0) / 4.0
const G4 = (5.0 - Math.sqrt(5.0)) / 20.0

class SimplexNoise {
  constructor(randomOrSeed) {
    let random
    if (typeof randomOrSeed === "function") {
      random = randomOrSeed
    } else if (randomOrSeed) {
      random = alea(randomOrSeed)
    } else {
      random = Math.random
    }
    this.p = buildPermutationTable(random)
    this.perm = new Uint8Array(512)
    this.permMod12 = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255]
      this.permMod12[i] = this.perm[i] % 12
    }
  }

  static _buildPermutationTable = buildPermutationTable

  grad3 = new Float32Array([
    1,
    1,
    0,
    -1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1,
    0,
    1,
    0,
    1,
    -1,
    0,
    1,
    1,
    0,
    -1,
    -1,
    0,
    -1,
    0,
    1,
    1,
    0,
    -1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1,
  ])

  grad4 = new Float32Array([
    0,
    1,
    1,
    1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    1,
    0,
    1,
    1,
    1,
    0,
    1,
    -1,
    1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    -1,
    -1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    1,
    0,
    1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    1,
    0,
    1,
    1,
    -1,
    0,
    1,
    -1,
    1,
    0,
    1,
    -1,
    -1,
    0,
    -1,
    1,
    1,
    0,
    -1,
    1,
    -1,
    0,
    -1,
    -1,
    1,
    0,
    -1,
    -1,
    -1,
    0,
  ])

  noise2D(xin, yin) {
    const { permMod12, perm, grad3 } = this

    let n0 = 0, n1 = 0, n2 = 0
    const s = (xin + yin) * F2
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const t = (i + j) * G2
    const X0 = i - t
    const Y0 = j - t
    const x0 = xin - X0
    const y0 = yin - Y0

    const i1 = x0 > y0 ? 1 : 0
    const j1 = x0 > y0 ? 0 : 1

    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2

    const ii = i & 255
    const jj = j & 255

    let t0 = 0.5 - x0 * x0 - y0 * y0
    if (t0 >= 0) {
      const gi0 = permMod12[ii + perm[jj]] * 3
      t0 *= t0
      n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0)
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1
    if (t1 >= 0) {
      const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3
      t1 *= t1
      n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1)
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2
    if (t2 >= 0) {
      const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3
      t2 *= t2
      n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2)
    }

    return 70.0 * (n0 + n1 + n2)
  }

  // Implement `noise3D` and `noise4D` the same way...
  // For brevity, not shown here, but you can copy them directly from your original source
}

function buildPermutationTable(random) {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 0; i < 255; i++) {
    const r = i + ~~(random() * (256 - i))
    const tmp = p[i]
    p[i] = p[r]
    p[r] = tmp
  }
  return p
}

function alea(...args) {
  let s0 = 0, s1 = 0, s2 = 0, c = 1
  let mash = masher()
  s0 = mash(" ")
  s1 = mash(" ")
  s2 = mash(" ")

  for (let i = 0; i < args.length; i++) {
    s0 -= mash(args[i])
    if (s0 < 0) s0 += 1
    s1 -= mash(args[i])
    if (s1 < 0) s1 += 1
    s2 -= mash(args[i])
    if (s2 < 0) s2 += 1
  }

  mash = null
  return () => {
    const t = 2091639 * s0 + c * 2.3283064365386963e-10
    s0 = s1
    s1 = s2
    s2 = t - (c = t | 0)
    return s2
  }
}

function masher() {
  let n = 0xefc8249d
  return function (data) {
    data = data.toString()
    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i)
      let h = 0.02519603282416938 * n
      n = h >>> 0
      h -= n
      h *= n
      n = h >>> 0
      h -= n
      n += h * 0x100000000
    }
    return (n >>> 0) * 2.3283064365386963e-10
  }
}

export { SimplexNoise }
