import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import Toastify from 'toastify-js';

dayjs.extend(relativeTime);

export const MS_OF_HOUR = 60 * 60 * 1000;
export const MS_OF_DAY = 24 * MS_OF_HOUR;

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
  return getCurrentTimestampInMs() - convertToInt(ts) > MS_OF_HOUR;
};

export const toastSuccess = (message, duration = 3000) => {
  Toastify({
    text: message,
    duration: duration,
    style: {
      background: 'rgb(25, 135, 84)',
    },
  }).showToast();
};

export const toastWarn = (message, duration = 3000) => {
  Toastify({
    text: message,
    duration: duration,
    style: {
      background: 'rgb(255, 193, 7)',
    },
  }).showToast();
};

export const toastError = (message, duration = 3000) => {
  Toastify({
    text: message,
    duration: duration,
    style: {
      background: 'rgb(190, 46, 60)',
    },
  }).showToast();
};
