import { IRCoreService } from 'src/app/IRCore/IRCore.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionStatus, ConnectionStatusData, WebSocketUtil } from 'src/app/IRCore/utils/WebSocket.util';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public connected: boolean;
  public error: boolean;
  public timmer: any;

  constructor(private router: Router, private ircSrv: IRCoreService) { }

  ngOnInit(): void {
    WebSocketUtil.statusChanged.subscribe((status: ConnectionStatusData<any>) => {
      if(status.status == ConnectionStatus.CONNECTED) {
        this.connected = true;
        this.error = false;
        this.timmer = setInterval(() => {
          this.ircSrv.sendRaw('PING IRCoreWS');
        }, 60000); // autoping
      }
      if(status.status == ConnectionStatus.DISCONNECTED || status.status === ConnectionStatus.ERROR) {
        this.error = true;
        this.connected = false;
        this.router.navigateByUrl('/user');
        clearInterval(this.timmer);
      }
    });
  }

}
