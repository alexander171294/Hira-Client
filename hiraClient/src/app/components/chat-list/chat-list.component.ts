import { UserInfoService } from './../../IRCore/services/user-info.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ParamParse } from 'src/app/utils/ParamParse';
import { environment } from 'src/environments/environment';
import { ChannelsService } from 'src/app/IRCore/services/channels.service';
import { ChannelData } from 'src/app/IRCore/services/ChannelData';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {

  channels: ChannelData[];
  privateChats: string[];
  actualNick: string;
  @Input() actualChat?: string;
  @Input() actualIsPrivateChat?: boolean;
  @Input() serverSelected: boolean;

  @Output() changeChat: EventEmitter<ChatData> = new EventEmitter<ChatData>();
  @Output() selectServer: EventEmitter<undefined> = new EventEmitter<undefined>();
  @Output() changeNick: EventEmitter<void> = new EventEmitter<void>();
  @Output() openServerCFG: EventEmitter<void> = new EventEmitter<void>();
  @Output() electronCFG: EventEmitter<void> = new EventEmitter<void>();
  @Output() doLeave: EventEmitter<string> = new EventEmitter<string>();
  @Output() doClosePC: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendCommand: EventEmitter<string> = new EventEmitter<string>();
  @Output() openHelp: EventEmitter<string> = new EventEmitter<string>();

  embd: boolean;

  version = environment.version;
  public toolService = environment.toolService;

  searching = false;
  findedChannels: ChannelData[];
  findedPrivates: string[];

  constructor(private userSrv: UserInfoService, private chanSrv: ChannelsService) {
    this.userSrv.onChangeNick.subscribe(newnick => {
      this.actualNick = newnick;
    });
    this.channels = this.chanSrv.getChannels();
  }

  ngOnInit(): void {
    this.embd = ParamParse.parametria.embedded ? true : false;
  }

  activeChat(chatName: string, isPrivateChat: boolean) {
    this.changeChat.emit(new ChatData(isPrivateChat, chatName));
  }

  deactiveChat() {
    this.selectServer.emit();
    // this.notifications.server = false;
  }

  chgNick() {
    this.changeNick.emit();
  }

  leave(channel: ChannelData) {
    this.doLeave.emit(channel.name);
  }

  close(privateChat) {
    this.doClosePC.emit(privateChat);
  }

  invertTheme() {
    if (localStorage.getItem('ThemeForzed') === 'dark') {
      localStorage.setItem('ThemeForzed', 'light');
      document.body.classList.remove(environment.skins.dark);
    } else {
      localStorage.setItem('ThemeForzed', 'dark');
      document.body.classList.add(environment.skins.dark);
    }
  }

  serverCfg() {
    this.openServerCFG.emit();
  }

  kp(evt) {
    const query = evt.srcElement.value;
    console.log(query);
    if (query.length >= 2) {
      this.searching = true;
      this.findedChannels = this.channels?.filter(channel => channel.name.toLowerCase().indexOf(query.toLowerCase()) >= 0);
      this.findedPrivates = this.privateChats?.filter(pc => pc.toLowerCase().indexOf(query.toLowerCase()) >= 0);
    } else {
      this.searching = false;
    }
  }

  clearSearch() {
    this.searching = false;
    (document.getElementById('searchChannelsAndPrivsInput') as any).value = '';
  }

}

export class ChatData {
  privateChat: boolean;
  chatName: string;
  constructor(privateChat: boolean, chatName: string) {
    this.privateChat = privateChat;
    this.chatName = chatName;
  }
}

export class NotificationsChats {
  channels: NotificationHash = {};
  privates: NotificationHash = {};
  server: boolean;
}

class NotificationHash {
  [key: string]: string;
}
