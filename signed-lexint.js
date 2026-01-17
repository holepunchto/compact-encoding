const lexint = require('./lexint')

function preencode(state, num) {
  const positive = num >= 0
  state.end++ // Add byte for sign bit
  lexint.preencode(state, num * (positive ? 1 : -1))
}

function encode(state, num) {
  const positive = num >= 0
  state.buffer[state.start++] = positive ? 1 : 0
  lexint.encode(state, num * (positive ? 1 : -1))
  if (!positive) {
    for (let i = 1; i < state.end; i++) {
      state.buffer[i] = state.buffer[i] ^ 0xff
    }
  }
}

function decode(state) {
  const positive = state.buffer[state.start++]
  if (!positive) {
    for (let i = 1; i < state.end; i++) {
      state.buffer[i] = state.buffer[i] ^ 0xff
    }
  }
  return (positive ? 1 : -1) * lexint.decode(state)
}

module.exports = {
  preencode,
  encode,
  decode
}
