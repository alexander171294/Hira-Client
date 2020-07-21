import { Injectable, EventEmitter } from '@angular/core';
import { ServerData } from './ServerData';
import { ServersHdlrService, ServerDataConnected } from './servers-hdlr.service';

@Injectable({
  providedIn: 'root'
})
export class MessageHandlerService {

  public onError: EventEmitter<ErrorData> = new EventEmitter<ErrorData>();
  public onMessage: EventEmitter<MessageData> = new EventEmitter<MessageData>();

  constructor(private serverHdlr: ServersHdlrService) { }

  connect(server: ServerData) {
    const serverWWS = this.serverHdlr.getConnection(server);
    serverWWS.rawObs.subscribe(
      msg => {
        this.processMessage(msg, serverWWS);
        if (!server.connected) {
          server.connected = true;
        }
      },
      err => {
        this.processError(err, serverWWS);
      }
    );
  }

  processError(err: any, server: ServerDataConnected) {
    this.onError.emit(new ErrorData(err, server));
  }

  processMessage(msg: string, server: ServerDataConnected) {
    this.onMessage.emit(new MessageData(msg, server));
  }

}

export class ErrorData {
  error: any;
  server: ServerDataConnected;

  constructor(error: any, server: ServerDataConnected) {
    this.error = error;
    this.server = server;
  }
}

export class MessageData {
  message: string;
  server: ServerDataConnected;

  constructor(msg: string, server: ServerDataConnected) {
    this.message = msg;
    this.server = server;
  }
}
