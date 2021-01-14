import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent implements OnInit {

  @Input() messageType: MessagesTypes;

  constructor() { }

  ngOnInit(): void {
  }

}

export enum MessagesTypes {
  MESSAGE_RAW,
  ACTION_ME,
  NOTIFY
}
