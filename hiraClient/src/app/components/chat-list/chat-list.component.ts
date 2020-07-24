import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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

  @Input() notifications: NotificationsChats;

  @Input() actualNick: string;

  constructor() { }

  ngOnInit(): void {
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
