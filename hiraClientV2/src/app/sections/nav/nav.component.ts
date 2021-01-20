import { Component, OnInit } from '@angular/core';
import { ConnectionStatus, ConnectionStatusData, WebSocketUtil } from 'src/app/IRCore/utils/WebSocket.util';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public connected: boolean;
  public error: boolean;

  constructor() { }

  ngOnInit(): void {
    WebSocketUtil.statusChanged.subscribe((status: ConnectionStatusData<any>) => {
      if(status.status == ConnectionStatus.CONNECTED) {
        this.connected = true;
        this.error = false;
      }
      if(status.status == ConnectionStatus.DISCONNECTED || status.status === ConnectionStatus.ERROR) {
        this.error = true;
        this.connected = false;
      }
    });
  }

}
