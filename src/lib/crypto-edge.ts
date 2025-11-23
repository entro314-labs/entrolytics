/**
 * Edge-compatible crypto functions using Web Crypto API
 *
 * This module provides the same functionality as crypto.ts but uses
 * Web Standard APIs that work on Edge Runtime (Vercel Edge, Cloudflare Workers, etc.)
 *
 * Key differences from Node.js crypto.ts:
 * - Uses Web Crypto API (crypto.subtle) instead of Node.js crypto
 * - hash() is async (Web Crypto is promise-based)
 * - uuid() uses crypto.randomUUID() for simple UUIDs
 * - deterministicUuid() for reproducible UUIDs (replaces uuid with args)
 */

import prand from 'pure-rand'

// UUID v5 namespace for Entrolytics (DNS namespace)
const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

const seed = Date.now() ^ (Math.random() * 0x100000000)
const rng = prand.xoroshiro128plus(seed)

/**
 * Generate random integer between min and max (inclusive)
 */
export function random(min: number, max: number): number {
  return prand.unsafeUniformIntDistribution(min, max, rng)
}

/**
 * Generate random characters from a character set
 */
export function getRandomChars(
  n: number,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
): string {
  const arr = chars.split('')
  let s = ''
  for (let i = 0; i < n; i++) {
    s += arr[random(0, arr.length - 1)]
  }
  return s
}

/**
 * SHA-512 hash using Web Crypto API
 * @returns hex-encoded hash string
 */
export async function hash(...args: string[]): Promise<string> {
  const data = new TextEncoder().encode(args.join(''))
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Derive application secret from environment variables
 */
export async function secret(): Promise<string> {
  return hash(process.env.APP_SECRET || process.env.DATABASE_URL || '')
}

/**
 * Generate a random UUID v4
 */
export function uuid(): string
/**
 * Generate a deterministic UUID v5 from input arguments
 */
export function uuid(...args: string[]): Promise<string>
export function uuid(...args: string[]): string | Promise<string> {
  if (!args.length) {
    return crypto.randomUUID()
  }
  return deterministicUuid(...args)
}

/**
 * Generate a deterministic UUID v5 using Web Crypto
 * Compatible with the uuid library's v5 function
 */
async function deterministicUuid(...args: string[]): Promise<string> {
  const secretValue = await secret()
  const name = args.join('') + secretValue

  // Parse namespace UUID to bytes
  const namespaceBytes = parseUuid(DNS_NAMESPACE)

  // Concatenate namespace + name
  const nameBytes = new TextEncoder().encode(name)
  const data = new Uint8Array(namespaceBytes.length + nameBytes.length)
  data.set(namespaceBytes, 0)
  data.set(nameBytes, namespaceBytes.length)

  // SHA-1 hash (UUID v5 uses SHA-1)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashBytes = new Uint8Array(hashBuffer)

  // Set version (5) and variant bits
  hashBytes[6] = (hashBytes[6] & 0x0f) | 0x50 // version 5
  hashBytes[8] = (hashBytes[8] & 0x3f) | 0x80 // variant 10xx

  return formatUuid(hashBytes)
}

/**
 * Parse UUID string to bytes
 */
function parseUuid(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '')
  const bytes = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Format bytes as UUID string
 */
function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes.slice(0, 16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-')
}

/**
 * Check if running in Edge Runtime
 */
export function isEdgeRuntime(): boolean {
  return (
    typeof EdgeRuntime !== 'undefined' ||
    (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge')
  )
}
