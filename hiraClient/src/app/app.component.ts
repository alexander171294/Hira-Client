import { Component } from '@angular/core';
import { IRCProtocolService } from './services/ircprotocol.service';
import { ServerData } from './services/ServerData';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  connectPopup = true;

  constructor(private ircproto: IRCProtocolService) { }


  connect(serverData: ServerData) {
    this.ircproto.connect(serverData);
    this.connectPopup = false;
  }
}
