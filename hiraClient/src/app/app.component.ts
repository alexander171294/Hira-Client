import { Component } from '@angular/core';
import { IRCProtocolService } from './services/ircprotocol.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  connectPopup = true;

  constructor(private ircproto: IRCProtocolService) { }


}
