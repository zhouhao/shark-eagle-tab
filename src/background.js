import * as types from './utils/action-types';
import * as DB from './utils/db';

const processResult = promise => {
  promise
    .then(result => {
      // console.log(JSON.stringify(result));
    })
    .catch(error => {
      // console.log(error);
    });
};

chrome.action.onClicked.addListener(tab => {
  chrome.runtime.openOptionsPage(() => {
    /* Do Nothing */
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Open Shark Eagle Tab',
    id: types.CMD_OPEN_OPTIONS_PAGE,
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === types.CMD_OPEN_OPTIONS_PAGE) {
    chrome.runtime.openOptionsPage(() => {
      /* Do Nothing */
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.toLowerCase().startsWith('http')) {
    processResult(DB.upsertTabByUrl(tab.url, tab.title));
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab.url?.toLowerCase().startsWith('http')) {
      processResult(DB.upsertTabByUrl(tab.url, tab.title));
    }
  });
});
