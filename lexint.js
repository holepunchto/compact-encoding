module.exports = {
  preencode,
  encode,
  decode
}

function preencode (state, num) {
  if (num < 251) {
    state.end++
  } else if (num < 256) {
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

function encode (state, num) {
  const max = 251
  const x = num - max

  const { buffer, byteOffset } = state.buffer
  const view = new DataView(buffer, byteOffset, state.end - state.start)

  if (num < max) {
    state.buffer[state.start++] = num
  } else if (num < 256) {
    state.buffer[state.start++] = max
    state.buffer[state.start++] = x
  } else if (num < 0x10000) {
    state.buffer[state.start++] = max + 1
    view.setUint16(state.start, x)
    state.start += 2
  } else if (num < 0x1000000) {
    state.buffer[state.start++] = max + 2
    state.buffer[state.start++] = x >> 16
    view.setUint16(state.start, x & 0xffff)
    state.start += 2
  } else if (num < 0x100000000) {
    state.buffer[state.start++] = max + 3
    view.setUint32(state.start, x)
    state.start += 4
  } else {
    const exp = Math.floor(Math.log(x) / Math.log(2)) - 32
    state.buffer[state.start++] = 0xff

    encode(state, exp)
    const rem = x / Math.pow(2, exp - 11)

    for (let i = 5; i >= 0; i--) {
      state.buffer[state.start++] = rem / Math.pow(2, 8 * i) & 0xff
    }
  }
}

function decode (state, num) {
  const max = 251
  const flag = state.buffer[state.start++]

  const { buffer, byteOffset, byteLength } = state.buffer
  const view = new DataView(buffer, byteOffset, byteLength)

  if (flag < max) return flag

  switch (flag) {
    case 251: {
      return state.buffer[state.start++] + max
    }

    case 252: {
      const x = view.getUint16(state.start)
      state.start += 2
      return x + max
    }

    case 253: {
      let x = state.buffer[state.start++] << 16
      x += view.getUint16(state.start)
      state.start += 2
      return x + max
    }

    case 254: {
      const x = view.getUint32(state.start)
      state.start += 4
      return x + max
    }

    case 255: {
      const exp = decode(state)

      let rem = 0
      for (let i = 5; i >= 0; i--) {
        rem += state.buffer[state.start++] * Math.pow(2, 8 * i)
      }

      return (rem * Math.pow(2, exp - 11)) + max
    }
  }
}
