function loadOptions() {
  chrome.storage.sync.get({
    /*handlePDF: false,*/
    saveLocally: false,
    saveChromeBookmarks: true
  }, function(items) {
    //document.getElementById('handlePDF').checked = items.handlePDF;
    document.getElementById('saveLocally').checked = items.saveLocally;
    document.getElementById('saveChromeBookmarks').checked = items.saveChromeBookmarks;
  });
}

function saveOptions() {
  //var handlePDF = document.getElementById("handlePDF").checked;
  var saveLocally = document.getElementById("saveLocally").checked;
  var saveChromeBookmarks = document.getElementById("saveChromeBookmarks").checked;
  chrome.storage.sync.set({
    /*handlePDF: handlePDF,*/
    saveLocally:saveLocally,
    saveChromeBookmarks:saveChromeBookmarks
  }, function() {
    //window.close();
  });
}

function restoreOptions() {
  chrome.storage.sync.set({
    /*handlePDF: false,*/
    saveLocally: false,
    saveChromeBookmarks: true
  }, function() {
    //document.getElementById("handlePDF").checked = false;
    document.getElementById('saveLocally').checked = false;
    document.getElementById('saveChromeBookmarks').checked = true;
  });
}

/*function donateOptions() {
    chrome.tabs.create({ url: 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=R9JRASMAABUUE&item_name=Yawas+Web+and+PDF+Highlighter&currency_code=USD&source=yawasextension' });
}*/

document.addEventListener('DOMContentLoaded', loadOptions);
//document.querySelector('#save').addEventListener('click', saveOptions);
document.querySelector('#restore').addEventListener('click', restoreOptions);
//document.querySelector('#donate').addEventListener('click', donateOptions);

//let handlePDFElem = document.getElementById("handlePDF");
//handlePDFElem.addEventListener('change',saveOptions);
let saveLocallyElem = document.getElementById("saveLocally");
saveLocallyElem.addEventListener('change',saveOptions);
let saveChromeBookmarksElem = document.getElementById("saveChromeBookmarks");
saveChromeBookmarksElem.addEventListener('change',saveOptions);

let importButton = document.getElementById('importChromeBookmarks');
importButton.addEventListener('click', () => chrome.runtime.sendMessage({ msg: "startImportFunc" }));

chrome.runtime.onMessage.addListener(function requestCallback(request, sender, sendResponse) {
  if (request.msg === 'importMessage')
    importButton.textContent = request.n + ' imported';
});
