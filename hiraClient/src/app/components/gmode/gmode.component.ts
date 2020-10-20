import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-gmode',
  templateUrl: './gmode.component.html',
  styleUrls: ['./gmode.component.scss']
})
export class GmodeComponent implements OnInit {

  @Output() oClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() nick: string;

  constructor() { }

  ngOnInit(): void {
  }

}
