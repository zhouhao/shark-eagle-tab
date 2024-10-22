import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const MS_OF_DAY = 24 * 60 * 60 * 1000;

export const addZero = value => ('0' + value).slice(-2);

export const formatDate = value => {
  if (value) {
    const dt = new Date(value);
    return `${dt.getFullYear()}/${addZero(dt.getMonth() + 1)}/${addZero(dt.getDate())}`;
  }
  return '';
};
export const formatDatetime = value => {
  if (value) {
    const dt = new Date(value);
    return `${addZero(dt.getMonth() + 1)}/${addZero(dt.getDate())}/${dt.getFullYear()} ${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`;
  }
  return '';
};

export const isBlank = str => !str?.trim();

export const readableTimestamp = ts => dayjs(ts).fromNow();

export const getCurrentTimestampInMs = () => {
  return new Date().getTime();
};

export const genId = () => {
  return getCurrentTimestampInMs();
};

export const containsIgnoreCase = (str, searchStr) => {
  return str.toLowerCase().includes(searchStr.toLowerCase());
};
const convertToInt = value => {
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }
  return value;
};

export const is1HourAgo = ts => {
  if (!ts) return true;
  return getCurrentTimestampInMs() - convertToInt(ts) > 3600000;
};
