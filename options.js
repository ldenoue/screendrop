let startBtn = document.getElementById('startBtn');
let dropBtn = document.getElementById('dropBtn');
let clearBtn = document.getElementById('clearBtn');
let dropInfo = document.getElementById('dropInfo');
let sdVideo = document.getElementById('sdVideo');
let uri = null;
let stream = null;
let mediaRecorder = null;
let file = null;

clearBtn.addEventListener('click', (e) => {
  chrome.storage.local.set({lastScreenDrop:''});
  sdVideo.src = null;  
})

chrome.storage.local.get('lastScreenDrop',(e) => {
  if (e.lastScreenDrop)
    uri = e.lastScreenDrop;
    sdVideo.src = e.lastScreenDrop;
});

async function startScreenDrop(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  if (mediaRecorder) {
    stream.getTracks().forEach((t) => t.stop());
    mediaRecorder.stop();
    return;
  }
  startBtn.textContent = 'stop';
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
  } catch (epermission) {
    startBtn.textContent = 'start';
    return;
  }
  sdVideo.srcObject = stream;
  let chunks = [];
  mediaRecorder = new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus'});
  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data);
  }
  mediaRecorder.onstop = function(e) {
    startBtn.textContent = 'start'
    mediaRecorder = null;
    blob = new Blob(chunks, { 'type' : 'video/webm' });
    file = new File([blob], "screendrop.webm", { type: "video/webm" });
    chunks = [];
    //console.log('stopped recording',blob.size,file)
    sdVideo.srcObject = null; // important otherwise Chrome does not show the new src
    sdVideo.src = URL.createObjectURL(blob);
    let fr = new FileReader();
    fr.onload = (e) => {
      uri = fr.result;
      chrome.storage.local.set({lastScreenDrop:uri});
      //dropScreenDrop();
    }
    fr.readAsDataURL(blob)
    //URI = sdVideo.src;
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
    console.log('sending screendrop',activeTab)
    chrome.tabs.sendMessage(activeTab.id, { url: uri });
    //window.close();
  });
}

startBtn.addEventListener('click', startScreenDrop);
if (dropBtn)
  dropBtn.addEventListener('click', dropScreenDrop);

chrome.runtime.onMessage.addListener(function requestCallback(request, sender, sendResponse) {
  if (request.msg)
    dropInfo.textContent = request.msg;
});


/*var popupWindow = window.open(
  chrome.extension.getURL("popup.html"),
  "exampleName",
  "width=400,height=400"
);
setTimeout(() => window.close(),100);*/