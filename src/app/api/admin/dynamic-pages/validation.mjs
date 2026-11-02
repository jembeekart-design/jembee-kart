/**
 * Runtime guard shared by the Dynamic Pages route and its Node.js tests.
 * Accept plain JSON objects only; reject null, arrays, and exotic prototypes.
 */
export function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
