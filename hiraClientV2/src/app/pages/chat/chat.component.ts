import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  title: string = 'Underc0de';
  image: string = undefined;
  members: number = 15;
  topic = 'Canal oficial de UNDERC0DE en IRC || Feliz cumpleaños Comunidad de Underc0de. A por muchos años más!!';

  constructor() { }

  ngOnInit(): void {
  }

}
