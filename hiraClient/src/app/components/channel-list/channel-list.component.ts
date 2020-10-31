import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit {

  @Output() closeEvt: EventEmitter<string | void> = new EventEmitter<string | void>();

  public channels: {name: string, description: string}[];

  constructor() { }

  ngOnInit(): void {
    // this.channels = this.chlList.getChannelList();
  }

  selectChannel(channel: string) {
    this.closeEvt.emit(channel);
  }

  close() {
    this.closeEvt.emit();
  }

}
