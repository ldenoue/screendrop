let startBtn = document.getElementById('startBtn');
let dropBtn = document.getElementById('dropBtn');
let clearBtn = document.getElementById('clearBtn');
let downloadBtn = document.getElementById('downloadBtn');
let dropInfo = document.getElementById('dropInfo');
let sdVideo = document.getElementById('sdVideo');
let github = document.getElementById('github');
github.onclick = (e) => chrome.tabs.create({active: true, url: 'https://github.com/ldenoue/screendrop'});

let stream = null;
let audiostream = null;
let audioTrack = null;
let mediaRecorder = null;
let file = null;
let emptyVideo = chrome.runtime.getURL('screendrop.mp4');

clearBtn.addEventListener('click', (e) => {
  chrome.storage.local.set({lastScreenDrop:''});
  sdVideo.srcObject = null;
  sdVideo.src = emptyVideo;  
})

chrome.storage.local.get('lastScreenDrop',(e) => {
  if (e.lastScreenDrop)
    sdVideo.src = e.lastScreenDrop;
  else
    sdVideo.src = emptyVideo;
});

async function startScreenDrop(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  if (mediaRecorder) {
    stream.getTracks().forEach((t) => t.stop());
    mediaRecorder.stop();
    return;
  }
  startBtn.textContent = 'Stop';

  /*try {
    audiostream = await navigator.mediaDevices.getUserMedia({audio:true});
    audioTrack = audioStream.getAudioTracks()[0];
  } catch (eaudiopermission) {
    alert('no audio'+eaudiopermission);
  }*/

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
  } catch (epermission) {
    startBtn.textContent = 'Record';
    return;
  }
  if (audioTrack)
    stream.addTrack(audioTrack);
  sdVideo.srcObject = stream;
  let chunks = [];
  mediaRecorder = new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus'});
  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data);
  }
  mediaRecorder.onstop = function(e) {
    startBtn.textContent = 'Start'
    mediaRecorder = null;
    blob = new Blob(chunks, { 'type' : 'video/webm' });
    file = new File([blob], "screendrop.webm", { type: "video/webm" });
    chunks = [];
    //console.log('stopped recording',blob.size,file)
    sdVideo.srcObject = null; // important otherwise Chrome does not show the new src
    sdVideo.src = URL.createObjectURL(blob);
    let fr = new FileReader();
    fr.onload = (e) => {
      chrome.storage.local.set({lastScreenDrop:fr.result});
    }
    fr.readAsDataURL(blob)
  };
  mediaRecorder.start(1000);
  /*chrome.desktopCapture.chooseDesktopMedia(
    ['screen'],
    null,
    async (id, options) => {
      console.log(id, options);
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'screen',
            chromeMediaSourceId: id,
          },
        },
      });
      sdVideo.srcObject = stream;
      // do stuff with MediaStream
      r = new MediaRecorder(stream);
      r.start();
      r.ondataavailable = (e) => console.log(fr.readAsDataURL(e.data));
      setTimeout(() => {
        r.stop();
        stream.getTracks().forEach((t) => t.stop());
      }, 10000);
    }
  );*/
}

function dropScreenDrop() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { url: 'lastScreenDrop' });
  });
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

startBtn.addEventListener('click', startScreenDrop);
if (dropBtn)
  dropBtn.addEventListener('click', dropScreenDrop);
if (downloadBtn)
  downloadBtn.addEventListener('click', downloadScreenDrop)
chrome.runtime.onMessage.addListener(function requestCallback(request, sender, sendResponse) {
  if (request.msg)
    dropInfo.textContent = request.msg;
});
