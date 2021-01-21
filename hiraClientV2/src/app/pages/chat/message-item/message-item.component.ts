import { GenericMessage } from './../../../IRCore/services/ChannelData';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent implements OnInit {

  @Input() messageType: MessagesTypes;
  @Input() message: GenericMessage;

  constructor() { }

  ngOnInit(): void {
  }

  quotear() {

  }

}

export enum MessagesTypes {
  MESSAGE_RAW,
  ACTION_ME,
  NOTIFY
}
