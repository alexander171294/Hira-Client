import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProcessedMessage } from 'src/app/services/IRCParser';

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

  constructor() { }

  ngOnInit(): void {
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
    }
  }

}

export enum CBoxChatTypes {
  CHANNEL = 'CHANNEL',
  SERVER = 'SERVER',
  PRIVMSG = 'PRIVMSG'
}
