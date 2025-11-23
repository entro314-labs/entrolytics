import crypto from 'crypto'
import prand from 'pure-rand'
import { v4, v5 } from 'uuid'

const HASH_ALGO = 'sha512'
const HASH_ENCODING = 'hex'

const seed = Date.now() ^ (Math.random() * 0x100000000)
const rng = prand.xoroshiro128plus(seed)

export function random(min: number, max: number) {
  return prand.unsafeUniformIntDistribution(min, max, rng)
}

export function getRandomChars(
  n: number,
  chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) {
  const arr = chars.split('')
  let s = ''
  for (let i = 0; i < n; i++) {
    s += arr[random(0, arr.length - 1)]
  }
  return s
}

export function hash(...args: string[]) {
  return crypto.createHash(HASH_ALGO).update(args.join('')).digest(HASH_ENCODING)
}

export function secret() {
  return hash(process.env.APP_SECRET || process.env.DATABASE_URL)
}

export function uuid(...args: any) {
  if (!args.length) return v4()

  return v5(hash(...args, secret()), v5.DNS)
}
