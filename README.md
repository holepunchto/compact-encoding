# compact-encoding

A series of compact encoding schemes for building small and fast parsers and serializers

```
npm install compact-encoding
```

## Usage

``` js
const cenc = require('compact-encoding')

const state = { start: 0, end: 0, buffer: null }

// use preencode to figure out how big a buffer is needed
cenc.uint.preencode(state, 42)
cenc.string.preencode(state, 'hi')

console.log(state) // { start: 0, end: 4, buffer: null }

state.buffer = Buffer.allocUnsafe(state.end)

// then use encode to actually encode it to the buffer
cenc.uint.encode(state, 42)
cenc.string.encode(state, 'hi')

// to decode it simply use decode instead

state.start = 0
cenc.uint.decode(state) // 42
cenc.string.decode(state) // 'hi'
```

## Encoder API

#### `state`

Should be an object that looks like this `{ start, end, buffer }`.

You can also get a blank state object using `cenc.state()`.

* `start` is the byte offset to start encoding/decoding at.
* `end` is the byte offset indicating the end of the buffer.
* `buffer` should be either a Node.js Buffer or Uint8Array.

#### `enc.preencode(state, val)`

Does a fast preencode dry-run that only sets state.end.
Use this to figure out how big of a buffer you need.

#### `enc.encode(state, val)`

Encodes `val` into `state.buffer` at position `state.start`.
Updates `state.start` to point after the encoded value when done.

#### `val = enc.decode(state)`

Decodes a value from `state.buffer` as position `state.start`.
Updates `state.start` to point after the decoded value when done in the buffer.

## Helpers

If you are just encoding to a buffer or decoding from one you can use the `encode` and `decode` helpers
to reduce your boilerplate

``` js
const buf = cenc.encode(cenc.bool, true)
const bool = cenc.decode(cenc.bool, buf)
```

## Bundled encodings

The following encodings are bundled as they are primitives that can be used
to build others on top. Feel free to PR more that are missing.

* `cenc.uint` - Encodes a uint using [compact-uint](https://github.com/mafintosh/compact-uint).
* `cenc.uint8` - Encodes a fixed size uint8.
* `cenc.uint16` - Encodes a fixed size uint16. Useful for things like ports.
* `cenc.uint24` - Encodes a fixed size uint24. Useful for message framing.
* `cenc.uint32` - Encodes a fixed size uint32. Useful for very large message framing.
* `cenc.uint64` - Encodes a fixed size uint64.
* `cenc.int` - Encodes an int using `cenc.uint` with ZigZag encoding.
* `cenc.int8` - Encodes a fixed size int8 using `cenc.uint8` with ZigZag encoding.
* `cenc.int16` - Encodes a fixed size int16 using `cenc.uint16` with ZigZag encoding.
* `cenc.int24` - Encodes a fixed size int24 using `cenc.uint24` with ZigZag encoding.
* `cenc.int32` - Encodes a fixed size int32 using `cenc.uint32` with ZigZag encoding.
* `cenc.int64` - Encodes a fixed size int64 using `cenc.uint64` with ZigZag encoding.
* `cenc.float32` - Encodes a fixed size float32.
* `cenc.float64` - Encodes a fixed size float64.
* `cenc.buffer` - Encodes a buffer with its length uint prefixed. When decoding an empty buffer, `null` is returned.
* `cenc.raw` - Pass through encodes a buffer, i.e. a basic copy.
* `cenc.uint32array` - Encodes a uint32array with its element length uint32 prefixed.
* `cenc.bool` - Encodes a boolean as 1 or 0.
* `cenc.string` - Encodes a utf-8 string, similar to buffer.
* `cenc.fixed32` - Encodes a fixed 32 byte buffer.
* `cenc.fixed64` - Encodes a fixed 64 byte buffer.
* `cenc.fixed(n)` - Makes a fixed sized encoder.
* `cenc.array(enc)` - Makes an array encoder from another encoder. Arrays are uint prefixed with their length.
* `cenc.from(enc)` - Makes a compact encoder from a [codec](https://github.com/mafintosh/codecs) or [abstract-encoding](https://github.com/mafintosh/abstract-encoding).

## License

MIT
