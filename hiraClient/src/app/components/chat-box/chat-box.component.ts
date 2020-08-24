import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProcessedMessage } from 'src/app/utils/IRCParser';
import { ParamParse } from 'src/app/utils/ParamParse';
import { UserWithMetadata, PostProcessor } from 'src/app/utils/PostProcessor';
import { VcardGetterService } from '../link-vcard/vcard-getter.service';
import { UserStatusService } from 'src/app/services/user-status.service';

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
  public imageLoading: boolean;
  public fullVersionLink: string;

  public inQuote = false;
  public quoteAuthor: string;
  public quoteMessage: string;

  constructor(private vcg: VcardGetterService, public usSrv: UserStatusService) { }

  ngOnInit(): void {
    this.embd = ParamParse.parametria.embedded ? true : false;
    if (this.embd) {
      // this.fullVersionLink = window.location.protocol + '//' + window.location.host + '/#';
      this.fullVersionLink = '';
      if (ParamParse.parametria.server) {
        this.fullVersionLink += '/#server=' + ParamParse.parametria.server + ';';
      }
      if (ParamParse.parametria.apodo) {
        this.fullVersionLink += '/#apodo=' + ParamParse.parametria.apodo + ';';
      }
      if (ParamParse.parametria.apodoSecundario) {
        this.fullVersionLink += '/#apodoSecundario=' + ParamParse.parametria.apodoSecundario + ';';
      }
      if (ParamParse.parametria.autojoin) {
        this.fullVersionLink += '/#autojoin=' + ParamParse.parametria.autojoin + ';';
      }
    }
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

  onDrop(event) {
    const file = event.dataTransfer.files[0];
    if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
      this.uploadFile(file);
    }
    event.preventDefault();
  }
  onDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  openPrivate(user: string){
    this.openPrivateMessage.emit(user);
  }

  onFileSelected(event) {
    this.uploadFile(event.srcElement.files[0]);
  }

  uploadFile(file) {
    const fr = new FileReader();
    fr.onloadend = () => {
      this.vcg.uploadImage((fr.result as string).split('base64,')[1]).subscribe(d => {
        const cboxI = (document.getElementById('cboxInput') as any);
        if (cboxI.value.length > 0) {
          cboxI.value = (document.getElementById('cboxInput') as any).value.trim() + ' ';
        }
        cboxI.value += d.image;
        cboxI.focus();
        this.imageLoading = false;
      }, err => {
        this.imageLoading = false;
      });
    };
    if (file) {
      this.imageLoading = true;
      fr.readAsDataURL(file);
    }
  }

  openFile() {
    document.getElementById('fileInput').click();
  }

  dumpMessage(message) {
    return JSON.stringify(message);
  }

}

export enum CBoxChatTypes {
  CHANNEL = 'CHANNEL',
  SERVER = 'SERVER',
  PRIVMSG = 'PRIVMSG'
}
