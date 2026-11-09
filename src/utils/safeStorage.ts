import type { PersistStorage, StorageValue } from "zustand/middleware";

// Errors are identified by name: DOMException.code is deprecated, and older Firefox versions
// reported a full storage under their own name instead of the standard one
const isQuotaExceeded = (error: unknown) =>
  error instanceof DOMException &&
  (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");

/**
 * Storage for Zustand's persist middleware that saves to localStorage and never throws.
 *
 * localStorage can fail: it may be full, blocked in some privacy modes, or hold data that is not
 * valid JSON. persist does not catch these errors, so without this wrapper a failed save would
 * throw out of whichever store action changed the state.
 *
 * @param shrink Returns a smaller version of the value, tried once when the storage is full
 */
export function createSafeStorage<T>(
  shrink?: (value: StorageValue<T>) => StorageValue<T>
): PersistStorage<T> {
  return {
    getItem: (name) => {
      try {
        const item = localStorage.getItem(name);
        // JSON.parse cannot know the shape, so it is stated here; persist then hands the value
        // to the store's migrate function together with its version
        return item ? (JSON.parse(item) as StorageValue<T>) : null;
      } catch (error) {
        console.error(`Could not read "${name}" from localStorage:`, error);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, JSON.stringify(value));
      } catch (error) {
        if (!shrink || !isQuotaExceeded(error)) {
          console.error(`Could not save "${name}" to localStorage:`, error);
          return;
        }
        try {
          localStorage.setItem(name, JSON.stringify(shrink(value)));
        } catch (retryError) {
          console.error(`Could not save "${name}", even in its smaller form:`, retryError);
        }
      }
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.error(`Could not remove "${name}" from localStorage:`, error);
      }
    },
  };
}
