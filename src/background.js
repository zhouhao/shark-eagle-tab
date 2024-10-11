import * as types from './utils/action-types';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Open Shark Eagle Tab',
    id: types.CMD_OPEN_OPTIONS_PAGE,
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === types.CMD_OPEN_OPTIONS_PAGE) {
    chrome.runtime.openOptionsPage(() => console.log('Options page is opened'));
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.toLowerCase().startsWith('http')) {
    // TODO: update tab
  }
});
