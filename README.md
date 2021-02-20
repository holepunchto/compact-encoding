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

#### `enc.preencode(state, val)`

Does a fast preencode dry-run that only sets state.end.
Use this to figure out how big of a buffer you need.

#### `enc.encode(state, val)`

Encodes `val` into `state.buffer` at position `state.start`.
Updates `state.start` to point after the encoded value when done.

#### `val = enc.decode(state)`

Decodes a value from `state.buffer` as position `state.start`.
Updates `state.start` to point after the decoded value when done in the buffer.

## Bundled encodings

The following encodings are bundled as they are primitives that can be used
to build others on top. Feel free to PR more that are missing.

* `cenc.uint` - Encodes a uint using [compact-uint](https://github.com/mafintosh/compact-uint)
* `cenc.int` - Encodes an int using [compact-uint](https://github.com/mafintosh/compact-uint) as a signed int using ZigZag encoding.
* `cenc.buffer` - Encodes a buffer with it's length uint prefixed. When decoding an empty buf, null is returned.
* `cenc.raw` - Pass through encodes a buffer - ie a basic copy.
* `cenc.uint32array` - Encodes a uint32array with it's length uint32 prefixed along with a 2 bit padding for alignment.
* `cenc.bool` - Encodes a boolean as 1 or 0.
* `cenc.string` - Encodes a utf-8 string, similar to buffer.
* `cenc.fixed32` - Encodes a fixed 32 byte buffer.
* `cenc.fixed64` - Encodes a fixed 64 byte buffer.
* `cenc.fixed(n)` - Makes a fixed sized encoder.
* `cenc.array(enc)` - Makes an array encoder from another encoder. Arrays are uint prefixed with their length.
* `cenc.from(enc)` - Makes a compact encoder from a [codec](https://github.com/mafintosh/codecs) or [abstract-encoding](https://github.com/mafintosh/abstract-encoding)

## License

MIT
