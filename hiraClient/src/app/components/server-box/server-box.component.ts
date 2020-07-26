import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ServerData } from 'src/app/services/ServerData';

@Component({
  selector: 'app-server-box',
  templateUrl: './server-box.component.html',
  styleUrls: ['./server-box.component.scss']
})
export class ServerBoxComponent implements OnInit {

  public server: string = 'kappa.hira.li:6667';
  public apodo: string = 'Zetta007';
  public apodoSecundario: string = 'harkonidaz_tst02';
  public autojoin: string = '#harkolandia';

  @Input() isConnected: boolean;
  @Input() connectionError: boolean;

  @Output() connected: EventEmitter<ServerData> = new EventEmitter<ServerData>();
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  connect() {
    const sd = new ServerData();
    sd.apodo = this.apodo;
    sd.username = this.apodo;
    sd.apodoSecundario = this.apodoSecundario;
    sd.autojoin = this.autojoin;
    sd.server = this.server;
    this.connected.emit(sd);
    this.isConnected = true;
  }
}
