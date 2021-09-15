let startBtn = document.getElementById('startBtn');
let dropBtn = document.getElementById('dropBtn');
let clearBtn = document.getElementById('clearBtn');
let downloadBtn = document.getElementById('downloadBtn');
let dropInfo = document.getElementById('dropInfo');
let sdVideo = document.getElementById('sdVideo');
let github = document.getElementById('github');
github.onclick = (e) => chrome.tabs.create({active: true, url: 'https://github.com/ldenoue/screendrop'});

let stream = null;
let mediaRecorder = null;
let file = null;
let emptyVideo = chrome.runtime.getURL('screendrop.mp4');//'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr9tZGF0AAACoAYF//+c3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDEyNSAtIEguMjY0L01QRUctNCBBVkMgY29kZWMgLSBDb3B5bGVmdCAyMDAzLTIwMTIgLSBodHRwOi8vd3d3LnZpZGVvbGFuLm9yZy94MjY0Lmh0bWwgLSBvcHRpb25zOiBjYWJhYz0xIHJlZj0zIGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMTMgbWU9aGV4IHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz02IGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTEgYl9iaWFzPTAgZGlyZWN0PTEgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0yIGtleWludD0yNTAga2V5aW50X21pbj0yNCBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTQwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAA9liIQAV/0TAAYdeBTXzg8AAALvbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAACoAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAhl0cmFrAAAAXHRraGQAAAAPAAAAAAAAAAAAAAABAAAAAAAAACoAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAgAAAAIAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAAqAAAAAAABAAAAAAGRbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAAAgBVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABPG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAPxzdGJsAAAAmHN0c2QAAAAAAAAAAQAAAIhhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAgACABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMmF2Y0MBZAAK/+EAGWdkAAqs2V+WXAWyAAADAAIAAAMAYB4kSywBAAZo6+PLIsAAAAAYc3R0cwAAAAAAAAABAAAAAQAAAgAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAACtwAAAAEAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTQuNjMuMTA0';

clearBtn.addEventListener('click', (e) => {
  chrome.storage.local.set({lastScreenDrop:''});
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
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
  } catch (epermission) {
    startBtn.textContent = 'Record';
    return;
  }
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
