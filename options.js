let startBtn = document.getElementById('startBtn');
let dropBtn = document.getElementById('dropBtn');
let clearBtn = document.getElementById('clearBtn');
let downloadBtn = document.getElementById('downloadBtn');
let dropInfo = document.getElementById('dropInfo');
let sdVideo = document.getElementById('sdVideo');
let buttons = document.getElementById('buttons');
let github = document.getElementById('github');
github.onclick = (e) => chrome.tabs.create({active: true, url: 'https://github.com/ldenoue/screendrop'});

let emptyVideo = chrome.runtime.getURL('screendrop.webm');
let recording = false;

clearBtn.addEventListener('click', (e) => {
  chrome.storage.local.set({lastScreenDrop:''});
  sdVideo.srcObject = null;
  sdVideo.src = emptyVideo;  
})

chrome.storage.local.get('recording',(e) => {
  if (e.recording) {
    recording = true;
    dropInfo.textContent = 'Recording...';
    buttons.style.display = 'none';
    sdVideo.style.display = 'none';
    startBtn.style.display = 'none';
    chrome.runtime.sendMessage({stop:true}, (res) => {});
    window.close();
  }
  else {
    startBtn.textContent = 'Record new video';
  }
});

chrome.storage.local.get('lastScreenDrop',(e) => {
  if (e.lastScreenDrop)
    sdVideo.src = e.lastScreenDrop;
  else
    sdVideo.src = emptyVideo;
});

function sendMessage(payload) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, payload);
  });

}
function dropScreenDrop() {
  /*chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { url: 'lastScreenDrop' });
  });*/
  sendMessage({url: 'lastScreenDrop'});
}

function downloadScreenDrop() {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = sdVideo.src;
  a.download = 'ScreenDrop-' + Date.now() + '.webm';
  a.click();
  setTimeout(() => { a.remove() },100);
}

//startBtn.addEventListener('click', startScreenDrop);
startBtn.addEventListener('click', () => {
  if (recording)
    sendMessage({stop:true});
  else
    sendMessage({start:true});
  window.close();
});

if (dropBtn)
  dropBtn.addEventListener('click', dropScreenDrop);
if (downloadBtn)
  downloadBtn.addEventListener('click', downloadScreenDrop)
chrome.runtime.onMessage.addListener(function requestCallback(request, sender, sendResponse) {
  if (request.dropped)
    window.close();
  if (request.msg) {
    dropInfo.style.opacity = 1;
    dropInfo.textContent = request.msg;
    setTimeout(() => {
      dropInfo.style.opacity = 0;
    }, 2000);
    //alert(request.msg)
  }
});
