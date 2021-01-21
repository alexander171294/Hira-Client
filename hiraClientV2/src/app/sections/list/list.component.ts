import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Input() title: string;
  @Input() elements: ListElement[] = [];
  @Input() closable: boolean;
  @Input() path: string;
  @Input() selected: string;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  open(elem: ListElement) {
    elem.notify = false;
    elem.warn = false;
    this.router.navigateByUrl(this.path + elem.name);
  }

}

export class ListElement {
  name: string;
  notify: boolean;
  warn: boolean;
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
