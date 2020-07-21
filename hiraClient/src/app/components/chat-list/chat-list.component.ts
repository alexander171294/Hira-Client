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

  @Output() changeChat: EventEmitter<ChatData> = new EventEmitter<ChatData>();

  constructor() { }

  ngOnInit(): void {
  }

  activeChat(chatName: string, isPrivateChat: boolean) {
    this.changeChat.emit(new ChatData(isPrivateChat, chatName));
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
