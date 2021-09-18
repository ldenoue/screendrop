function downloadScreenDrop(url) {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = 'ScreenDrop-' + Date.now() + '.webm';
  a.click();
  setTimeout(() => { a.remove() },100);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.download)
      downloadScreenDrop(request.download)
    sendResponse({ok:true});
  }
);

