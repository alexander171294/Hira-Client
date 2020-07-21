import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserWithMetadata } from 'src/app/services/RichLayer';
import { ParamParse } from 'src/app/services/ParamParse';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @Input() users: UserWithMetadata[];
  @Output() openPrivateChat: EventEmitter<string> = new EventEmitter<string>();
  embd: boolean;

  constructor() { }

  ngOnInit(): void {
    this.embd = ParamParse.parametria.embedded ? true : false;
  }

  openPrivate(user: string) {
    this.openPrivateChat.emit(user);
  }

}
