/**
 * UUID validation utilities
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validates if a string is a proper UUID format
 */
export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value)
}

/**
 * Validates multiple UUID values
 */
export function areValidUuids(...values: string[]): boolean {
  return values.every(isValidUuid)
}

/**
 * Type guard for UUID validation
 */
export function assertValidUuid(value: string, name: string = 'ID'): asserts value is string {
  if (!isValidUuid(value)) {
    throw new Error(`Invalid ${name} format: expected UUID, got "${value}"`)
  }
}

/**
 * Validates UUID and returns it, or throws error
 */
export function validateUuid(value: string, name: string = 'ID'): string {
  assertValidUuid(value, name)
  return value
}