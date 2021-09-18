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
