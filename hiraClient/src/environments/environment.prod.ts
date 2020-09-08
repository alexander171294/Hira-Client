export const environment = {
  production: true,
  electron: false,
  gateway: 'wss://thira.tandilserver.com:4433/webirc/websocket/',
  toolService: 'https://thira.tandilserver.com/',
  maxLogs: 50,
  intervalWHO: 10000,
  skins: {
    dark: 'darkSkin',
    light: 'lightSkin'
  },
  version: '1.0-RC3',
  default: {
    name: 'Hira.li',
    server: 'avalon.hira.li',
    isWS: true
  },
  maxServerBuffer: 100,
  maxChannelBuffer: 100,
  maxPrivateBuffer: 100,
  maxCommandHistory: 50
};
