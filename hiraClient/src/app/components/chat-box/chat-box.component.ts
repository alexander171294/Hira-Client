import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MessageTypes, ProcessedMessage } from 'src/app/utils/IRCParser';
import { ParamParse } from 'src/app/utils/ParamParse';
import { UserWithMetadata, PostProcessor } from 'src/app/utils/PostProcessor';
import { VcardGetterService } from '../link-vcard/vcard-getter.service';
import { UserStatusService } from 'src/app/services/user-status.service';
import { environment } from 'src/environments/environment';
import { HistoryMessageCursorService } from './history-message-cursor.service';

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
  public showDesktopReleases: boolean;

  public inQuote = false;
  public quoteAuthor: string;
  public quoteMessage: string;

  public toolService = environment.toolService;

  public copied = false;
  public scrollLocked = false;
  public newMessages = false;

  constructor(private vcg: VcardGetterService, public usSrv: UserStatusService, private historySrv: HistoryMessageCursorService) { }

  ngOnInit(): void {
    this.embd = ParamParse.parametria.embedded ? true : false;
    this.showDesktopReleases = !environment.electron;
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

  onScroll(evt) {
    const cbox = document.getElementById('cboxMessages');
    if (cbox.scrollTop + cbox.clientHeight !== cbox.scrollHeight) {
      this.scrollLocked = true;
    } else {
      this.scrollLocked = false;
      this.newMessages = false;
    }
  }

  goBottom() {
    this.newMessages = true;
    if (!this.scrollLocked) {
      setTimeout(el => {
        const cbox = document.getElementById('cboxMessages');
        cbox.scrollTop = cbox.scrollHeight;
      }, 100);
    }
  }

  forceBottom() {
    const cbox = document.getElementById('cboxMessages');
    cbox.scrollTop = cbox.scrollHeight;
  }

  send(evt) {
    this.scrollLocked = false;
    if (evt.keyCode === 13) {
      let commandOrMessage = evt.srcElement.value.trim();
      if (commandOrMessage.length < 1) {
        return;
      }
      this.historySrv.save(commandOrMessage);
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
    } else if (evt.keyCode === 38) { // up
      evt.srcElement.value = this.historySrv.prev();
    } else if (evt.keyCode === 40) { // down
      evt.srcElement.value = this.historySrv.next();
    } else {
      // console.log(evt.keyCode);
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

  copyChat(evt) {
    let chat = '';
    this.messages.forEach((message) => {
      if (message.messageType === MessageTypes.CHANNEL_MSG && !message.data.fromLog) {
        if (message.data.meAction) {
          chat += message.data.time + ' **' + message.data.author + '** ' + message.data.message + '\n';
        } else {
          chat += message.data.time + ' [' + message.data.author + '] ' + message.data.message + '\n';
        }
      }
    });
    navigator.clipboard.writeText(chat).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 1000);
    });
  }

}

export enum CBoxChatTypes {
  CHANNEL = 'CHANNEL',
  SERVER = 'SERVER',
  PRIVMSG = 'PRIVMSG'
}
