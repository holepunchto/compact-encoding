const b = require('b4a')

const LE = (new Uint8Array(new Uint16Array([255]).buffer))[0] === 0xff
const BE = !LE

exports.state = function () {
  return { start: 0, end: 0, buffer: null }
}

const uint = exports.uint = {
  preencode (state, n) {
    state.end += n <= 0xfc ? 1 : n <= 0xffff ? 3 : n <= 0xffffffff ? 5 : 9
  },
  encode (state, n) {
    if (n <= 0xfc) state.buffer[state.start++] = n
    else if (n <= 0xffff) encode16(state, n)
    else if (n <= 0xffffffff) encode32(state, n)
    else encode64(state, n)
  },
  decode (state) {
    if (state.start >= state.end) throw new Error('Out of bounds')
    const a = state.buffer[state.start++]
    if (a <= 0xfc) return a
    if (a === 0xfd) return decode16(state)
    if (a === 0xfe) return decode32(state)
    return decode64(state)
  }
}

exports.int = {
  preencode (state, n) {
    uint.preencode(state, zigzagEncode(n))
  },
  encode (state, n) {
    uint.encode(state, zigzagEncode(n))
  },
  decode (state) {
    return zigzagDecode(uint.decode(state))
  }
}

exports.uint16 = {
  preencode (state, n) {
    state.end += 2
  },
  encode (state, n) {
    state.buffer[state.start++] = n
    state.buffer[state.start++] = n >>> 8
  },
  decode (state) {
    if (state.end - state.start < 2) throw new Error('Out of bounds')
    return state.buffer[state.start++] + state.buffer[state.start++] * 256
  }
}

exports.uint24 = {
  preencode (state, n) {
    state.end += 3
  },
  encode (state, n) {
    state.buffer[state.start++] = n
    state.buffer[state.start++] = n >>> 8
    state.buffer[state.start++] = n >>> 16
  },
  decode (state) {
    if (state.end - state.start < 3) throw new Error('Out of bounds')
    return state.buffer[state.start++] + state.buffer[state.start++] * 256 + state.buffer[state.start++] * 65536
  }
}

exports.uint32 = {
  preencode (state, n) {
    state.end += 4
  },
  encode (state, n) {
    state.buffer[state.start++] = n
    state.buffer[state.start++] = n >>> 8
    state.buffer[state.start++] = n >>> 16
    state.buffer[state.start++] = n >>> 24
  },
  decode (state) {
    if (state.end - state.start < 4) throw new Error('Out of bounds')
    return state.buffer[state.start++] + state.buffer[state.start++] * 256 + state.buffer[state.start++] * 65536 + state.buffer[state.start++] * 16777216
  }
}

exports.float64 = {
  preencode (state, n) {
    state.end += 8
  },
  encode (state, n) {
    const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 8)
    view.setFloat64(0, n, true) // little endian
    state.start += 8
  },
  decode (state) {
    const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 8)
    const float = view.getFloat64(0, true) // little endian
    state.start += 8
    return float
  }
}

exports.buffer = {
  preencode (state, b) {
    if (b) {
      uint.preencode(state, b.length)
      state.end += b.length
    } else {
      state.end++
    }
  },
  encode (state, b) {
    if (b) {
      uint.encode(state, b.length)
      state.buffer.set(b, state.start)
      state.start += b.length
    } else {
      state.buffer[state.start++] = 0
    }
  },
  decode (state) {
    const len = uint.decode(state)
    if (len === 0) return null
    const b = state.buffer.subarray(state.start, state.start += len)
    if (b.length !== len) throw new Error('Out of bounds')
    return b
  }
}

const raw = exports.raw = {
  preencode (state, b) {
    state.end += b.length
  },
  encode (state, b) {
    state.buffer.set(b, state.start)
    state.start += b.length
  },
  decode (state) {
    const b = state.buffer.subarray(state.start, state.end)
    state.start = state.end
    return b
  }
}

exports.uint32array = {
  preencode (state, b) {
    uint.preencode(state, b.length)
    state.end += b.byteLength
  },
  encode (state, b) {
    uint.encode(state, b.length)
    const view = new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
    if (BE) hostToLE32(view, b.length)
    state.buffer.set(view, state.start)
    state.start += b.byteLength
  },
  decode (state) {
    const len = uint.decode(state)

    const byteOffset = state.buffer.byteOffset + state.start
    const s = state.start

    state.start += len * 4

    if ((byteOffset & 3) === 0) {
      const arr = new Uint32Array(state.buffer.buffer, byteOffset, len)
      if (BE) LEToHost32(arr, len)
      return arr
    }

    // align mismatch
    const copy = new Uint8Array(len * 4)
    const arr = new Uint32Array(copy.buffer, copy.byteOffset, len)
    copy.set(state.buffer.subarray(s, state.start), 0)
    if (BE) LEToHost32(arr, len)
    return arr
  }
}

exports.string = {
  preencode (state, s) {
    const len = b.byteLength(s)
    uint.preencode(state, len)
    state.end += len
  },
  encode (state, s) {
    const len = b.byteLength(s)
    uint.encode(state, len)
    b.write(state.buffer, s, state.start)
    state.start += len
  },
  decode (state) {
    const len = uint.decode(state)
    const s = b.toString(state.buffer, 'utf8', state.start, state.start += len)
    if (b.byteLength(s) !== len) throw new Error('Out of bounds')
    return s
  }
}

exports.bool = {
  preencode (state, b) {
    state.end++
  },
  encode (state, b) {
    state.buffer[state.start++] = b ? 1 : 0
  },
  decode (state) {
    if (state.start >= state.buffer.byteLength) throw Error('Out of bounds')
    return state.buffer[state.start++] === 1
  }
}

exports.fixed32 = {
  preencode (state, h) {
    state.end += 32
  },
  encode (state, h) {
    state.buffer.set(h, state.start)
    state.start += 32
  },
  decode (state) {
    const b = state.buffer.subarray(state.start, state.start += 32)
    if (b.length !== 32) throw new Error('Out of bounds')
    return b
  }
}

exports.fixed64 = {
  preencode (state, s) {
    state.end += 64
  },
  encode (state, s) {
    state.buffer.set(s, state.start)
    state.start += 64
  },
  decode (state) {
    const b = state.buffer.subarray(state.start, state.start += 64)
    if (b.length !== 64) throw new Error('Out of bounds')
    return b
  }
}

exports.none = {
  preencode (state, m) {
    // do nothing
  },
  encode (state, m) {
    // do nothing
  },
  decode (state) {
    return null
  }
}

exports.fixed = fixed
exports.array = array
exports.from = from

exports.encode = function (enc, m) {
  const state = { start: 0, end: 0, buffer: null }
  enc.preencode(state, m)
  state.buffer = Buffer.allocUnsafe(state.end)
  enc.encode(state, m)
  return state.buffer
}

exports.decode = function (enc, buffer) {
  return enc.decode({ start: 0, end: buffer.byteLength, buffer })
}

function from (enc) {
  if (enc.preencode) return enc
  if (enc.encodingLength) return fromAbstractEncoder(enc)
  return fromCodec(enc)
}

function fromCodec (enc) {
  let tmpM = null
  let tmpBuf = null

  return {
    preencode (state, m) {
      tmpM = m
      tmpBuf = enc.encode(m)
      state.end += tmpBuf.length
    },
    encode (state, m) {
      raw.encode(state, m === tmpM ? tmpBuf : enc.encode(m))
      tmpM = tmpBuf = null
    },
    decode (state) {
      return enc.decode(raw.decode(state))
    }
  }
}

function fromAbstractEncoder (enc) {
  return {
    preencode (state, m) {
      state.end += enc.encodingLength(m)
    },
    encode (state, m) {
      enc.encode(m, state.buffer, state.start)
      state.start += enc.encode.bytes
    },
    decode (state) {
      const m = enc.decode(state.buffer, state.start, state.end)
      state.start += enc.decode.bytes
      return m
    }
  }
}

function array (enc) {
  return {
    preencode (state, list) {
      uint.preencode(state, list.length)
      for (let i = 0; i < list.length; i++) enc.preencode(state, list[i])
    },
    encode (state, list) {
      uint.encode(state, list.length)
      for (let i = 0; i < list.length; i++) enc.encode(state, list[i])
    },
    decode (state) {
      const len = uint.decode(state)
      if (len > 1048576) throw new Error('Array is too big')
      const arr = new Array(len)
      for (let i = 0; i < len; i++) arr[i] = enc.decode(state)
      return arr
    }
  }
}

function fixed (n) {
  return {
    preencode (state, s) {
      state.end += n
    },
    encode (state, s) {
      state.buffer.set(s, state.start)
      state.start += n
    },
    decode (state) {
      const b = state.buffer.subarray(state.start, state.start += n)
      if (b.length !== n) throw new Error('Out of bounds')
      return b
    }
  }
}

function LEToHost32 (arr, len) {
  const view = new DataView(arr.buffer, arr.byteOffset)
  const host = new Uint32Array(arr.buffer, arr.byteOffset, len)

  for (let i = 0; i < host.length; i++) {
    host[i] = view.getUint32(4 * i, BE)
  }
}

function hostToLE32 (arr, len) {
  const view = new DataView(arr.buffer, arr.byteOffset)
  const host = new Uint32Array(arr.buffer, arr.byteOffset, len)

  for (let i = 0; i < host.length; i++) {
    view.setUint32(4 * i, host[i], BE)
  }
}

function decode16 (state) {
  if (state.start + 2 > state.end) throw new Error('Out of bounds')
  return state.buffer[state.start++] + 256 * state.buffer[state.start++]
}

function encode16 (state, n) {
  state.buffer[state.start++] = 0xfd
  state.buffer[state.start++] = n
  state.buffer[state.start++] = (n >>> 8)
}

function decode32 (state) {
  if (state.start + 4 > state.end) throw new Error('Out of bounds')
  return state.buffer[state.start++] + 256 * state.buffer[state.start++] +
    65536 * state.buffer[state.start++] + 16777216 * state.buffer[state.start++]
}

function encode32 (state, n) {
  state.buffer[state.start++] = 0xfe
  state.buffer[state.start++] = n
  state.buffer[state.start++] = (n = (n >>> 8))
  state.buffer[state.start++] = (n = (n >>> 8))
  state.buffer[state.start++] = (n >>> 8)
}

function decode64 (state) {
  if (state.start + 8 > state.end) throw new Error('Out of bounds')
  return decode32(state) + 4294967296 * decode32(state)
}

function encode64 (state, n) {
  state.buffer[state.start++] = 0xff
  let r = Math.floor(n / 4294967296)
  state.buffer[state.start++] = n
  state.buffer[state.start++] = (n = (n >>> 8))
  state.buffer[state.start++] = (n = (n >>> 8))
  state.buffer[state.start++] = (n >>> 8)
  state.buffer[state.start++] = r
  state.buffer[state.start++] = (r = (r >>> 8))
  state.buffer[state.start++] = (r = (r >>> 8))
  state.buffer[state.start++] = (r >>> 8)
}

function zigzagDecode (n) {
  return n === 0 ? n : (n & 1) === 0 ? n / 2 : -(n + 1) / 2
}

function zigzagEncode (n) {
  // 0, -1, 1, -2, 2, ...
  return n < 0 ? (2 * -n) - 1 : n === 0 ? 0 : 2 * n
}
