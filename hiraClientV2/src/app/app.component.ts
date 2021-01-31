import { GmodeHandler } from './IRCore/handlers/Gmode.handler';
import { environment } from './../environments/environment';
import { Component } from '@angular/core';
import { ServerMsgService } from './IRCore/services/server-msg.service';
import { IRCoreService } from './IRCore/IRCore.service';
import { ParamParse } from './ParamsParse';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'hiraClientV2';
  codename = environment.codename;
  version = environment.version;
  requestNick = undefined;

  constructor(private srvSrv: ServerMsgService, private ircoreSrv: IRCoreService) {
    GmodeHandler.onPrivateRequest.subscribe(d => {
      console.log(d);
      this.requestNick = d;
    });
    ParamParse.parseHash(window.location.hash.slice(1));
    if(ParamParse.parametria['embedded'] && ParamParse.parametria['embedded'] == 'yes') {
      document.body.classList.add('embedded');
    }
  }

  accept(nick: string) {
    this.ircoreSrv.sendMessageOrCommand('/accept ' + nick);
    this.requestNick = undefined;
  }

}
