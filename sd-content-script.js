let sdWrapper = document.querySelector('#sd_wrapper');
let sdVideo = null;
let stream = null;
let mediaRecorder = null;
let file = null;
let URI = null;
let screenDragEnds = new Set();
let screenDrops = new Set();

function contentScriptRequestCallback(request, sender, sendResponse) {
  console.error('contentScriptRequestCallback',request,request.action);
  if (sendResponse)
  {
    sendResponse({reponse:'ok'});
  }
  return true;
}

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(contentScriptRequestCallback);
});

async function sendBlob(url) {
  const blob = await (await fetch(url)).blob();
  file = new File([blob], "screendrop.webm", {type: "video/webm"});
  dragAndDrop()
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.url)
    {
      console.log(request.url)
      //sendBlob(request.url)
      chrome.storage.local.get('lastScreenDrop',(e) => {
        console.log(e);
        if (e.lastScreenDrop)
          sendBlob(e.lastScreenDrop);
        else
        return chrome.runtime.sendMessage({ msg: "no video" });
      });
      
    }
    sendResponse({ok:true});
  }
);

function findTarget() {
  let intersection = new Set(
    [...screenDrops].filter(x => screenDragEnds.has(x)));
  let className = intersection.values().next().value;
  let allElements = new Set();
  for (let item of intersection) {
    let elements = document.getElementsByClassName(className);
    for (let elem of elements)
      allElements.add(elem);
  }
  console.log('allElements=',allElements);
  return allElements.values().next().value;
}

async function simulateDrop(target) {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file); // File object representing image being dropped
  const eventDragOver = new DragEvent('dragover', { dataTransfer/*, clientX, clientY*/ });
  target.dispatchEvent(eventDragOver);
  const eventDrop = new DragEvent('drop', { dataTransfer, /*clientX, clientY*/ });
  target.dispatchEvent(eventDrop);
}

async function dragAndDrop() {
  let target = findTarget();
  if (!target)
    return chrome.runtime.sendMessage({ msg: "Did not find where to drop. Try Slack or download" });
  else 
    chrome.runtime.sendMessage({ msg: "Dropping inside " + window.location.hostname });
  return await simulateDrop(target);
}

document.addEventListener('screenDropCustomEvent', function (e) {
  var data = e.detail;
  console.log('received', data);
  if (data.type === 'drop')
    screenDrops.add(data.className)
  else if (data.type === 'dragend')
    screenDragEnds.add(data.className)
});

var s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);
