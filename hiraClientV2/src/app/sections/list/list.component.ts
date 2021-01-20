import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Input() title: string;
  @Input() elements: ListElement[] = [];
  @Input() closable: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}

export class ListElement {
  name: string;
  notify: boolean;
  image?: string;
  active: boolean;
  labels?: Label[];
  color?: string;
}

export interface Label {
  name: string;
  color: string;
  background: string;
}
