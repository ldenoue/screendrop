chrome.browserAction.onClicked.addListener(function(tab) {
  startScreenDrop(null);
});

let stream = null;
let mediaRecorder = null;
let audioStream = null;
let audioTrack = null;

function downloadScreenDrop(url) {
  chrome.downloads.download({
    url: url,
    filename: "screendrop" + Date.now() + ".webm"
  });
}

async function startScreenDrop() {
  if (mediaRecorder) {
    stream.getTracks().forEach((t) => t.stop());
    mediaRecorder.stop();
    return;
  }
  /*try {
    audioStream = await navigator.mediaDevices.getUserMedia({audio:true});
    audioTrack = audioStream.getAudioTracks()[0];
  } catch (eaudiopermission) {
    console.log('no audio',eaudiopermission);
  }*/

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
  } catch (epermission) {
    console.log('cancelled')
    return;
  }
  if (audioTrack)
    stream.addTrack(audioTrack);

  stream.getVideoTracks()[0].onended = function () {
    startScreenDrop();
  };
  let chunks = [];
  mediaRecorder = new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus'});
  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data);
  }
  mediaRecorder.onstop = function(e) {
    chrome.browserAction.setIcon({path: 'off.png'});
    mediaRecorder = null;
    let blob = new Blob(chunks, { 'type' : 'video/webm' });
    chunks = [];
    let fr = new FileReader();
    fr.onload = (e) => {
      let url = fr.result;
      downloadScreenDrop(url);
    }
    fr.readAsDataURL(blob)
  };
  mediaRecorder.start(1000);
  chrome.browserAction.setIcon({path: 'on.png'});
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