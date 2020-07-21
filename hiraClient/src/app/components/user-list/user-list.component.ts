import { Component, OnInit, Input } from '@angular/core';
import { UserWithMetadata } from 'src/app/services/RichLayer';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @Input() users: UserWithMetadata[];

  constructor() { }

  ngOnInit(): void {
  }

}
