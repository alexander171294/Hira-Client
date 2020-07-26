import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProcessedMessage } from 'src/app/utils/IRCParser';
import { ParamParse } from 'src/app/utils/ParamParse';
import { UserWithMetadata, PostProcessor } from 'src/app/utils/PostProcessor';

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
  @Input() users: UserWithMetadata[];
  @Output() sendCommand: EventEmitter<string> = new EventEmitter<string>();
  @Output() openPrivateMessage: EventEmitter<string> = new EventEmitter<string>();
  public embd: boolean;

  public inQuote = false;
  public quoteAuthor: string;
  public quoteMessage: string;

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
      let commandOrMessage = evt.srcElement.value;
      if (this.inQuote) {
        commandOrMessage = '<' + this.quoteAuthor + '> ' + this.quoteMessage + ' | ' + commandOrMessage;
        this.inQuote = false;
      }
      this.sendCommand.emit(commandOrMessage);
      evt.srcElement.value = '';
      evt.srcElement.focus();
    }
  }

  doQuote(author: string, message: string) {
    this.inQuote = true;
    this.quoteAuthor = author;
    this.quoteMessage = PostProcessor.deconverHTML(message);
    document.getElementById('cboxInput').focus();
  }

  kdown(evt) {
    if (evt.keyCode === 9) { //tab
      evt.preventDefault();
      const writing = evt.srcElement.value.split(' ');
      const writingName = writing[writing.length - 1];
      if (this.users) {
        let nick;
        this.users.forEach((u) => {
          if (u.nick.toLowerCase().indexOf(writingName.toLowerCase()) === 0) {
            nick = u.nick + ' ';
          }
        });
        if (nick) {
          writing[writing.length - 1] = nick;
          evt.srcElement.value = writing.join(' ');
        }
      }
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
