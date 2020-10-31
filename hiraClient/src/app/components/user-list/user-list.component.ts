import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ParamParse } from 'src/app/utils/ParamParse';
import { UserWithMetadata } from 'src/app/utils/PostProcessor';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @Input() users: UserWithMetadata[];
  @Input() channelName: string;
  @Output() openPrivateChat: EventEmitter<string> = new EventEmitter<string>();
  embd: boolean;

  public toolService = environment.toolService;

  constructor() { }

  ngOnInit(): void {
    this.embd = ParamParse.parametria.embedded ? true : false;
  }

  openPrivate(user: string) {
    this.openPrivateChat.emit(user);
  }

}
