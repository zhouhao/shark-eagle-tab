import store from 'store';

export const CLEANUP_DAYS_KEY = 'cleanupDays';
export const LAST_CLEANUP_TIME_KEY = 'lastCleanupTime';

export const set = (key, value) => {
  return store.set(key, value);
};

export const get = key => {
  return store.get(key);
};

export const getOrDefault = (key, defaultValue) => {
  return store.get(key) || defaultValue;
};
