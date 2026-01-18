const lexint = require('./lexint')

function preencode(state, num) {
  num = Math.abs(num) // Ignore sign
  if (num < 123) {
    state.end++
  } else if (num < 128) {
    state.end += 2
  } else if (num < 0x10000) {
    state.end += 3
  } else if (num < 0x1000000) {
    state.end += 4
  } else if (num < 0x100000000) {
    state.end += 5
  } else {
    state.end++
    const exp = Math.floor(Math.log(num) / Math.log(2)) - 32
    preencode(state, exp)
    state.end += 6
  }
}

function encode(state, num) {
  const positive = num >= 0
  const positiveBit = positive ? 0x80 : 0

  const max = 123
  num = num * (positive ? 1 : -1)
  const x = num - max

  const initialStart = state.start

  if (num < max) {
    state.buffer[state.start++] = num + positiveBit
  } else if (num < 128) {
    state.buffer[state.start++] = max + positiveBit
    state.buffer[state.start++] = x
  } else if (num < 0x10000) {
    state.buffer[state.start++] = max + 1 + positiveBit
    state.buffer[state.start++] = (x >> 8) & 0xff
    state.buffer[state.start++] = x & 0xff
  } else if (num < 0x1000000) {
    state.buffer[state.start++] = max + 2 + positiveBit
    state.buffer[state.start++] = x >> 16
    state.buffer[state.start++] = (x >> 8) & 0xff
    state.buffer[state.start++] = x & 0xff
  } else if (num < 0x100000000) {
    state.buffer[state.start++] = max + 3 + positiveBit
    state.buffer[state.start++] = x >> 24
    state.buffer[state.start++] = (x >> 16) & 0xff
    state.buffer[state.start++] = (x >> 8) & 0xff
    state.buffer[state.start++] = x & 0xff
  } else {
    // need to use Math here as bitwise ops are 32 bit
    const exp = Math.floor(Math.log(x) / Math.log(2)) - 32
    state.buffer[state.start++] = 0x7f + positiveBit

    encode(state, exp)
    const rem = x / Math.pow(2, exp - 11)

    for (let i = 5; i >= 0; i--) {
      state.buffer[state.start++] = (rem / Math.pow(2, 8 * i)) & 0xff
    }
  }

  if (!positive) {
    // Flip all bits but the positive flag bit so negative numbers are lexicographically ordered.
    state.buffer[initialStart] ^= 0x7f
    for (let i = initialStart + 1; i < state.start; i++) {
      state.buffer[i] ^= 0xff
    }
  }
}

function decode(state) {
  const positive = (state.buffer[state.start] & 0x80) !== 0
  if (!positive) {
    // Flip all bits but the positive flag bit
    state.buffer[state.start] ^= 0x7f
    for (let i = state.start + 1; i < state.end; i++) {
      state.buffer[i] ^= 0xff
    }
  } else {
    state.buffer[state.start] &= 0x7f // remove flag
  }

  const max = 123

  if (state.end - state.start < 1) throw new Error('Out of bounds')

  const flag = state.buffer[state.start++]

  const positiveMultiplier = positive ? 1 : -1
  if (flag < max) return positiveMultiplier * flag

  if (state.end - state.start < flag - max + 1) {
    throw new Error('Out of bounds.')
  }

  if (flag < 124) {
    return positiveMultiplier * state.buffer[state.start++] + max
  }

  if (flag < 125) {
    return (
      positiveMultiplier *
      ((state.buffer[state.start++] << 8) + state.buffer[state.start++] + max)
    )
  }

  if (flag < 126) {
    return (
      positiveMultiplier *
      ((state.buffer[state.start++] << 16) +
        (state.buffer[state.start++] << 8) +
        state.buffer[state.start++] +
        max)
    )
  }

  // << 24 result may be interpreted as negative
  if (flag < 127) {
    return (
      positiveMultiplier *
      (state.buffer[state.start++] * 0x1000000 +
        (state.buffer[state.start++] << 16) +
        (state.buffer[state.start++] << 8) +
        state.buffer[state.start++] +
        max)
    )
  }

  const exp = decode(state)

  if (state.end - state.start < 6) throw new Error('Out of bounds')

  let rem = 0
  for (let i = 5; i >= 0; i--) {
    rem += state.buffer[state.start++] * Math.pow(2, 8 * i)
  }

  return positiveMultiplier * (rem * Math.pow(2, exp - 11) + max)
}

module.exports = {
  preencode,
  encode,
  decode
}
