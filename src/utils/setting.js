import store from 'store';

export const CLEANUP_DAYS_KEY = 'cleanupDays';
export const LAST_CLEANUP_TIME_KEY = 'lastCleanupTime';
export const MAX_SNAPSHOT_COUNT_KEY = 'maxSnapshotCount';

export const init = () => {
  // set default expired time for tabs as 7 days
  if (get(CLEANUP_DAYS_KEY) === undefined) {
    set(CLEANUP_DAYS_KEY, 7);
  }

  if (get(MAX_SNAPSHOT_COUNT_KEY) === undefined) {
    set(MAX_SNAPSHOT_COUNT_KEY, 100);
  }
};
export const set = (key, value) => {
  return store.set(key, value);
};

export const get = key => {
  return store.get(key);
};

export const getOrDefault = (key, defaultValue) => {
  if (store.get(key) === undefined) {
    return defaultValue;
  }
  return store.get(key);
};
