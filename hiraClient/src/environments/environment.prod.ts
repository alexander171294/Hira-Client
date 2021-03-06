export const environment = {
  production: true,
  electron: false,
  // gateway: 'wss://thira.tandilserver.com:4433/webirc/websocket/',
  gateway: localStorage.getItem('custom-gateway') ? localStorage.getItem('custom-gateway') : 'wss://wircg.tandilserver.com/webirc/websocket/',
  toolService: 'https://thira.tandilserver.com/',
  maxLogs: 50,
  intervalWHO: 10000,
  skins: {
    dark: 'darkSkin',
    light: 'lightSkin'
  },
  version: 'RC7-NightWitch',
  default: {
    name: 'Hirana',
    server: 'irc.hirana.net',
    isWS: true
  },
  maxServerBuffer: 100,
  maxChannelBuffer: 200,
  maxPrivateBuffer: 300,
  maxCommandHistory: 50
};
