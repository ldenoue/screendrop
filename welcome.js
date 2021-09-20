let result = document.getElementById('result');
document.getElementById('mic').addEventListener('click',async (evt) => {
  try {
    let stream = await navigator.mediaDevices.getUserMedia({audio:true});
    stream.getTracks().forEach((t) => t.stop());
    result.textContent = 'All set';

  } catch (exception) {
    result.textContent = 'Microphone not enabled. Right click on the ScreenDrop icon and pick "Options" to change';
  }
});

let keep = document.getElementById('keep');
chrome.storage.local.get('keepLastOnly',(res) => keep.checked = res.keepLastOnly === true);
keep.addEventListener('change', (res) => {
  let keepLastOnly = res.target.checked;
  chrome.storage.local.set({keepLastOnly});
});

function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

async function showFileInFolder(evt,fileId) {
  evt.stopPropagation()
  evt.preventDefault()
  chrome.downloads.show(fileId);
}

/*async function viewVideo(fileId) {
  console.log(fileId);
  chrome.downloads.open(fileId)
}*/

function deleteFile(evt,item,fileId) {
  evt.stopPropagation()
  evt.preventDefault()
  try {
    chrome.downloads.removeFile(fileId);
  } catch (ealreadydeleted) {
    alert(ealreadydeleted)
  }
  item.remove();
}

function createItem(file) {
  let item = document.createElement('div');
  item.className = 'file';
  let video = document.createElement('video');
  video.className = 'video';
  video.controls = false;
  video.autoplay = false;
  video.playsInline = true;
  file.exists = true;
  video.addEventListener('click',() => video.paused?video.play():video.pause());
  video.src = file.url;
  item.appendChild(video);
  let details = document.createElement('div');
  details.innerHTML = `
    ${file.filename.split('/').pop()}<br>
    ${bytesToSize(file.fileSize)} - ${new Date(file.startTime).toLocaleString()}<br>
    <a href="#">view in folder</a> <a href="#">delete</a>
  `;
  details.className = 'details'
  item.appendChild(details);
  let links = details.querySelectorAll('a');
  if (links.length === 2) {
    links[0].addEventListener('click',(evt) => showFileInFolder(evt,file.id));
    links[1].addEventListener('click',(evt) => deleteFile(evt,item,file.id));
  }
  return item;
}

async function showFiles(files) {
  let myfiles_div = document.getElementById('myfiles');
  files = files.filter(file => file.byExtensionName === 'ScreenDrop' /*&& file.exists*/);
  for (let file of files)
  {
    let item = createItem(file);
    myfiles_div.appendChild(item)
  }
}

chrome.downloads.search({orderBy:['-startTime']}, (res) => {
  showFiles(res);
})