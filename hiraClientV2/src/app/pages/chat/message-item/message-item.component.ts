import { GenericMessage, Quote } from './../../../IRCore/services/ChannelData';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent implements OnInit {

  @Input() messageType: MessagesTypes;
  @Input() message: GenericMessage;
  @Output() quote: EventEmitter<Quote> = new EventEmitter<Quote>();

  constructor() { }

  ngOnInit(): void {
  }

  quotear() {
    const q = new Quote();
    q.author = this.message.author.user;
    q.quote = this.message.message;
    this.quote.emit(q);
  }

}

export enum MessagesTypes {
  MESSAGE_RAW,
  ACTION_ME,
  NOTIFY
}
