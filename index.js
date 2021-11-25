const b4a = require('b4a')

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
    if (n <= 0xfc) uint8.encode(state, n)
    else if (n <= 0xffff) {
      state.buffer[state.start++] = 0xfd
      uint16.encode(state, n)
    } else if (n <= 0xffffffff) {
      state.buffer[state.start++] = 0xfe
      uint32.encode(state, n)
    } else {
      state.buffer[state.start++] = 0xff
      uint64.encode(state, n)
    }
  },
  decode (state) {
    const a = uint8.decode(state)
    if (a <= 0xfc) return a
    if (a === 0xfd) return uint16.decode(state)
    if (a === 0xfe) return uint32.decode(state)
    return uint64.decode(state)
  }
}

const uint8 = exports.uint8 = {
  preencode (state, n) {
    state.end += 1
  },
  encode (state, n) {
    state.buffer[state.start++] = n
  },
  decode (state) {
    if (state.start >= state.end) throw new Error('Out of bounds')
    return state.buffer[state.start++]
  }
}

const uint16 = exports.uint16 = {
  preencode (state, n) {
    state.end += 2
  },
  encode (state, n) {
    state.buffer[state.start++] = n
    state.buffer[state.start++] = n >>> 8
  },
  decode (state) {
    if (state.end - state.start < 2) throw new Error('Out of bounds')
    return (
      state.buffer[state.start++] +
      state.buffer[state.start++] * 256
    )
  }
}

const uint24 = exports.uint24 = {
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
    return (
      state.buffer[state.start++] +
      state.buffer[state.start++] * 256 +
      state.buffer[state.start++] * 65536
    )
  }
}

const uint32 = exports.uint32 = {
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
    return (
      state.buffer[state.start++] +
      state.buffer[state.start++] * 256 +
      state.buffer[state.start++] * 65536 +
      state.buffer[state.start++] * 16777216
    )
  }
}

const uint64 = exports.uint64 = {
  preencode (state, n) {
    state.end += 8
  },
  encode (state, n) {
    const r = Math.floor(n / 4294967296)
    uint32.encode(state, n)
    uint32.encode(state, r)
  },
  decode (state) {
    if (state.end - state.start < 8) throw new Error('Out of bounds')
    return uint32.decode(state) + 4294967296 * uint32.decode(state)
  }
}

exports.int = zigZag(uint)
exports.int8 = zigZag(uint8)
exports.int16 = zigZag(uint16)
exports.int24 = zigZag(uint24)
exports.int32 = zigZag(uint32)
exports.int64 = zigZag(uint64)

exports.float32 = {
  preencode (state, n) {
    state.end += 4
  },
  encode (state, n) {
    const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 4)
    view.setFloat32(0, n, true) // little endian
    state.start += 4
  },
  decode (state) {
    if (state.end - state.start < 4) throw new Error('Out of bounds')
    const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 4)
    const float = view.getFloat32(0, true) // little endian
    state.start += 4
    return float
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
    if (state.end - state.start < 8) throw new Error('Out of bounds')
    const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 8)
    const float = view.getFloat64(0, true) // little endian
    state.start += 8
    return float
  }
}

exports.buffer = {
  preencode (state, b) {
    if (b) uint8array.preencode(state, b)
    else state.end++
  },
  encode (state, b) {
    if (b) uint8array.encode(state, b)
    else state.buffer[state.start++] = 0
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

function typedarray (TypedArray, swap) {
  const n = TypedArray.BYTES_PER_ELEMENT

  return {
    preencode (state, b) {
      uint.preencode(state, b.length)
      state.end += b.byteLength
    },
    encode (state, b) {
      uint.encode(state, b.length)

      const view = new Uint8Array(b.buffer, b.byteOffset, b.byteLength)

      if (BE && swap) swap(view)

      state.buffer.set(view, state.start)
      state.start += b.byteLength
    },
    decode (state) {
      const len = uint.decode(state)

      let b = state.buffer.subarray(state.start, state.start += len * n)
      if (b.byteLength !== len * n) throw new Error('Out of bounds')
      if (b.byteOffset % n !== 0) b = new Uint8Array(b)

      if (BE && swap) swap(b)

      return new TypedArray(b.buffer, b.byteOffset, b.byteLength / n)
    }
  }
}

const uint8array = exports.uint8array = typedarray(Uint8Array)
exports.uint16array = typedarray(Uint16Array, b4a.swap16)
exports.uint32array = typedarray(Uint32Array, b4a.swap32)

exports.int8array = typedarray(Int8Array)
exports.int16array = typedarray(Int16Array, b4a.swap16)
exports.int32array = typedarray(Int32Array, b4a.swap32)

exports.float32array = typedarray(Float32Array, b4a.swap32)
exports.float64array = typedarray(Float64Array, b4a.swap64)

exports.string = {
  preencode (state, s) {
    const len = b4a.byteLength(s)
    uint.preencode(state, len)
    state.end += len
  },
  encode (state, s) {
    const len = b4a.byteLength(s)
    uint.encode(state, len)
    b4a.write(state.buffer, s, state.start)
    state.start += len
  },
  decode (state) {
    const len = uint.decode(state)
    const s = b4a.toString(state.buffer, 'utf8', state.start, state.start += len)
    if (b4a.byteLength(s) !== len || state.start > state.end) throw new Error('Out of bounds')
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
    if (state.start >= state.end) throw Error('Out of bounds')
    return state.buffer[state.start++] === 1
  }
}

const fixed = exports.fixed = function fixed (n) {
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

exports.fixed32 = fixed(32)
exports.fixed64 = fixed(64)

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

exports.array = function array (enc) {
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

exports.from = function from (enc) {
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

exports.encode = function encode (enc, m) {
  const state = { start: 0, end: 0, buffer: null }
  enc.preencode(state, m)
  state.buffer = b4a.allocUnsafe(state.end)
  enc.encode(state, m)
  return state.buffer
}

exports.decode = function decode (enc, buffer) {
  return enc.decode({ start: 0, end: buffer.byteLength, buffer })
}

function zigZag (enc) {
  return {
    preencode (state, n) {
      enc.preencode(state, zigZagEncode(n))
    },
    encode (state, n) {
      enc.encode(state, zigZagEncode(n))
    },
    decode (state) {
      return zigZagDecode(enc.decode(state))
    }
  }
}

function zigZagDecode (n) {
  return n === 0 ? n : (n & 1) === 0 ? n / 2 : -(n + 1) / 2
}

function zigZagEncode (n) {
  // 0, -1, 1, -2, 2, ...
  return n < 0 ? (2 * -n) - 1 : n === 0 ? 0 : 2 * n
}
