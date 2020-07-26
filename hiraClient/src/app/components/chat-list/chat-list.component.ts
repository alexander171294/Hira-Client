import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ParamParse } from 'src/app/utils/ParamParse';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {

  @Input() channels: string[];
  @Input() privateChats: string[];
  @Input() actualChat?: string;
  @Input() actualIsPrivateChat?: boolean;
  @Input() serverSelected: boolean;

  @Output() changeChat: EventEmitter<ChatData> = new EventEmitter<ChatData>();
  @Output() selectServer: EventEmitter<undefined> = new EventEmitter<undefined>();
  @Output() changeNick: EventEmitter<string> = new EventEmitter<string>();
  @Output() openServerCFG: EventEmitter<void> = new EventEmitter<void>();

  @Input() notifications: NotificationsChats;

  @Input() actualNick: string;
  embd: boolean;

  constructor() { }

  ngOnInit(): void {
    this.embd = ParamParse.parametria.embedded ? true : false;
  }

  activeChat(chatName: string, isPrivateChat: boolean) {
    // this.actualChat = chatName;
    // this.actualIsPrivateChat = isPrivateChat;
    this.changeChat.emit(new ChatData(isPrivateChat, chatName));
    if (isPrivateChat) {
      this.notifications.privates[chatName] = undefined;
    } else {
      this.notifications.channels[chatName] = undefined;
    }
  }

  deactiveChat() {
    this.selectServer.emit();
    this.notifications.server = false;
  }

  chgNick() {
    const nick = prompt('Put new nick or leave blank for cancel');
    if (nick) {
      this.changeNick.emit(nick);
    }
  }

  serverCfg() {
    this.openServerCFG.emit();
  }

  connections() {

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
