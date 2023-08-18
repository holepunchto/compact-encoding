declare module 'compact-encoding' {
  import * as rawModule from 'compact-encoding/raw';
  import * as lexintModule from 'compact-encoding/lexint';

  /** Pass through encodes a buffer, i.e. a basic copy. */
  export const raw: typeof rawModule;
  /** Encodes an int using lexicographic-integer encoding so that encoded values are lexicographically sorted in ascending numerical order. */
  export const lexint: typeof lexintModule;
  type JSONLiteral = string | number | boolean | null;

  type JSONObject = {[x: string]: JSONValue};
  type JSONArray = Array<JSONValue>;
  export type JSONValue = JSONLiteral | JSONObject | JSONArray;

  export type State = {
    start: number;
    end: number;
    buffer: Buffer | Uint8Array | null;
    cache: unknown;
  };
  export function state(
    start?: number,
    end?: number,
    buffer?: Buffer | Uint8Array,
  ): State;

  export type CEncoding<T, I = T, P = I> = {
    preencode(state: State, value: P): void;
    encode(state: State, value: I): void;
    decode(state: State): T;
  };
  export type InferCEncoding<E extends CEncoding<any>> = E extends CEncoding<
    infer T
  >
    ? T
    : never;
  export type BufferCEncoding = CEncoding<
    Buffer | Uint8Array | null,
    Buffer | Uint8Array | null,
    Buffer | Uint8Array | void
  >;
  export type BinaryCEncoding = CEncoding<
    Buffer | Uint8Array | null,
    Buffer | Uint8Array | string | null,
    Buffer | Uint8Array | string | void
  >;
  export type FixedNumberCEncoding = CEncoding<number, number, number | void>;
  export type FixedStringCEncoding = CEncoding<string> & {
    /** Encodes a fixed sized string. */
    fixed: CEncoding<string>;
  };

  /** Encodes a uint using compact-uint. */
  export const uint: CEncoding<number>;
  /** Encodes a fixed size uint8. */
  export const uint8: FixedNumberCEncoding;
  /** Encodes a fixed size uint16. Useful for things like ports. */
  export const uint16: FixedNumberCEncoding;
  /** Encodes a fixed size uint24. Useful for message framing. */
  export const uint24: FixedNumberCEncoding;
  /** Encodes a fixed size uint32. Useful for very large message framing. */
  export const uint32: FixedNumberCEncoding;
  /** Encodes a fixed size uint40. */
  export const uint40: FixedNumberCEncoding;
  /** Encodes a fixed size uint48. */
  export const uint48: FixedNumberCEncoding;
  /** Encodes a fixed size uint56. */
  export const uint56: FixedNumberCEncoding;
  /** Encodes a fixed size uint64. */
  export const uint64: FixedNumberCEncoding;
  /** Encodes an int using cenc.uint with ZigZag encoding. */
  export const int: CEncoding<number>;
  /** Encodes a fixed size int8 using cenc.uint8 with ZigZag encoding. */
  export const int8: FixedNumberCEncoding;
  /** Encodes a fixed size int16 using cenc.uint16 with ZigZag encoding. */
  export const int16: FixedNumberCEncoding;
  /** Encodes a fixed size int24 using cenc.uint24 with ZigZag encoding. */
  export const int24: FixedNumberCEncoding;
  /** Encodes a fixed size int32 using cenc.uint32 with ZigZag encoding. */
  export const int32: FixedNumberCEncoding;
  /** Encodes a fixed size int40 using cenc.uint40 with ZigZag encoding. */
  export const int40: FixedNumberCEncoding;
  /** Encodes a fixed size int48 using cenc.uint48 with ZigZag encoding. */
  export const int48: FixedNumberCEncoding;
  /** Encodes a fixed size int56 using cenc.uint56 with ZigZag encoding. */
  export const int56: FixedNumberCEncoding;
  /** Encodes a fixed size int64 using cenc.uint64 with ZigZag encoding. */
  export const int64: FixedNumberCEncoding;
  /** Encodes a fixed size float32. */
  export const float32: FixedNumberCEncoding;
  /** Encodes a fixed size float64. */
  export const float64: FixedNumberCEncoding;
  /** Encodes a buffer with its length uint prefixed. When decoding an empty buffer, null is returned. */
  export const buffer: BufferCEncoding;
  /** Encodes a uint8array with its element length uint prefixed. */
  export const uint8array: CEncoding<Uint8Array>;
  /** Encodes a uint16array with its element length uint prefixed. */
  export const uint16array: CEncoding<Uint16Array>;
  /** Encodes a uint32array with its element length uint prefixed. */
  export const uint32array: CEncoding<Uint32Array>;
  /** Encodes a int8array with its element length uint prefixed. */
  export const int8array: CEncoding<Int8Array>;
  /** Encodes a int16array with its element length uint prefixed. */
  export const int16array: CEncoding<Int16Array>;
  /** Encodes a int32array with its element length uint prefixed. */
  export const int32array: CEncoding<Int32Array>;
  /** Encodes a float32array with its element length uint prefixed. */
  export const float32array: CEncoding<Float32Array>;
  /** Encodes a float64array with its element length uint prefixed. */
  export const float64array: CEncoding<Float64Array>;
  /** Encodes a boolean as 1 or 0. */
  export const bool: CEncoding<boolean, boolean, boolean | void>;
  /** Encodes a utf-8 string, similar to buffer. */
  export const string: FixedStringCEncoding;
  /** Encodes a utf-8 string or passes buffer. */
  export const binary: BinaryCEncoding;
  /** Encodes a utf-8 string, similar to buffer. */
  export const utf8: FixedStringCEncoding;
  /** Encodes an ascii string. */
  export const ascii: FixedStringCEncoding;
  /** Encodes a hex string. */
  export const hex: FixedStringCEncoding;
  /** Encodes a base64 string. */
  export const base64: FixedStringCEncoding;
  /** Encodes a utf16le string. */
  export const utf16le: FixedStringCEncoding;
  /** Encodes a utf16le string. */
  export const ucs2: FixedStringCEncoding;
  /** Encodes a fixed 32 byte buffer. */
  export const fixed32: BufferCEncoding;
  /** Encodes a fixed 64 byte buffer. */
  export const fixed64: BufferCEncoding;
  /** Makes a fixed sized encoder. */
  export function fixed(size: number): BufferCEncoding;
  /** Makes an array encoder from another encoder. Arrays are uint prefixed with their length. */
  export function array<E extends CEncoding<any>>(
    enc: E,
  ): CEncoding<InferCEncoding<E>[]>;
  /** Encodes a JSON value as utf-8. */
  export const json: CEncoding<JSONValue>;
  /** Encodes a JSON value as newline delimited utf-8. */
  export const ndjson: CEncoding<JSONValue>;
  /** Encodes any JSON representable value into a self described buffer. Like JSON + buffer, but using compact types. Useful for schemaless codecs. */
  export const any: CEncoding<unknown>;
  /** Does not encode anything, return null. */
  export const none: CEncoding<null, unknown, unknown>;

  type Codec<I, O> = {
    encode(input: I): Buffer;
    decode(input: Uint8Array): O;
  };
  type AbstractEncoding<I, O> = {
    encode(obj: I, buffer?: Buffer, offset?: number): Buffer;
    decode(buffer: Buffer, start?: number, end?: number): O;
    encodingLength(obj?: I): number;
  };

  export function from<E extends CEncoding<any>>(enc: E): E;
  export function from<I, O>(codec: Codec<I, O>): CEncoding<O, I>;
  export function from<I, O>(enc: AbstractEncoding<I, O>): CEncoding<O, I>;
  export function from(name: 'ascii'): typeof rawModule.ascii;
  export function from(name: 'utf-8' | 'utf8'): typeof rawModule.utf8;
  export function from(name: 'hex'): typeof rawModule.hex;
  export function from(name: 'base64'): typeof rawModule.base64;
  export function from(
    name: 'utf16-le' | 'utf16le' | 'ucs-2' | 'ucs2',
  ): typeof rawModule.ucs2;
  export function from(name: 'ndjson'): typeof rawModule.ndjson;
  export function from(name: 'json'): typeof rawModule.json;
  export function from(name: 'binary' | (string & {})): typeof rawModule.binary;

  export function encode<T, I = T>(
    enc: CEncoding<T, I>,
    value: I,
  ): Buffer | Uint8Array;
  export function decode<T>(enc: CEncoding<T>, buffer: Buffer | Uint8Array): T;
}

declare module 'compact-encoding/raw' {
  import type {
    CEncoding,
    BufferCEncoding,
    JSONValue,
    BinaryCEncoding,
  } from 'compact-encoding';

  export const preencode: CEncoding<Buffer | Uint8Array>['preencode'];
  export const encode: CEncoding<Buffer | Uint8Array>['encode'];
  export const decode: CEncoding<Buffer | Uint8Array>['decode'];

  /** Encodes a buffer without a length prefixed. */
  export const buffer: BufferCEncoding;
  /** Encodes a uint8array without a length prefixed. */
  export const uint8array: CEncoding<Uint8Array>;
  /** Encodes a uint16array without a length prefixed. */
  export const uint16array: CEncoding<Uint16Array>;
  /** Encodes a uint32array without a length prefixed. */
  export const uint32array: CEncoding<Uint32Array>;
  /** Encodes a int8array without a length prefixed. */
  export const int8array: CEncoding<Int8Array>;
  /** Encodes a int16array without a length prefixed. */
  export const int16array: CEncoding<Int16Array>;
  /** Encodes a int32array without a length prefixed. */
  export const int32array: CEncoding<Int32Array>;
  /** Encodes a float32array without a length prefixed. */
  export const float32array: CEncoding<Float32Array>;
  /** Encodes a float64array without a length prefixed. */
  export const float64array: CEncoding<Float64Array>;
  /** Encodes a utf-8 string without a length prefixed. */
  export const string: CEncoding<string>;
  /** Encodes a utf-8 string or passes buffer without a length prefixed. */
  export const binary: BinaryCEncoding;
  /** Encodes a utf-8 string without a length prefixed. */
  export const utf8: CEncoding<string>;
  /** Encodes an ascii string without a length prefixed. */
  export const ascii: CEncoding<string>;
  /** Encodes a hex string without a length prefixed. */
  export const hex: CEncoding<string>;
  /** Encodes a base64 string without a length prefixed. */
  export const base64: CEncoding<string>;
  /** Encodes a utf16le string without a length prefixed. */
  export const utf16le: CEncoding<string>;
  /** Encodes a utf16le string without a length prefixed. */
  export const ucs2: CEncoding<string>;
  /** Makes an array encoder from another encoder, without a length prefixed. */
  export function array<T>(enc: CEncoding<T>): CEncoding<T[]>;
  /** Encodes a JSON value as utf-8 without a length prefixed. */
  export const json: CEncoding<JSONValue>;
  /** Encodes a JSON value as newline delimited utf-8 without a length prefixed. */
  export const ndjson: CEncoding<JSONValue>;
}

declare module 'compact-encoding/lexint' {
  import type {CEncoding} from 'compact-encoding';

  export const preencode: CEncoding<number>['preencode'];
  export const encode: CEncoding<number>['encode'];
  export const decode: CEncoding<number>['decode'];
}

declare module 'compact-encoding/endian' {
  export const LE: boolean;
  export const BE: boolean;
}
