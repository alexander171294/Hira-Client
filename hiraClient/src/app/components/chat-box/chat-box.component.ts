import { Component, OnInit, Input } from '@angular/core';
import { ProcessedMessage, IRCMessage, IRCMessageDTO } from 'src/app/services/IRCParser';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {

  @Input() messages: ProcessedMessage<any>[];

  constructor() { }

  ngOnInit(): void {
  }

}
