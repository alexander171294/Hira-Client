import { UserInfoService } from './../../IRCore/services/user-info.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IRCoreService } from 'src/app/IRCore/IRCore.service';
import { PrivmsgService } from 'src/app/IRCore/services/privmsg.service';
import { PrivmsgData } from 'src/app/IRCore/services/PrivmsgData';
import { MenuSelectorEvent, MenuType } from 'src/app/sections/menu/menu-selector.event';
import { HistoryMessageCursorService } from '../utils/history-message-cursor.service';
import { GenericMessage, Quote } from 'src/app/IRCore/services/ChannelData';
import { VcardGetterService } from 'src/app/sections/chat-parts/message-item/link-vcard/vcard-getter.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-privmsg',
  templateUrl: './privmsg.component.html',
  styleUrls: ['./privmsg.component.scss']
})
export class PrivmsgComponent implements OnInit {


  public altMenu: boolean;
  public imageLoading: boolean;
  public emotePopupOpened: boolean;

  public nickTarget: string;
  private routeSubscription: Subscription;
  public preventOnScroll: boolean;
  public autoDownLocked: boolean;
  public newMessages: boolean;
  public message: string;
  public messageSubscription: Subscription;

  public privMsg: PrivmsgData = new PrivmsgData();
  public quote: Quote;
  public image: string;

  constructor(
    private router: Router,
    route: ActivatedRoute,
    private pmsgSrv: PrivmsgService,
    private ircSrv: IRCoreService,
    private hmcSrv: HistoryMessageCursorService,
    private vcg: VcardGetterService,
    private uis: UserInfoService
) {
  this.routeSubscription = this.router.events.subscribe(d => {
    if(this.nickTarget != route.snapshot.params.nick) {
      this.nickTarget = route.snapshot.params.nick;
      this.image = environment.hiranaTools + '/avatar?usr=' + this.nickTarget;
      this.ngOnInit();
    }
  });
}

  goDown() {
    const elem = document.getElementById('listMessages');
    this.autoDownLocked = false;
    this.newMessages = false;
    setTimeout(() => {
      this.preventOnScroll = true;
      elem.scrollTo({top: elem.scrollHeight});
      setTimeout(() => {
        this.preventOnScroll = false;
      }, 50);
    }, 100);
  }

  autoGoDown() {
    if(this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.messageSubscription = this.pmsgSrv.messagesReceived.subscribe(d => {
      if(d.author.user === this.nickTarget) {
        this.newMessages = false;
        if(this.autoDownLocked) {
          this.newMessages = true;
          return;
        }
        this.goDown();
      }
    });
  }

  writeEmote(emote: string) {
    this.message += ' ' + emote;
    this.emotePopupOpened = false;
  }

  onScroll(evt) {
    if(this.preventOnScroll) {
      return;
    }
    this.autoDownLocked = evt.srcElement.scrollTop + evt.srcElement.clientHeight != evt.srcElement.scrollHeight;
    if(!this.autoDownLocked) {
      this.newMessages = false;
    }
  }

  ngOnInit(): void {
    if(this.nickTarget) {
      this.privMsg = this.pmsgSrv.getPrivate(this.nickTarget);
      MenuSelectorEvent.menuChange.emit({
        type: MenuType.PRIV_MSG,
        name: this.nickTarget
      });
      this.goDown();
    }
    document.getElementById('messageInput').focus();
    this.autoGoDown();
  }

  quotear(q: Quote) {
    this.quote = q;
    document.getElementById('messageInput').focus();
  }

  kp(event) {
    if(event.keyCode === 13) {
      this.send();
    }
  }

  kd(event) {
    // tabulador
    if(event.keyCode == 9) {
      event.stopPropagation();
      event.preventDefault();
      const curPos = event.target.selectionStart;
      const partial = this.message.substr(0, curPos).split(' ');
      const search = partial[partial.length-1];
      const user = [this.privMsg.user, this.uis.getNick()].find(user => user.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) == 0);
      const startPos = curPos - search.length;
      this.message = this.message.substr(0, startPos) + user + this.message.substr(curPos) + ' ';
    }
    if(event.keyCode == 38) { // arrow up
      this.message = this.hmcSrv.prev();
    }
    if(event.keyCode == 40) { // arrow down
      this.message = this.hmcSrv.next();
    }
  }

  send() {
    if(this.message?.trim().length == 0) {
      return;
    }
    if(this.quote) {
      this.message = '<'+this.quote.author+'> '+this.quote.quote+' |' + this.message;
      this.quote = undefined;
    }
    this.hmcSrv.save(this.message);
    this.ircSrv.sendMessageOrCommand(this.message, this.nickTarget);
    this.message = '';
    document.getElementById('messageInput').focus();

    this.newMessages = false;
    if(this.autoDownLocked) {
      this.newMessages = true;
      return;
    }
    this.goDown();
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.messageSubscription.unsubscribe();
  }

  copyChat(evt) {
    // evt.stopPropagation();
    let chat = '';
    this.privMsg.messages.forEach((msg: GenericMessage) => {
      chat += msg.date + ' <' + msg.author.user + '> ' + msg.message + '\r\n';
    });
    navigator.clipboard.writeText(chat).then(d => {
      console.log('copied');
    });
  }

  copyLinkChat(evt) {
    // evt.stopPropagation();

  }

  onFileSelected(event) {
    this.uploadFile(event.srcElement.files[0]);
  }

  uploadFile(file) {
    const fr = new FileReader();
    fr.onloadend = () => {
      this.vcg.uploadImage((fr.result as string).split('base64,')[1]).subscribe(d => {
        const cboxI = (document.getElementById('messageInput') as any);
        if (cboxI.value.length > 0) {
          cboxI.value = (document.getElementById('messageInput') as any).value.trim() + ' ';
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

}
