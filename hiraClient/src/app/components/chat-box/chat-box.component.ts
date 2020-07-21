import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProcessedMessage } from 'src/app/services/IRCParser';
import { ParamParse } from 'src/app/services/ParamParse';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {

  @Input() messages: ProcessedMessage<any>[];
  @Input() chatName: string;
  @Input() chatType: CBoxChatTypes;
  @Input() members: number;
  @Input() topic: string;
  @Output() sendCommand: EventEmitter<string> = new EventEmitter<string>();
  @Output() openPrivateMessage: EventEmitter<string> = new EventEmitter<string>();
  public embd: boolean;

  constructor() { }

  ngOnInit(): void {
    this.embd = ParamParse.parametria.embedded ? true : false;
  }

  goBottom() {
    setTimeout(el => {
      const cbox = document.getElementById('cboxMessages');
      cbox.scrollTop = cbox.scrollHeight;
    }, 100);
  }

  send(evt) {
    if (evt.keyCode === 13) {
      const commandOrMessage = evt.srcElement.value;
      this.sendCommand.emit(commandOrMessage);
      evt.srcElement.value = '';
      evt.srcElement.focus();
    }
  }

  openPrivate(user: string){
    this.openPrivateMessage.emit(user);
  }

}

export enum CBoxChatTypes {
  CHANNEL = 'CHANNEL',
  SERVER = 'SERVER',
  PRIVMSG = 'PRIVMSG'
}
