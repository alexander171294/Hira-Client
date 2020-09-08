const ipcRenderer = require('electron').ipcRenderer;

// ipcRenderer.on('startConfig', function (event, data) {
//     const evt = new CustomEvent('startConfig', data);
//     document.dispatchEvent(evt);
// });
console.log('On playsound listen;');
ipcRenderer.on('playSound', function(evt, data) {
  console.log('On playsound doed;');
  playSoundNotification();
})

const electronApi = {
  news: function(data){
      ipcRenderer.send('news', data);
  }
};

const audio = new Audio('assets/notification.mp3');
function playSoundNotification() {
  audio.play();
}
