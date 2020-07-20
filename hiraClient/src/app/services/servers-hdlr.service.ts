import { Injectable } from '@angular/core';
import { ServerData } from './ServerData';
import { WebSocketHDLR } from './websocket';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServersHdlrService {

  public servers: ServerDataHash;

  constructor() { }

  public getConnection(server: ServerData): Observable<string> {
    if (!this.servers[server.id]) {
      this.servers[server.id] = ServerDataWithWS.getSDWS(server,  new WebSocketHDLR());
      this.servers[server.id].rawObs = this.servers[server.id].websocket.connect(environment.gateway);
    }
    return this.servers[server.id].rawObs;
  }

  public getConnectionFromID(serverID: string): Observable<string> | undefined {
    if (this.servers[serverID]) {
      return this.servers[serverID].rawObs;
    }
  }

  public getServerFromID(serverID: string): ServerDataWithWS | undefined {
    if (this.servers[serverID]) {
      return this.servers[serverID];
    }
  }
}

export class ServerDataWithWS extends ServerData {

  public websocket: WebSocketHDLR;
  public rawObs: Observable<string>;

  public static getSDWS(server: ServerData, websocket: WebSocketHDLR) {
    const srvws = server as ServerDataWithWS;
    srvws.websocket = websocket;
    return srvws;
  }

}

export interface ServerDataHash {
  [key: string]: ServerDataWithWS;
}
