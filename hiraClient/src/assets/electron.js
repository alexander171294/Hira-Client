const ipcRenderer = require('electron').ipcRenderer;

// ipcRenderer.on('startConfig', function (event, data) {
//     const evt = new CustomEvent('startConfig', data);
//     document.dispatchEvent(evt);
// });

const electronApi = {
  news: function(data){
      ipcRenderer.send('news', data);
  }
};