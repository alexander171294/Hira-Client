import { Injectable } from '@angular/core';
import { ServerData } from '../utils/ServerData';
import { WebSocketHDLR } from '../utils/websocket';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServersHdlrService {

  public servers: ServerDataHash = {};

  constructor() { }

  public getConnection(server: ServerData): ServerDataConnected {
    if (!this.servers[server.id]) {
      this.servers[server.id] = ServerDataConnected.getSDWS(server,  new WebSocketHDLR());
      if (server.isWS) {
        this.servers[server.id].rawObs = this.servers[server.id].websocket.connect('wss://' + server.server);
      } else {
        this.servers[server.id].rawObs = this.servers[server.id].websocket.connect(environment.gateway);
      }
    }
    return this.servers[server.id];
  }

  public getConnectionFromID(serverID: string): ServerDataConnected | undefined {
    if (this.servers[serverID]) {
      return this.servers[serverID];
    }
  }

}

export class ServerDataConnected extends ServerData {

  public websocket: WebSocketHDLR;
  public rawObs: Observable<string>;
  public actualNick: string;

  public static getSDWS(server: ServerData, websocket: WebSocketHDLR) {
    const srvws = server as ServerDataConnected;
    srvws.websocket = websocket;
    return srvws;
  }

}

export interface ServerDataHash {
  [key: string]: ServerDataConnected;
}
