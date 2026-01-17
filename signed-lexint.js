const lexint = require('./lexint.js')

function preencode(state, num) {
  const positive = num >= 0
  state.end++ // Add byte for sign bit
  lexint.preencode(state, num * (positive ? 1 : -1))
}

function encode(state, num) {
  const positive = num >= 0
  state.buffer[state.start++] = positive ? 1 : 0
  lexint.encode(state, num * (positive ? 1 : -1))
}

function decode(state) {
  const positive = state.buffer[state.start++]
  return (positive ? 1 : -1) * lexint.decode(state)
}

module.exports = {
  preencode,
  encode,
  decode
}
