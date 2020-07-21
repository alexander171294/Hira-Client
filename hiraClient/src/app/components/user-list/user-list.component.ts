import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserWithMetadata } from 'src/app/services/RichLayer';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @Input() users: UserWithMetadata[];
  @Output() openPrivateChat: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  openPrivate(user: string) {
    this.openPrivateChat.emit(user);
  }

}
