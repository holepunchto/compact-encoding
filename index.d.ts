interface State<T extends Uint8Array = Uint8Array> {
  start: number
  end: number
  buffer: T | null
}

export function state<T extends Uint8Array = Uint8Array>(
  start?: number,
  end?: number,
  buffer?: T | null
): State

interface Encoder<T = unknown> {
  preencode(state: State, val: T): void
  encode(state: State, val: T): void
  decode(state: State): T
}

interface Raw<T extends Uint8Array = Uint8Array> extends Encoder<T> {
  buffer: Encoder<T>
  binary: Encoder<string | T>
  arraybuffer: Encoder<ArrayBuffer>

  uint8array: Encoder<Uint8Array>
  uint16array: Encoder<Uint16Array>
  uint32array: Encoder<Uint32Array>

  int8: Encoder<number>
  int16: Encoder<number>
  int24: Encoder<number>

  biguint64array: Encoder<BigUint64Array>
  bigint64array: Encoder<BigInt64Array>

  float32: Encoder<number>
  float64: Encoder<number>

  string: StringEncoder<string>
  utf8: StringEncoder<string>
  ascii: StringEncoder<string>
  hex: StringEncoder<string>
  base64: StringEncoder<string>
  ucs2: StringEncoder<string>

  array: <T>(enc: Encoder<T>) => Encoder<T[]>

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

export const lexint: Encoder<unknown>

export const float32: Encoder<number>
export const float64: Encoder<number>

export const buffer: Encoder<Uint8Array>
export const optionalBuffer: Encoder<Uint8Array | null>
export const binary: Encoder<string | Uint8Array>
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

export function array<T>(enc: Encoder<T>): Encoder<T[]>

export function frame(enc: Encoder): Encoder

export const date: Encoder<Date>

export const json: Encoder<unknown>
export const ndjson: Encoder<unknown>
export const none: Encoder<unknown>
export const any: Encoder<unknown>

export const port: Encoder<number>
export const ipv4: Encoder<string>
export const ipv4Address: Encoder<{ host: 'string'; port: number }>
export const ipv6: Encoder<string>
export const ipv6Address: Encoder<{ host: 'string'; port: number }>
export const ip: Encoder<string>
export const ipAddress: Encoder<{ host: 'string'; port: number }>

export function record<T = unknown>(
  keyEncoding: Encoder,
  valueEncoder: Encoder<T>
): Encoder<Record<string, T>>
export const stringRecord: Encoder<Record<string, string>>

export function from(enc: Encoder): Encoder

export function encode<T = unknown, B extends Uint8Array = Uint8Array>(
  enc: Encoder<T>,
  m: T
): B

export function decode<T = unknown, B extends Uint8Array = Uint8Array>(
  enc: Encoder<T>,
  buffer: B
): T

export type { State, Encoder, StringEncoder }
