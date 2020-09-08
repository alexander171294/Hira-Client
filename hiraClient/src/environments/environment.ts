// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
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
    server: 'kappa.hira.li',
    isWS: false
  },
  maxServerBuffer: 100,
  maxChannelBuffer: 100,
  maxPrivateBuffer: 100,
  maxCommandHistory: 50
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
