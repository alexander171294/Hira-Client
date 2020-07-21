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

  constructor() { }

  ngOnInit(): void {
  }

  activeChat(chatName: string, isPrivateChat: boolean) {
    // this.actualChat = chatName;
    // this.actualIsPrivateChat = isPrivateChat;
    this.changeChat.emit(new ChatData(isPrivateChat, chatName));
  }

  deactiveChat() {
    this.selectServer.emit();
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
  [key: string]: boolean;
}
