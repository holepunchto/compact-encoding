// Type declarations for the holepunchto/compact-encoding public API.

declare const compactEncoding: {
  state(start?: any, end?: any, buffer?: any): any
  raw: any
  uint: any
  uint8: any
  uint16: any
  uint24: any
  uint32: any
  uint32be: any
  uint40: any
  uint48: any
  uint56: any
  uint64: any
  uint64be: any
  int: any
  int8: any
  int16: any
  int24: any
  int32: any
  int40: any
  int48: any
  int56: any
  int64: any
  biguint64: any
  bigint64: any
  biguint: any
  bigint: any
  lexint: any
  float32: any
  float64: any
  buffer: any
  optionalBuffer: any
  binary: any
  arraybuffer: any
  uint8array: any
  uint16array: any
  uint32array: any
  int8array: any
  int16array: any
  int32array: any
  biguint64array: any
  bigint64array: any
  float32array: any
  float64array: any
  string: any
  utf8: any
  ascii: any
  hex: any
  base64: any
  ucs2: any
  utf16le: any
  bool: any
  fixed(n: any): any
  fixed32: any
  fixed64: any
  array(enc: any): any
  frame(enc: any): any
  date: any
  json: any
  ndjson: any
  none: any
  any: any
  port: any
  ipv4: any
  ipv4Address: any
  ipv6: any
  ipv6Address: any
  ip: any
  ipAddress: any
  record(keyEncoding: any, valueEncoding: any): any
  stringRecord: any
  from(enc: any): any
  /**
   * Encodes `val` into `state.buffer` at position `state.start`. Updates `state.start` to point after the encoded value when done.
   */
  encode(enc: any, m: any): any
  /**
   * Decodes a value from `state.buffer` as position `state.start`. Updates `state.start` to point after the decoded value when done in the buffer.
   */
  decode(enc: any, buffer: any): any
}

export default compactEncoding
