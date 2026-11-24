// Build / read complete status records without hardcoding each key.
// Casts are safe when `keys` is the full key set for the record (e.g. ORDER_STATUSES).

export const mapKeysToRecord = <K extends string, V>(
  keys: readonly K[],
  makeValue: (key: K) => V
): Record<K, V> =>
  Object.fromEntries(keys.map((key) => [key, makeValue(key)])) as Record<K, V>;

// noUncheckedIndexedAccess types record[key] as V | undefined; keys from ORDER_STATUSES* are complete
export const getDefined = <K extends string, V>(record: Record<K, V>, key: K): V => {
  const value = record[key];
  if (value === undefined) {
    throw new Error(`Missing record key: ${key}`);
  }
  return value;
};
