import * as types from './utils/action-types';
import * as DB from './utils/count-db';
import * as DTDB from './utils/datetime-db';

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
    title: 'Open Metric Dashboard',
    id: types.OPEN_OPTIONS_PAGE,
    contexts: ['all'],
  });

  chrome.contextMenus.create({
    title: 'Open Tab Snapshot Page',
    id: types.OPEN_TAB_BUNDLE_PAGE,
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    title: 'Save Tabs in Current Window as Snapshot',
    id: types.SAVE_ALL_TAB_IN_CURRENT_WINDOW,
    contexts: ['all'],
  });
});

function createTabIfNotExists(url) {
  // First, check if a tab with the given URL already exists
  chrome.tabs.query({ url: url }, function(tabs) {
    if (tabs.length > 0) {
      // If the tab exists, activate it
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      // If the tab doesn't exist, create it
      chrome.tabs.create({ url: url });
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === types.OPEN_OPTIONS_PAGE) {
    chrome.runtime.openOptionsPage(() => {
      /* Do Nothing */
    });
  } else if (info.menuItemId === types.OPEN_TAB_BUNDLE_PAGE) {
    createTabIfNotExists(chrome.runtime.getURL('/options/tab.html'));
  } else if (info.menuItemId === types.SAVE_ALL_TAB_IN_CURRENT_WINDOW) {
    chrome.tabs.query({ currentWindow: true }, _tabs => {
      const tabs = _tabs.filter(t => t.url.startsWith('http'));
      DTDB.saveSnapshot(tabs).then(_ => {
        tabs.forEach(tab => chrome.tabs.remove(tab.id));
      });
    });
    createTabIfNotExists(chrome.runtime.getURL('/options/tab.html'));
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
