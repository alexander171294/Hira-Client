import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IRCParser } from 'src/app/utils/IRCParser';
import { WhoData } from 'src/app/utils/WhoData';

@Component({
  selector: 'app-whois',
  templateUrl: './whois.component.html',
  styleUrls: ['./whois.component.scss']
})
export class WhoisComponent implements OnInit {

  @Output() oClose: EventEmitter<void> = new EventEmitter<void>();
  @Input() nick: string;
  data: WhoData;
  channels: any[];

  constructor() { }

  ngOnInit(): void {
    this.data = IRCParser.whoUsersData[this.nick];
    this.channels = this.data.getChannelParsed();
  }

}
