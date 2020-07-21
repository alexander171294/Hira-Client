import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ServerData } from 'src/app/services/ServerData';

@Component({
  selector: 'app-server-box',
  templateUrl: './server-box.component.html',
  styleUrls: ['./server-box.component.scss']
})
export class ServerBoxComponent implements OnInit {

  public server: string;
  public apodo: string;
  public apodoSecundario: string;
  public autojoin: string;

  @Output() connected: EventEmitter<ServerData> = new EventEmitter<ServerData>();

  constructor() { }

  ngOnInit(): void {
  }

  connect() {
    const sd = new ServerData();
    sd.apodo = this.apodo;
    sd.apodoSecundario = this.apodoSecundario;
    sd.autojoin = this.autojoin;
    sd.server = this.server;
    this.connected.emit(sd);
  }
}
