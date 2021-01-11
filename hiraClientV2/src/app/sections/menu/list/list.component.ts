import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Input() title: string;
  @Input() elements: ListElement[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}

export interface ListElement {
  name: string;
  notify: boolean;
  image?: string;
  active: boolean;
}
