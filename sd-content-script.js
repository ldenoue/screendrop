let sdWrapper = document.querySelector('#sd_wrapper');
let sdVideo = null;

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
    console.log(request,sender,request.message);
    console.log(request.file)
    if (request.url)
    {
      sendBlob(request.url)
      //let v = document.createElement('video');
      //v.src = request.url;
      //document.body.appendChild(v);
      //alert(request.url)
    }
    sendResponse({ok:true});
  }
);

function start(){
    alert("started");
}
function dragElement(div)
{
  let draggedDiv = div;
  let left = 0;
  let top = 0;
  draggedDiv.querySelector('#dragheader').addEventListener('mousedown',dragMouseDown);

  function dragMouseDown(e)
  {
      e.preventDefault();
      let rect = draggedDiv.getBoundingClientRect();
      left = e.clientX - rect.left;
      top = e.clientY - rect.top;
      document.addEventListener('mouseup',closeDragElement);
      document.addEventListener('mousemove',elementDrag);
  };

  function elementDrag(e)
  {
      e.preventDefault();
      let x = e.clientX;
      let y = e.clientY;
      draggedDiv.style.right = 'unset';
      draggedDiv.style.bottom = 'unset';
      let draggedWidth = draggedDiv.offsetWidth + 24;
      let draggedHeight = draggedDiv.offsetHeight + 8;
      let newleft = (x - left);
      let newtop = (y - top);
      if (newleft < 8)
          newleft = 8;
      if (newleft > window.innerWidth - draggedWidth)
          newleft = window.innerWidth - draggedWidth;
      if (newtop < 8)
          newtop = 8;
      if (newtop > window.innerHeight - draggedHeight)
          newtop = window.innerHeight - draggedHeight;
      draggedDiv.style.left = newleft + 'px';
      draggedDiv.style.top = newtop + 'px';
  };
  function closeDragElement(e)
  {
    document.removeEventListener('mouseup',closeDragElement);
    document.removeEventListener('mousemove',elementDrag);
    //dragAndDrop(e.clientX-42,e.clientY-42)
  }
}

/*function findTarget() {
  let elements = [];
  document.querySelectorAll('*').forEach(e => {
    let listeners = getEventListeners(e);
    let keys = Object.keys(listeners);
    keys.forEach(k => {
      if (k.indexOf('dragend') !== -1)
        elements.push(e);
    });
  });
  console.log(elements)
  if (elements.length > 0)
    return elements[0];
  return null;
}*/

function findTarget() {
  //let union = new Set([...screenDrops, ...screenDragEnds]);
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
  //let elements = document.getElementsByClassName(className);
  //console.log(intersection,elements);
  //return elements[0];
}



// we want drop and dragend
//elements=[];$$('*').forEach(e => {Object.keys(getEventListeners(e)).forEach(k => {if (k.indexOf('dragover') !== -1) {elements.push(e);console.log(k,e.id)}})})
async function simulateDrop(target) {
  console.log('simulateDrop target=',target);
  //let URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";
  //let URI = chrome.extension.getURL("screendrop.webm")
  /*const blob = await (await fetch(URI)).blob();
  let file = new File([blob], "foo.webm", {
    type: "video/webm",
  });*/
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file); // File object representing image being dropped

  //let clientX = target.getBoundingClientRect().top + 5;
  //let clientY = target.getBoundingClientRect().left + 5;

  //const eventDragStart = new DragEvent('dragstart', { dataTransfer, clientX, clientY });
  //target.dispatchEvent(eventDragStart);

  const eventDragOver = new DragEvent('dragover', { dataTransfer/*, clientX, clientY*/ });
  target.dispatchEvent(eventDragOver);

  //const eventStart = new DragEvent('dragstart', { dataTransfer });
  //target.dispatchEvent(eventStart);

const eventDrop = new DragEvent('drop', { dataTransfer, /*clientX, clientY*/ });
  target.dispatchEvent(eventDrop);
}

// see also https://gist.github.com/druska/624501b7209a74040175
// from https://stackoverflow.com/questions/39028875/how-to-trigger-an-event-with-a-custom-event-specifically-a-custom-datatransfer
async function dragAndDrop() {
  let target = findTarget();
  /*if (window.location.hostname.indexOf('mail.google.') === 0)
    target = document.querySelector('.aAX');
  else if (window.location.hostname.indexOf('app.slack.') === 0)
    target = document.querySelector('.p-file_drag_drop__container');*/
  if (!target)
    //return alert('ScreenDrop cannot find where to drop your video, please try Slack web app')
    return chrome.runtime.sendMessage({ msg: "no suitable drop target found" });
  else 
    chrome.runtime.sendMessage({ msg: "Dropping inside " + window.location.hostname });
  return await simulateDrop(target);
}

let stream = null;
let mediaRecorder = null;
let file = null;
let URI = null;
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
function addSDWrapper()
{
  if (!sdWrapper)
  {
    sdWrapper = document.createElement('div');
    sdWrapper.style.position = 'fixed';
    sdWrapper.style.width = '200px'
    sdWrapper.style.cursor = 'pointer';
    sdWrapper.style.right = '0px';
    sdWrapper.style.bottom = '0px';
    sdWrapper.style.zIndex = 200000;
    sdWrapper.id = 'sd_wrapper';
    sdWrapper.innerHTML = '<div id="dragheader">Click to Drop <button id="startBtn">start</button></div><video id="sd_video" controls loop muted autoplay playsinline></video>'
    sdWrapper.addEventListener('click',dragAndDrop)
    document.body.appendChild(sdWrapper);
    startBtn.addEventListener('click',startScreenDrop)
    sdVideo = document.getElementById('sd_video');
    sdVideo.style.width = '100%';
    sdVideo.style.aspectRatio = '16/9';
    //sdVideo.src = chrome.extension.getURL("screendrop.webm")

  }
}

let hoverElement = null;
// on Firefox, we need to select the text before showing the context menu
// on Chrome, somehow the current word is selected when the user right clicks over words
window.oncontextmenu = function () {
  if (hoverElement !== null)
  {
    let selection = window.getSelection();
    if (selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
    let range = document.createRange();
    range.selectNode(hoverElement);
    selection.addRange(range);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  //addSDWrapper();
  //dragElement(sdWrapper);
});

let screenDragEnds = new Set();
let screenDrops = new Set();

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
