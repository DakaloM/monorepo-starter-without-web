import { Ulid as UlidClass, Uuid as UuidClass } from 'id128';

export type Uuid = string;
export type Ulid = string;

const HEX16 = '0123456789abcdef';
const HEX = Array.from({ length: 16 }, (_x, i) => HEX16[i]);

export enum Formats {
  ULID = 'ulid',
  UUID = 'uuid',
}

/**
 * Simple ID format detector.
 */
export function identify(id: string): Formats | null {
  if (id.length === 26) {
    return Formats.ULID;
  } else if (id.length === 36) {
    return Formats.UUID;
  } else {
    return null;
  }
}

/**
 * Generates a new ID.
 */
export function newId(format: 'ulid' | 'uuid' = 'ulid'): string {
  switch (format) {
    case 'ulid':
      return UlidClass.generate().toCanonical();
    case 'uuid':
      return toUuid(UlidClass.generate().bytes);
    default:
      throw new Error(`Unknown format "${format}"`);
  }
}

const min = new Date(2016, 0).getTime();
const max = new Date(2100, 0).getTime();

export function isUlidUuid(value: string): boolean {
  if (typeof value !== 'string' || !value.match(/[\w\d-]{36}/)) {
    return false;
  }
  try {
    const ulid = UlidClass.fromRaw(value.replaceAll('-', ''));
    const time = ulid.time.getTime();
    return time >= min && time <= max;
  } catch (err) {
    return false;
  }
}

/**
 * Converts a UUID to ULID.
 */
export function uuidToUlid(value: string): string {
  return toUlid(parseUuid(value));
}

/**
 * Converts a ULID to UUID.
 */
export function ulidToUuid(value: string): string {
  return toUuid(parseUlid(value));
}

/**
 * Parses a ULID to a byte array.
 */
function parseUlid(ulid: string): Uint8Array {
  return UlidClass.fromCanonical(ulid).bytes;
}

/**
 * Parses a UUID to a byte array.
 */
function parseUuid(uuid: string): Uint8Array {
  return UuidClass.fromCanonical(uuid).bytes;
}

/**
 * Renders a byte array to a ULID.
 */
function toUlid(data: Uint8Array): string {
  return UlidClass.toCanonical({ bytes: data } as UlidClass);
}

/**
 * Renders a byte array to a UUID.
 */
function toUuid(data: Uint8Array, compact = false) {
  const buffer = [];
  for (let i = 0; i < 16; i++) {
    if (!compact && (i == 4 || i == 6 || i == 8 || i == 10)) {
      buffer.push('-');
    }
    buffer.push(HEX[data[i] >> 4]);
    buffer.push(HEX[data[i] & 0x0f]);
  }
  return buffer.join('');
}
