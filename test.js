const enc = require('./')
const tape = require('tape')

tape('uint', function (t) {
  const state = enc.state()

  enc.uint.preencode(state, 42)
  t.same(state, { start: 0, end: 1, buffer: null })
  enc.uint.preencode(state, 4200)
  t.same(state, { start: 0, end: 4, buffer: null })
  enc.uint.preencode(state, Number.MAX_SAFE_INTEGER)
  t.same(state, { start: 0, end: 13, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  enc.uint.encode(state, 42)
  t.same(state, { start: 1, end: 13, buffer: Buffer.from([42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) })
  enc.uint.encode(state, 4200)
  t.same(state, { start: 4, end: 13, buffer: Buffer.from([42, 0xfd, 104, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0]) })
  enc.uint.encode(state, Number.MAX_SAFE_INTEGER)
  t.same(state, { start: 13, end: 13, buffer: Buffer.from([42, 0xfd, 104, 16, 0xff, 255, 255, 255, 255, 255, 255, 31, 0]) })

  state.start = 0
  t.same(enc.uint.decode(state), 42)
  t.same(enc.uint.decode(state), 4200)
  t.same(enc.uint.decode(state), Number.MAX_SAFE_INTEGER)
  t.same(state.start, state.end)

  t.throws(() => enc.uint.decode(state))

  t.end()
})

tape('int', function (t) {
  const state = enc.state()

  enc.int.preencode(state, 42)
  t.same(state, { start: 0, end: 1, buffer: null })
  enc.int.preencode(state, -4200)
  t.same(state, { start: 0, end: 4, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  enc.int.encode(state, 42)
  t.same(state, { start: 1, end: 4, buffer: Buffer.from([84, 0, 0, 0]) })
  enc.int.encode(state, -4200)
  t.same(state, { start: 4, end: 4, buffer: Buffer.from([84, 0xfd, 207, 32]) })

  state.start = 0
  t.same(enc.int.decode(state), 42)
  t.same(enc.int.decode(state), -4200)
  t.same(state.start, state.end)

  t.throws(() => enc.int.decode(state))

  t.end()
})

tape('float64', function (t) {
  const state = enc.state()

  enc.float64.preencode(state, 162.2377294)
  t.same(state, { start: 0, end: 8, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  t.same(state, { start: 0, end: 8, buffer: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]) })
  enc.float64.encode(state, 162.2377294)
  t.same(state, { start: 8, end: 8, buffer: Buffer.from([0x87, 0xc9, 0xaf, 0x7a, 0x9b, 0x47, 0x64, 0x40]) })

  state.start = 0
  t.same(enc.float64.decode(state), 162.2377294)
  t.same(state.start, state.end)

  t.throws(() => enc.float64.decode(state))

  // alignement
  state.start = 0
  state.end = 0
  state.buffer = null

  enc.int.preencode(state, 0)
  enc.float64.preencode(state, 162.2377294)
  t.same(state, { start: 0, end: 9, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  t.same(state, { start: 0, end: 9, buffer: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0]) })
  enc.int.encode(state, 0)
  enc.float64.encode(state, 162.2377294)
  t.same(state, { start: 9, end: 9, buffer: Buffer.from([0, 0x87, 0xc9, 0xaf, 0x7a, 0x9b, 0x47, 0x64, 0x40]) })

  state.start = 0
  t.same(enc.int.decode(state), 0)
  t.same(enc.float64.decode(state), 162.2377294)
  t.same(state.start, state.end)

  // subarray
  const buf = Buffer.alloc(10)
  state.start = 0
  state.buffer = buf.subarray(1)
  t.same(state, { start: 0, end: 9, buffer: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0]) })
  enc.int.encode(state, 0)
  enc.float64.encode(state, 162.2377294)
  t.same(state, { start: 9, end: 9, buffer: Buffer.from([0, 0x87, 0xc9, 0xaf, 0x7a, 0x9b, 0x47, 0x64, 0x40]) })
  t.same(buf, Buffer.from([0, 0, 0x87, 0xc9, 0xaf, 0x7a, 0x9b, 0x47, 0x64, 0x40]))

  state.start = 0
  t.same(enc.int.decode(state), 0)
  t.same(enc.float64.decode(state), 162.2377294)
  t.same(state.start, state.end)

  // 0
  state.start = 0
  state.end = 0
  state.buffer = null

  enc.float64.preencode(state, 162.2377294)
  state.buffer = Buffer.alloc(state.end)
  enc.float64.encode(state, 0)
  t.same(state, { start: 8, end: 8, buffer: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]) })

  state.start = 0
  t.same(enc.float64.decode(state), 0)
  t.same(state.start, state.end)

  // Infinity
  state.start = 0
  state.end = 0
  state.buffer = null

  enc.float64.preencode(state, Infinity)
  state.buffer = Buffer.alloc(state.end)
  enc.float64.encode(state, Infinity)
  t.same(state, { start: 8, end: 8, buffer: Buffer.from([0, 0, 0, 0, 0, 0, 0xf0, 0x7f]) })

  state.start = 0
  t.same(enc.float64.decode(state), Infinity)
  t.same(state.start, state.end)

  // Edge cases
  state.start = 0
  state.end = 0
  state.buffer = null

  enc.float64.preencode(state, 0.1 + 0.2)
  state.buffer = Buffer.alloc(state.end)
  enc.float64.encode(state, 0.1 + 0.2)
  t.same(state, { start: 8, end: 8, buffer: Buffer.from([0x34, 0x33, 0x33, 0x33, 0x33, 0x33, 0xd3, 0x3f]) })

  state.start = 0
  t.same(enc.float64.decode(state), 0.1 + 0.2)
  t.same(state.start, state.end)

  t.end()
})

tape('buffer', function (t) {
  const state = enc.state()

  enc.buffer.preencode(state, Buffer.from('hi'))
  t.same(state, { start: 0, end: 3, buffer: null })
  enc.buffer.preencode(state, Buffer.from('hello'))
  t.same(state, { start: 0, end: 9, buffer: null })
  enc.buffer.preencode(state, null)
  t.same(state, { start: 0, end: 10, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  enc.buffer.encode(state, Buffer.from('hi'))
  t.same(state, { start: 3, end: 10, buffer: Buffer.from('\x02hi\x00\x00\x00\x00\x00\x00\x00') })
  enc.buffer.encode(state, Buffer.from('hello'))
  t.same(state, { start: 9, end: 10, buffer: Buffer.from('\x02hi\x05hello\x00') })
  enc.buffer.encode(state, null)
  t.same(state, { start: 10, end: 10, buffer: Buffer.from('\x02hi\x05hello\x00') })

  state.start = 0
  t.same(enc.buffer.decode(state), Buffer.from('hi'))
  t.same(enc.buffer.decode(state), Buffer.from('hello'))
  t.same(enc.buffer.decode(state), null)
  t.same(state.start, state.end)

  t.throws(() => enc.buffer.decode(state))
  state.buffer = state.buffer.subarray(0, 8)
  state.start = 3
  t.throws(() => enc.buffer.decode(state), 'partial throws')

  t.end()
})

tape('raw', function (t) {
  const state = enc.state()

  enc.raw.preencode(state, Buffer.from('hi'))
  t.same(state, { start: 0, end: 2, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  enc.raw.encode(state, Buffer.from('hi'))
  t.same(state, { start: 2, end: 2, buffer: Buffer.from('hi') })

  state.start = 0
  t.same(enc.raw.decode(state), Buffer.from('hi'))
  t.same(state.start, state.end)

  t.end()
})

tape('uint32array', function (t) {
  const state = enc.state()

  enc.uint32array.preencode(state, new Uint32Array([1]))
  t.same(state, { start: 0, end: 5, buffer: null })
  enc.uint32array.preencode(state, new Uint32Array([42, 43]))
  t.same(state, { start: 0, end: 14, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  enc.uint32array.encode(state, new Uint32Array([1]))
  t.same(state, { start: 5, end: 14, buffer: Buffer.from([1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) })
  enc.uint32array.encode(state, new Uint32Array([42, 43]))
  t.same(state, { start: 14, end: 14, buffer: Buffer.from([1, 1, 0, 0, 0, 2, 42, 0, 0, 0, 43, 0, 0, 0]) })

  state.start = 0
  t.same(enc.uint32array.decode(state), new Uint32Array([1]))
  t.same(enc.uint32array.decode(state), new Uint32Array([42, 43]))
  t.same(state.start, state.end)

  t.throws(() => enc.uint32Array.decode(state))

  t.end()
})

tape('string', function (t) {
  const state = enc.state()

  enc.string.preencode(state, '🌾')
  t.same(state, { start: 0, end: 5, buffer: null })
  enc.string.preencode(state, 'høsten er fin')
  t.same(state, { start: 0, end: 20, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  enc.string.encode(state, '🌾')
  t.same(state, { start: 5, end: 20, buffer: Buffer.from('\x04🌾\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00') })
  enc.string.encode(state, 'høsten er fin')
  t.same(state, { start: 20, end: 20, buffer: Buffer.from('\x04🌾\x0ehøsten er fin') })

  state.start = 0
  t.same(enc.string.decode(state), '🌾')
  t.same(enc.string.decode(state), 'høsten er fin')
  t.same(state.start, state.end)

  t.throws(() => enc.string.decode(state))

  t.end()
})

tape('fixed32', function (t) {
  const state = enc.state()

  enc.fixed32.preencode(state, Buffer.alloc(32).fill('a'))
  t.same(state, { start: 0, end: 32, buffer: null })
  enc.fixed32.preencode(state, Buffer.alloc(32).fill('b'))
  t.same(state, { start: 0, end: 64, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  enc.fixed32.encode(state, Buffer.alloc(32).fill('a'))
  t.same(state, { start: 32, end: 64, buffer: Buffer.alloc(64).fill('a', 0, 32) })
  enc.fixed32.encode(state, Buffer.alloc(32).fill('b'))
  t.same(state, { start: 64, end: 64, buffer: Buffer.alloc(64).fill('a', 0, 32).fill('b', 32, 64) })

  state.start = 0
  t.same(enc.fixed32.decode(state), Buffer.alloc(32).fill('a'))
  t.same(enc.fixed32.decode(state), Buffer.alloc(32).fill('b'))
  t.same(state.start, state.end)

  t.throws(() => enc.fixed32.decode(state))

  t.end()
})

tape('fixed64', function (t) {
  const state = enc.state()

  enc.fixed64.preencode(state, Buffer.alloc(64).fill('a'))
  t.same(state, { start: 0, end: 64, buffer: null })
  enc.fixed64.preencode(state, Buffer.alloc(64).fill('b'))
  t.same(state, { start: 0, end: 128, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  enc.fixed64.encode(state, Buffer.alloc(64).fill('a'))
  t.same(state, { start: 64, end: 128, buffer: Buffer.alloc(128).fill('a', 0, 64) })
  enc.fixed64.encode(state, Buffer.alloc(64).fill('b'))
  t.same(state, { start: 128, end: 128, buffer: Buffer.alloc(128).fill('a', 0, 64).fill('b', 64, 128) })

  state.start = 0
  t.same(enc.fixed64.decode(state), Buffer.alloc(64).fill('a'))
  t.same(enc.fixed64.decode(state), Buffer.alloc(64).fill('b'))
  t.same(state.start, state.end)

  t.throws(() => enc.fixed64.decode(state))

  t.end()
})

tape('fixed n', function (t) {
  const state = enc.state()
  const fixed = enc.fixed(3)

  fixed.preencode(state, Buffer.alloc(3).fill('a'))
  t.same(state, { start: 0, end: 3, buffer: null })
  fixed.preencode(state, Buffer.alloc(3).fill('b'))
  t.same(state, { start: 0, end: 6, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  fixed.encode(state, Buffer.alloc(3).fill('a'))
  t.same(state, { start: 3, end: 6, buffer: Buffer.alloc(6).fill('a', 0, 3) })
  fixed.encode(state, Buffer.alloc(3).fill('b'))
  t.same(state, { start: 6, end: 6, buffer: Buffer.alloc(6).fill('a', 0, 3).fill('b', 3, 6) })

  state.start = 0
  t.same(fixed.decode(state), Buffer.alloc(3).fill('a'))
  t.same(fixed.decode(state), Buffer.alloc(3).fill('b'))
  t.same(state.start, state.end)

  t.throws(() => fixed.decode(state))
  state.start = 4
  t.throws(() => fixed.decode(state))

  t.end()
})

tape('array', function (t) {
  const state = enc.state()
  const arr = enc.array(enc.bool)

  arr.preencode(state, [true, false, true])
  t.same(state, { start: 0, end: 4, buffer: null })
  arr.preencode(state, [false, false, true, true])
  t.same(state, { start: 0, end: 9, buffer: null })

  state.buffer = Buffer.alloc(state.end)
  arr.encode(state, [true, false, true])
  t.same(state, { start: 4, end: 9, buffer: Buffer.from([3, 1, 0, 1, 0, 0, 0, 0, 0]) })
  arr.encode(state, [false, false, true, true])
  t.same(state, { start: 9, end: 9, buffer: Buffer.from([3, 1, 0, 1, 4, 0, 0, 1, 1]) })

  state.start = 0
  t.same(arr.decode(state), [true, false, true])
  t.same(arr.decode(state), [false, false, true, true])
  t.same(state.start, state.end)

  t.throws(() => arr.decode(state))

  t.end()
})
