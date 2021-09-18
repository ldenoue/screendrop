chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.stop) {
    chrome.tabs.query({/*active: true, currentWindow: true*/}, function(tabs) {
      for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {stop:true});
      }
    });
  }
  if (request.setIcon) {
    chrome.browserAction.setIcon({path:request.setIcon});
  }
  if (request.sendNotification)
  {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {notification:request.sendNotification});
    });
  }
  sendResponse({});
});

chrome.browserAction.onClicked.addListener(function(tab) {
  console.error('clicked')
});