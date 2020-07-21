import { Component, OnInit, Input } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

}
