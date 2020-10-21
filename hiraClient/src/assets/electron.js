const ipcRenderer = require('electron').ipcRenderer;
const GLB_electronConfig = {
  sound: true
};

// ipcRenderer.on('startConfig', function (event, data) {
//     const evt = new CustomEvent('startConfig', data);
//     document.dispatchEvent(evt);
// });
console.log('On playsound listen;');
ipcRenderer.on('playSound', function(evt, data) {
  console.log('On playsound doed;');
  if(GLB_electronConfig.sound) {
    playSoundNotification();
  }
})

ipcRenderer.on('logRoute', function(evt, data) {
  const Nevt = new CustomEvent('logRoute', {detail: data});
  document.dispatchEvent(Nevt);
});

const electronApi = {
  news: function(data){
    ipcRenderer.send('news', data);
  },
  log: function(data) {
    ipcRenderer.send('savelog', data);
  },
  getLogRoute: function(data) {
    ipcRenderer.send('getLogRoute', data);
  },
  setLogRoute: function(data) {
    ipcRenderer.send('setLogRoute', data);
  }
};

const audio = new Audio('assets/notification.mp3');
function playSoundNotification() {
  audio.play();
}
