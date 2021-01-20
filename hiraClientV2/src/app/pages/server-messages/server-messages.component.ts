import { IRCoreService } from 'src/app/IRCore/IRCore.service';
import { Component, OnInit } from '@angular/core';
import { ServerMsgService } from 'src/app/IRCore/services/server-msg.service';
import { IRCMessage } from 'src/app/IRCore/utils/IRCMessage.util';

@Component({
  selector: 'app-server-messages',
  templateUrl: './server-messages.component.html',
  styleUrls: ['./server-messages.component.scss']
})
export class ServerMessagesComponent implements OnInit {

  public messages: IRCMessage[];
  public serverCommand: string;

  constructor(private srvSrv: ServerMsgService, private ircSrv: IRCoreService) {
    this.messages = srvSrv.messages;
  }

  ngOnInit(): void {

  }

  kp(evt) {
    if(evt.keyCode === 13) {
      this.send();
    }
  }

  send() {
    this.ircSrv.sendMessageOrCommand(this.serverCommand);
    this.serverCommand = '';
    document.getElementById('commandInput').focus();
  }

}
