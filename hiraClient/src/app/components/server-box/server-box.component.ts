import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ServerData } from 'src/app/utils/ServerData';
import { ParamParse } from 'src/app/utils/ParamParse';
import { environment } from 'src/environments/environment';

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

  @Input() isConnected: boolean;
  @Input() connectionError: boolean;

  @Output() connected: EventEmitter<ServerData> = new EventEmitter<ServerData>();
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    if (!environment.production) {
      this.server = 'kappa.hira.li:6667';
      this.apodo = 'Zetta007';
      this.apodoSecundario = 'harkonidaz_tst02';
      this.autojoin = '#harkolandia';
    }
    this.server = ParamParse.parametria.server ? encodeURIComponent(ParamParse.parametria.server) : this.server;
    this.apodo = ParamParse.parametria.apodo ? encodeURIComponent(ParamParse.parametria.apodo) : this.apodo;
    this.apodoSecundario = ParamParse.parametria.apodoSecundario ? encodeURIComponent(ParamParse.parametria.apodoSecundario) : this.apodoSecundario;
    this.autojoin = ParamParse.parametria.autojoin ? encodeURIComponent(ParamParse.parametria.autojoin) : this.autojoin;
    if (ParamParse.parametria.embedded) {
      this.connect();
    }
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
