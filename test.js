const enc = require('./')
const tape = require('brittle')

tape('uint', function (t) {
  const state = enc.state()

  enc.uint.preencode(state, 42)
  t.alike(state, enc.state(0, 1))
  enc.uint.preencode(state, 4200)
  t.alike(state, enc.state(0, 4))
  enc.uint.preencode(state, Number.MAX_SAFE_INTEGER)
  t.alike(state, enc.state(0, 13))

  state.buffer = Buffer.alloc(state.end)
  enc.uint.encode(state, 42)
  t.alike(state, enc.state(1, 13, Buffer.from([42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])))
  enc.uint.encode(state, 4200)
  t.alike(state, enc.state(4, 13, Buffer.from([42, 0xfd, 104, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0])))
  enc.uint.encode(state, Number.MAX_SAFE_INTEGER)
  t.alike(state, enc.state(13, 13, Buffer.from([42, 0xfd, 104, 16, 0xff, 255, 255, 255, 255, 255, 255, 31, 0])))

  state.start = 0
  t.is(enc.uint.decode(state), 42)
  t.is(enc.uint.decode(state), 4200)
  t.is(enc.uint.decode(state), Number.MAX_SAFE_INTEGER)
  t.is(state.start, state.end)

  t.exception(() => enc.uint.decode(state))
})

tape('int', function (t) {
  const state = enc.state()

  enc.int.preencode(state, 42)
  t.alike(state, enc.state(0, 1))
  enc.int.preencode(state, -4200)
  t.alike(state, enc.state(0, 4))

  state.buffer = Buffer.alloc(state.end)
  enc.int.encode(state, 42)
  t.alike(state, enc.state(1, 4, Buffer.from([84, 0, 0, 0])))
  enc.int.encode(state, -4200)
  t.alike(state, enc.state(4, 4, Buffer.from([84, 0xfd, 207, 32])))

  state.start = 0
  t.is(enc.int.decode(state), 42)
  t.is(enc.int.decode(state), -4200)
  t.is(state.start, state.end)

  t.exception(() => enc.int.decode(state))
})

tape('float64', function (t) {
  const state = enc.state()

  enc.float64.preencode(state, 162.2377294)
  t.alike(state, enc.state(0, 8))

  state.buffer = Buffer.alloc(state.end)
  t.alike(state, enc.state(0, 8, Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])))
  enc.float64.encode(state, 162.2377294)
  t.alike(state, enc.state(8, 8, Buffer.from([0x87, 0xc9, 0xaf, 0x7a, 0x9b, 0x47, 0x64, 0x40])))

  state.start = 0
  t.is(enc.float64.decode(state), 162.2377294)
  t.is(state.start, state.end)

  t.exception(() => enc.float64.decode(state))

  // alignement
  state.start = 0
  state.end = 0
  state.buffer = null

  enc.int.preencode(state, 0)
  enc.float64.preencode(state, 162.2377294)
  t.alike(state, enc.state(0, 9))

  state.buffer = Buffer.alloc(state.end)
  t.alike(state, enc.state(0, 9, Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0])))
  enc.int.encode(state, 0)
  enc.float64.encode(state, 162.2377294)
  t.alike(state, enc.state(9, 9, Buffer.from([0, 0x87, 0xc9, 0xaf, 0x7a, 0x9b, 0x47, 0x64, 0x40])))

  state.start = 0
  t.is(enc.int.decode(state), 0)
  t.is(enc.float64.decode(state), 162.2377294)
  t.is(state.start, state.end)

  // subarray
  const buf = Buffer.alloc(10)
  state.start = 0
  state.buffer = buf.subarray(1)
  t.alike(state, enc.state(0, 9, Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0])))
  enc.int.encode(state, 0)
  enc.float64.encode(state, 162.2377294)
  t.alike(state, enc.state(9, 9, Buffer.from([0, 0x87, 0xc9, 0xaf, 0x7a, 0x9b, 0x47, 0x64, 0x40])))
  t.alike(buf, Buffer.from([0, 0, 0x87, 0xc9, 0xaf, 0x7a, 0x9b, 0x47, 0x64, 0x40]))

  state.start = 0
  t.is(enc.int.decode(state), 0)
  t.is(enc.float64.decode(state), 162.2377294)
  t.is(state.start, state.end)

  // 0
  state.start = 0
  state.end = 0
  state.buffer = null

  enc.float64.preencode(state, 162.2377294)
  state.buffer = Buffer.alloc(state.end)
  enc.float64.encode(state, 0)
  t.alike(state, enc.state(8, 8, Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])))

  state.start = 0
  t.is(enc.float64.decode(state), 0)
  t.is(state.start, state.end)

  // Infinity
  state.start = 0
  state.end = 0
  state.buffer = null

  enc.float64.preencode(state, Infinity)
  state.buffer = Buffer.alloc(state.end)
  enc.float64.encode(state, Infinity)
  t.alike(state, enc.state(8, 8, Buffer.from([0, 0, 0, 0, 0, 0, 0xf0, 0x7f])))

  state.start = 0
  t.is(enc.float64.decode(state), Infinity)
  t.is(state.start, state.end)

  // Edge cases
  state.start = 0
  state.end = 0
  state.buffer = null

  enc.float64.preencode(state, 0.1 + 0.2)
  state.buffer = Buffer.alloc(state.end)
  enc.float64.encode(state, 0.1 + 0.2)
  t.alike(state, enc.state(8, 8, Buffer.from([0x34, 0x33, 0x33, 0x33, 0x33, 0x33, 0xd3, 0x3f])))

  state.start = 0
  t.is(enc.float64.decode(state), 0.1 + 0.2)
  t.is(state.start, state.end)
})

tape('buffer', function (t) {
  const state = enc.state()

  enc.buffer.preencode(state, Buffer.from('hi'))
  t.alike(state, enc.state(0, 3))
  enc.buffer.preencode(state, Buffer.from('hello'))
  t.alike(state, enc.state(0, 9))
  enc.buffer.preencode(state, null)
  t.alike(state, enc.state(0, 10))

  state.buffer = Buffer.alloc(state.end)
  enc.buffer.encode(state, Buffer.from('hi'))
  t.alike(state, enc.state(3, 10, Buffer.from('\x02hi\x00\x00\x00\x00\x00\x00\x00')))
  enc.buffer.encode(state, Buffer.from('hello'))
  t.alike(state, enc.state(9, 10, Buffer.from('\x02hi\x05hello\x00')))
  enc.buffer.encode(state, null)
  t.alike(state, enc.state(10, 10, Buffer.from('\x02hi\x05hello\x00')))

  state.start = 0
  t.alike(enc.buffer.decode(state), Buffer.from('hi'))
  t.alike(enc.buffer.decode(state), Buffer.from('hello'))
  t.is(enc.buffer.decode(state), null)
  t.is(state.start, state.end)

  t.exception(() => enc.buffer.decode(state))
})

tape('raw', function (t) {
  const state = enc.state()

  enc.raw.preencode(state, Buffer.from('hi'))
  t.alike(state, enc.state(0, 2))

  state.buffer = Buffer.alloc(state.end)
  enc.raw.encode(state, Buffer.from('hi'))
  t.alike(state, enc.state(2, 2, Buffer.from('hi')))

  state.start = 0
  t.alike(enc.raw.decode(state), Buffer.from('hi'))
  t.is(state.start, state.end)
})

tape('uint16array', function (t) {
  const state = enc.state()

  enc.uint16array.preencode(state, new Uint16Array([1, 2, 3]))
  t.alike(state, enc.state(0, 7))

  state.buffer = Buffer.alloc(state.end)
  enc.uint16array.encode(state, new Uint16Array([1, 2, 3]))
  t.alike(state, enc.state(7, 7, Buffer.from([3, 1, 0, 2, 0, 3, 0])))

  state.start = 0
  t.alike(enc.uint16array.decode(state), new Uint16Array([1, 2, 3]))
  t.is(state.start, state.end)

  t.exception(() => enc.uint16array.decode(state))
})

tape('uint32array', function (t) {
  const state = enc.state()

  enc.uint32array.preencode(state, new Uint32Array([1]))
  t.alike(state, enc.state(0, 5))
  enc.uint32array.preencode(state, new Uint32Array([42, 43]))
  t.alike(state, enc.state(0, 14))

  state.buffer = Buffer.alloc(state.end)
  enc.uint32array.encode(state, new Uint32Array([1]))
  t.alike(state, enc.state(5, 14, Buffer.from([1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])))
  enc.uint32array.encode(state, new Uint32Array([42, 43]))
  t.alike(state, enc.state(14, 14, Buffer.from([1, 1, 0, 0, 0, 2, 42, 0, 0, 0, 43, 0, 0, 0])))

  state.start = 0
  t.alike(enc.uint32array.decode(state), new Uint32Array([1]))
  t.alike(enc.uint32array.decode(state), new Uint32Array([42, 43]))
  t.is(state.start, state.end)

  t.exception(() => enc.uint32array.decode(state))
})

tape('int16array', function (t) {
  const state = enc.state()

  enc.int16array.preencode(state, new Int16Array([1, -2, 3]))
  t.alike(state, enc.state(0, 7))

  state.buffer = Buffer.alloc(state.end)
  enc.int16array.encode(state, new Int16Array([1, -2, 3]))
  t.alike(state, enc.state(7, 7, Buffer.from([3, 1, 0, 0xfe, 0xff, 3, 0])))

  state.start = 0
  t.alike(enc.int16array.decode(state), new Int16Array([1, -2, 3]))
  t.is(state.start, state.end)

  t.exception(() => enc.int16array.decode(state))
})

tape('int32array', function (t) {
  const state = enc.state()

  enc.int32array.preencode(state, new Int32Array([1, -2, 3]))
  t.alike(state, enc.state(0, 13))

  state.buffer = Buffer.alloc(state.end)
  enc.int32array.encode(state, new Int32Array([1, -2, 3]))
  t.alike(state, enc.state(13, 13, Buffer.from([3, 1, 0, 0, 0, 0xfe, 0xff, 0xff, 0xff, 3, 0, 0, 0])))

  state.start = 0
  t.alike(enc.int32array.decode(state), new Int32Array([1, -2, 3]))
  t.is(state.start, state.end)

  t.exception(() => enc.int32array.decode(state))
})

tape('float32array', function (t) {
  const state = enc.state()

  enc.float32array.preencode(state, new Float32Array([1.1, -2.2, 3.3]))
  t.alike(state, enc.state(0, 13))

  state.buffer = Buffer.alloc(state.end)
  enc.float32array.encode(state, new Float32Array([1.1, -2.2, 3.3]))
  t.alike(state, enc.state(13, 13, Buffer.from([3, 0xcd, 0xcc, 0x8c, 0x3f, 0xcd, 0xcc, 0x0c, 0xc0, 0x33, 0x33, 0x53, 0x40])))

  state.start = 0
  t.alike(enc.float32array.decode(state), new Float32Array([1.1, -2.2, 3.3]))
  t.is(state.start, state.end)

  t.exception(() => enc.float32array.decode(state))
})

tape('float64array', function (t) {
  const state = enc.state()

  enc.float64array.preencode(state, new Float64Array([1.1, -2.2, 3.3]))
  t.alike(state, enc.state(0, 25))

  state.buffer = Buffer.alloc(state.end)
  enc.float64array.encode(state, new Float64Array([1.1, -2.2, 3.3]))
  t.alike(state, enc.state(25, 25, Buffer.from([3, 0x9a, 0x99, 0x99, 0x99, 0x99, 0x99, 0xf1, 0x3f, 0x9a, 0x99, 0x99, 0x99, 0x99, 0x99, 0x01, 0xc0, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x0a, 0x40])))

  state.start = 0
  t.alike(enc.float64array.decode(state), new Float64Array([1.1, -2.2, 3.3]))
  t.is(state.start, state.end)

  t.exception(() => enc.float64array.decode(state))
})

tape('string', function (t) {
  const state = enc.state()

  enc.string.preencode(state, '🌾')
  t.alike(state, enc.state(0, 5))
  enc.string.preencode(state, 'høsten er fin')
  t.alike(state, enc.state(0, 20))

  state.buffer = Buffer.alloc(state.end)
  enc.string.encode(state, '🌾')
  t.alike(state, enc.state(5, 20, Buffer.from('\x04🌾\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00')))
  enc.string.encode(state, 'høsten er fin')
  t.alike(state, enc.state(20, 20, Buffer.from('\x04🌾\x0ehøsten er fin')))

  state.start = 0
  t.is(enc.string.decode(state), '🌾')
  t.is(enc.string.decode(state), 'høsten er fin')
  t.is(state.start, state.end)

  t.exception(() => enc.string.decode(state))
})

tape('fixed32', function (t) {
  const state = enc.state()

  enc.fixed32.preencode(state, Buffer.alloc(32).fill('a'))
  t.alike(state, enc.state(0, 32))
  enc.fixed32.preencode(state, Buffer.alloc(32).fill('b'))
  t.alike(state, enc.state(0, 64))

  state.buffer = Buffer.alloc(state.end)
  enc.fixed32.encode(state, Buffer.alloc(32).fill('a'))
  t.alike(state, enc.state(32, 64, Buffer.alloc(64).fill('a', 0, 32)))
  enc.fixed32.encode(state, Buffer.alloc(32).fill('b'))
  t.alike(state, enc.state(64, 64, Buffer.alloc(64).fill('a', 0, 32).fill('b', 32, 64)))

  state.start = 0
  t.alike(enc.fixed32.decode(state), Buffer.alloc(32).fill('a'))
  t.alike(enc.fixed32.decode(state), Buffer.alloc(32).fill('b'))
  t.is(state.start, state.end)

  t.exception(() => enc.fixed32.decode(state))
})

tape('fixed64', function (t) {
  const state = enc.state()

  enc.fixed64.preencode(state, Buffer.alloc(64).fill('a'))
  t.alike(state, enc.state(0, 64))
  enc.fixed64.preencode(state, Buffer.alloc(64).fill('b'))
  t.alike(state, enc.state(0, 128))

  state.buffer = Buffer.alloc(state.end)
  enc.fixed64.encode(state, Buffer.alloc(64).fill('a'))
  t.alike(state, enc.state(64, 128, Buffer.alloc(128).fill('a', 0, 64)))
  enc.fixed64.encode(state, Buffer.alloc(64).fill('b'))
  t.alike(state, enc.state(128, 128, Buffer.alloc(128).fill('a', 0, 64).fill('b', 64, 128)))

  state.start = 0
  t.alike(enc.fixed64.decode(state), Buffer.alloc(64).fill('a'))
  t.alike(enc.fixed64.decode(state), Buffer.alloc(64).fill('b'))
  t.is(state.start, state.end)

  t.exception(() => enc.fixed64.decode(state))
})

tape('fixed n', function (t) {
  const state = enc.state()
  const fixed = enc.fixed(3)

  fixed.preencode(state, Buffer.alloc(3).fill('a'))
  t.alike(state, enc.state(0, 3))
  fixed.preencode(state, Buffer.alloc(3).fill('b'))
  t.alike(state, enc.state(0, 6))

  state.buffer = Buffer.alloc(state.end)
  fixed.encode(state, Buffer.alloc(3).fill('a'))
  t.alike(state, enc.state(3, 6, Buffer.alloc(6).fill('a', 0, 3)))
  fixed.encode(state, Buffer.alloc(3).fill('b'))
  t.alike(state, enc.state(6, 6, Buffer.alloc(6).fill('a', 0, 3).fill('b', 3, 6)))

  state.start = 0
  t.alike(fixed.decode(state), Buffer.alloc(3).fill('a'))
  t.alike(fixed.decode(state), Buffer.alloc(3).fill('b'))
  t.is(state.start, state.end)

  t.exception(() => fixed.decode(state))
  state.start = 4
  t.exception(() => fixed.decode(state))
})

tape('array', function (t) {
  const state = enc.state()
  const arr = enc.array(enc.bool)

  arr.preencode(state, [true, false, true])
  t.alike(state, enc.state(0, 4))
  arr.preencode(state, [false, false, true, true])
  t.alike(state, enc.state(0, 9))

  state.buffer = Buffer.alloc(state.end)
  arr.encode(state, [true, false, true])
  t.alike(state, enc.state(4, 9, Buffer.from([3, 1, 0, 1, 0, 0, 0, 0, 0])))
  arr.encode(state, [false, false, true, true])
  t.alike(state, enc.state(9, 9, Buffer.from([3, 1, 0, 1, 4, 0, 0, 1, 1])))

  state.start = 0
  t.alike(arr.decode(state), [true, false, true])
  t.alike(arr.decode(state), [false, false, true, true])
  t.is(state.start, state.end)

  t.exception(() => arr.decode(state))
})

tape('json', function (t) {
  const state = enc.state()

  enc.json.preencode(state, { a: 1, b: 2 })
  t.alike(state, enc.state(0, 14))

  state.buffer = Buffer.alloc(state.end)
  enc.json.encode(state, { a: 1, b: 2 })
  t.alike(state, enc.state(14, 14, Buffer.concat([
    Buffer.from([13]),
    Buffer.from('{"a":1,"b":2}')
  ])))

  state.start = 0
  t.alike(enc.json.decode(state), { a: 1, b: 2 })

  t.exception(() => enc.json.decode(state))
})

tape('lexint: big numbers', function (t) {
  t.plan(1)

  let prev = enc.encode(enc.lexint, 0)

  let n
  let skip = 1

  for (n = 1; n < Number.MAX_VALUE; n += skip) {
    const cur = enc.encode(enc.lexint, n)
    if (Buffer.compare(cur, prev) < 1) break
    prev = cur
    skip = 1 + Math.pow(245, Math.ceil(Math.log(n) / Math.log(256)))
  }
  t.is(n, Infinity)
})

tape('lexint: range precision', function (t) {
  t.plan(2)
  const a = 1e55
  const b = 1.0000000000001e55
  const ha = enc.encode(enc.lexint, a).toString('hex')
  const hb = enc.encode(enc.lexint, b).toString('hex')
  t.not(a, b)
  t.not(ha, hb)
})

tape('lexint: range precision', function (t) {
  let prev = enc.encode(enc.lexint, 0)
  const skip = 0.000000001e55
  for (let i = 0, n = 1e55; i < 1000; n = 1e55 + skip * ++i) {
    const cur = enc.encode(enc.lexint, n)
    if (Buffer.compare(cur, prev) < 1) t.fail('cur <= prev')
    prev = cur
  }
  t.ok(true)
  t.end()
})

tape('lexint: small numbers', function (t) {
  let prev = enc.encode(enc.lexint, 0)
  for (let n = 1; n < 256 * 256 * 16; n++) {
    const cur = enc.encode(enc.lexint, n)
    if (Buffer.compare(cur, prev) < 1) t.fail('cur <= prev')
    prev = cur
  }
  t.ok(true)
  t.end()
})

tape('lexint: throws', function (t) {
  t.exception(() => {
    enc.decode(enc.lexint, Buffer.alloc(1, 251))
  })

  let num = 252

  const state = enc.state()

  enc.lexint.preencode(state, num)
  state.buffer = Buffer.alloc(state.end - state.start)
  enc.lexint.encode(state, num)

  t.exception(() => {
    enc.decode(enc.lexint, state.buffer.subarray(0, state.buffer.byteLength - 2))
  })

  num <<= 8

  state.start = 0
  state.end = 0
  state.buffer = null

  enc.lexint.preencode(state, num)
  state.buffer = Buffer.alloc(state.end - state.start)
  enc.lexint.encode(state, num)

  t.exception(() => {
    enc.decode(enc.lexint, state.buffer.subarray(0, state.buffer.byteLength - 2))
  })

  num <<= 8

  state.start = 0
  state.end = 0
  state.buffer = null

  enc.lexint.preencode(state, num)
  state.buffer = Buffer.alloc(state.end - state.start)
  enc.lexint.encode(state, num)

  t.exception(() => {
    enc.decode(enc.lexint, state.buffer.subarray(0, state.buffer.byteLength - 2))
  })

  num *= 256

  state.start = 0
  state.end = 0
  state.buffer = null

  enc.lexint.preencode(state, num)
  state.buffer = Buffer.alloc(state.end - state.start)
  enc.lexint.encode(state, num)

  t.exception(() => {
    enc.decode(enc.lexint, state.buffer.subarray(0, state.buffer.byteLength - 2))
  })

  num *= 256 * 256

  state.start = 0
  state.end = 0
  state.buffer = null

  enc.lexint.preencode(state, num)
  state.buffer = Buffer.alloc(state.end - state.start)
  enc.lexint.encode(state, num)

  t.exception(() => {
    enc.decode(enc.lexint, state.buffer.subarray(0, state.buffer.byteLength - 2))
  })

  t.end()
})

tape('lexint: unpack', function (t) {
  let n
  let skip = 1

  for (n = 1; n < Number.MAX_VALUE; n += skip) {
    const cur = enc.encode(enc.lexint, n)
    compare(n, enc.decode(enc.lexint, cur))
    skip = 1 + Math.pow(245, Math.ceil(Math.log(n) / Math.log(256)))
  }
  t.is(n, Infinity)
  t.end()

  function compare (a, b) {
    const desc = a + ' !=~ ' + b
    if (/e\+\d+$/.test(a) || /e\+\d+$/.test(b)) {
      if (String(a).slice(0, 8) !== String(b).slice(0, 8) ||
        /e\+(\d+)$/.exec(a)[1] !== /e\+(\d+)$/.exec(b)[1]) {
        t.fail(desc)
      }
    } else {
      if (String(a).slice(0, 8) !== String(b).slice(0, 8) ||
       String(a).length !== String(b).length) {
        t.fail(desc)
      }
    }
  }
})
