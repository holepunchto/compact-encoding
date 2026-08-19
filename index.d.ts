interface State<T extends Uint8Array = Uint8Array> {
  start: number
  end: number
  buffer: T | null
}

export function state<T extends Uint8Array = Uint8Array>(
  start?: number,
  end?: number,
  buffer?: T | null
): State<T>

interface Encoder<Input = unknown, Output = Input> {
  preencode(state: State, val: Input): void
  encode(state: State, val: Input): void
  decode(state: State): Output
}

interface Raw<T extends Uint8Array = Uint8Array> extends Encoder<T> {
  buffer: Encoder<T>
  binary: Encoder<string | T, T>
  arraybuffer: Encoder<ArrayBuffer>

  uint8array: Encoder<Uint8Array>
  uint16array: Encoder<Uint16Array>
  uint32array: Encoder<Uint32Array>

  int8array: Encoder<Int8Array>
  int16array: Encoder<Int16Array>
  int32array: Encoder<Int32Array>

  biguint64array: Encoder<BigUint64Array>
  bigint64array: Encoder<BigInt64Array>

  float32array: Encoder<Float32Array>
  float64array: Encoder<Float64Array>

  string: Encoder<string>
  utf8: Encoder<string>
  ascii: Encoder<string>
  hex: Encoder<string>
  base64: Encoder<string>
  ucs2: Encoder<string>
  utf16le: Encoder<string>

  array: <I, O = I>(enc: Encoder<I, O>) => Encoder<I[], O[]>

  json: Encoder<unknown>
  ndjson: Encoder<unknown>
}

export const raw: Raw

export const uint: Encoder<number>
export const uint8: Encoder<number>
export const uint16: Encoder<number>
export const uint24: Encoder<number>
export const uint32: Encoder<number>
export const uint32be: Encoder<number>
export const uint40: Encoder<number>
export const uint48: Encoder<number>
export const uint56: Encoder<number>
export const uint64: Encoder<number>
export const uint64be: Encoder<number>

export const int: Encoder<number>
export const int8: Encoder<number>
export const int16: Encoder<number>
export const int24: Encoder<number>
export const int32: Encoder<number>
export const int40: Encoder<number>
export const int48: Encoder<number>
export const int56: Encoder<number>
export const int64: Encoder<number>

export const biguint64: Encoder<bigint>
export const bigint64: Encoder<bigint>
export const biguint: Encoder<bigint>
export const bigint: Encoder<bigint>

export const lexint: Encoder<number>

export const float32: Encoder<number>
export const float64: Encoder<number>

export const buffer: Encoder<Uint8Array>
export const optionalBuffer: Encoder<Uint8Array | null>
export const binary: Encoder<string | Uint8Array, Uint8Array>
export const arraybuffer: Encoder<ArrayBuffer>

export const uint8array: Encoder<Uint8Array>
export const uint16array: Encoder<Uint16Array>
export const uint32array: Encoder<Uint32Array>

export const int8array: Encoder<Int8Array>
export const int16array: Encoder<Int16Array>
export const int32array: Encoder<Int32Array>

export const biguint64array: Encoder<BigUint64Array>
export const bigint64array: Encoder<BigInt64Array>

export const float32array: Encoder<Float32Array>
export const float64array: Encoder<Float64Array>

interface StringEncoder<T = unknown> extends Encoder<T> {
  fixed(n: number): Encoder<T>
}

export const string: StringEncoder<string>
export const utf8: StringEncoder<string>
export const ascii: StringEncoder<string>
export const hex: StringEncoder<string>
export const base64: StringEncoder<string>
export const ucs2: StringEncoder<string>
export const utf16le: StringEncoder<string>

export const bool: Encoder<boolean>

export function fixed(n: number): Encoder<Uint8Array>
export const fixed32: Encoder<Uint8Array>
export const fixed64: Encoder<Uint8Array>

export function array<I, O>(enc: Encoder<I, O>): Encoder<I[], O[]>

export function frame<I, O>(enc: Encoder<I, O>): Encoder<I, O>

export const date: Encoder<Date>

export const json: Encoder<unknown>
export const ndjson: Encoder<unknown>
export const none: Encoder<unknown, null>
export const any: Encoder<unknown>

interface AddressInput {
  host: string
  port: number
}

interface Address<F extends 4 | 6 = 4 | 6> extends AddressInput {
  family: F
}

export const port: Encoder<number>
export const ipv4: Encoder<string>
export const ipv4Address: Encoder<AddressInput, Address<4>>
export const ipv6: Encoder<string>
export const ipv6Address: Encoder<AddressInput, Address<6>>
export const ip: Encoder<string>
export const ipAddress: Encoder<AddressInput, Address>

export function record<I, O = I>(
  keyEncoding: Encoder<string>,
  valueEncoder: Encoder<I, O>
): Encoder<Record<string, I>, Record<string, O>>

export const stringRecord: Encoder<Record<string, string>>

interface CodecLike<Input, Output = Input> {
  encode(value: Input): Uint8Array
  decode(buffer: Uint8Array): Output
}

interface AbstractEncode<Input> {
  (value: Input, buffer: Uint8Array, offset: number): unknown
  bytes: number
}

interface AbstractDecode<Output> {
  (buffer: Uint8Array, start: number, end: number): Output
  bytes: number
}

interface AbstractEncodingLike<Input, Output = Input> {
  encodingLength(value: Input): number
  encode: AbstractEncode<Input>
  decode: AbstractDecode<Output>
}

export function from(name: 'ascii'): Raw['ascii']
export function from(name: 'utf-8' | 'utf8'): Raw['utf8']
export function from(name: 'hex'): Raw['hex']
export function from(name: 'base64'): Raw['base64']
export function from(
  name: 'utf16-le' | 'utf16le' | 'ucs-2' | 'ucs2'
): Raw['ucs2']
export function from(name: 'ndjson'): Raw['ndjson']
export function from(name: 'json'): Raw['json']
export function from(name: 'binary' | string): Raw['binary']
export function from<I, O>(enc: Encoder<I, O>): Encoder<I, O>
export function from<I, O>(enc: CodecLike<I, O>): Encoder<I, O>
export function from<I, O>(enc: AbstractEncodingLike<I, O>): Encoder<I, O>

export function encode<Input = unknown, Output = Input>(
  enc: Encoder<Input, Output>,
  m: Input
): Uint8Array

export function decode<Input = unknown, Output = Input>(
  enc: Encoder<Input, Output>,
  buffer: Uint8Array
): Output

export type { State, Encoder, Raw, StringEncoder, AddressInput, Address }
