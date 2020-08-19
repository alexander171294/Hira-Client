import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ServerData } from 'src/app/utils/ServerData';
import { ParamParse } from 'src/app/utils/ParamParse';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

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
  public isAddingOrEdit: boolean;
  public name: string;
  public servers: ServerData[];
  public serverSelected: ServerData;
  public editID: string;
  public websocket: boolean;
  public loginMode = 'ANON';
  public password: string;
  public usuario: string;

  @Input() isConnected: boolean;
  @Input() connectionError: boolean;

  @Output() connected: EventEmitter<ServerData> = new EventEmitter<ServerData>();
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    this.server = 'kappa.hira.li:6667';
    this.servers = JSON.parse(localStorage.getItem('serverList'));
    if (!this.servers) {
      this.servers = [];
    }
    if (!environment.production) {
      this.apodo = 'Zetta007';
      this.apodoSecundario = 'harkonidaz_tst02';
      this.autojoin = '#harkolandia';
    }
    this.server = ParamParse.parametria.server ? encodeURIComponent(ParamParse.parametria.server) : this.server;
    this.apodo = ParamParse.parametria.apodo ? encodeURIComponent(ParamParse.parametria.apodo) : this.apodo;
    this.usuario = this.apodo;
    if (localStorage.getItem('server')) {
      this.server = localStorage.getItem('server');
      this.apodo = localStorage.getItem('apodo');
      this.usuario = localStorage.getItem('usuario');
      this.apodoSecundario = localStorage.getItem('apodoSecundario');
      this.autojoin = localStorage.getItem('autojoin');
      this.websocket = localStorage.getItem('isWS') === 'YES';
    }
    if (!this.apodoSecundario && this.apodo) {
      this.apodoSecundario = this.apodo + '0';
    }
    this.apodoSecundario = ParamParse.parametria.apodoSecundario ? encodeURIComponent(ParamParse.parametria.apodoSecundario) : this.apodoSecundario;
    this.autojoin = ParamParse.parametria.autojoin ? this.parseAutojoin(encodeURIComponent(ParamParse.parametria.autojoin)) : this.autojoin;
    if (ParamParse.parametria.embedded) {
      this.connect();
    }
  }

  parseAutojoin(autojoin: string): string {
    let out = '';
    autojoin.split(',').forEach((aj, idx) => {
      if (idx > 0) {
        out += ',';
      }
      out += '#' + aj;
    });
    return out;
  }

  connect() {
    const sd = new ServerData();
    sd.id = uuidv4();
    sd.name = this.name;
    sd.apodo = this.apodo;
    sd.username = this.usuario;
    sd.apodoSecundario = this.apodoSecundario;
    sd.autojoin = this.autojoin;
    sd.server = this.server;
    sd.isWS = this.websocket;
    sd.autoConnect = this.loginMode;
    sd.password = this.password;
    this.saveServer(sd);
    this.connected.emit(sd);
    this.isConnected = true;
    if (environment.electron) {
      localStorage.setItem('server', this.server);
      localStorage.setItem('apodo', this.apodo);
      localStorage.setItem('apodoSecundario', this.apodoSecundario);
      localStorage.setItem('autojoin', this.autojoin);
      localStorage.setItem('isWS', this.websocket ? 'YES' : 'NO');
    }
  }

  save() {
    const sd = new ServerData();
    sd.id = uuidv4();
    sd.name = this.name;
    sd.apodo = this.apodo;
    sd.username = this.usuario;
    sd.apodoSecundario = this.apodoSecundario;
    sd.autojoin = this.autojoin;
    sd.server = this.server;
    sd.autoConnect = this.loginMode;
    sd.password = this.password;
    sd.isWS = this.websocket;
    this.saveServer(sd);
    this.isAddingOrEdit = false;
  }

  private saveServer(sd: ServerData) {
    if (this.editID) {
      this.servers.forEach(sdE => {
        if (sdE.id === this.editID) {
          sdE.name = sd.name;
          sdE.apodo = sd.apodo;
          sdE.username = sd.username;
          sdE.apodoSecundario = sd.apodoSecundario;
          sdE.autojoin = this.autojoin;
          sdE.server = this.server;
          sdE.isWS = this.websocket;
          sdE.autoConnect = this.loginMode;
          sdE.password = this.password;
        }
      });
      this.editID = undefined;
    } else {
      this.servers.push(sd);
    }
    localStorage.setItem('serverList', JSON.stringify(this.servers));
  }

  deleteServer(sd: ServerData) {
    if (confirm('Está seguro de borrar el servidor?')) {
      const idx = this.servers.findIndex(server => {
        return server.id === sd.id;
      });
      this.servers.splice(idx, 1);
      localStorage.setItem('serverList', JSON.stringify(this.servers));
    }
  }

  editServer(sd: ServerData) {
    this.name = sd.name;
    this.apodo = sd.apodo;
    this.apodoSecundario = sd.apodoSecundario;
    this.autojoin = sd.autojoin;
    this.server = sd.server;
    this.isAddingOrEdit = true;
    this.editID = sd.id;
    this.websocket = sd.isWS;
    this.password = sd.password;
    this.loginMode = sd.autoConnect;
    this.usuario = sd.username;
  }

  addServer() {
    this.isAddingOrEdit = true;
  }

  selectNetwork(serverU: ServerData) {
    console.log(serverU);
    this.serverSelected = serverU;
  }

  connectByList() {
    if (this.serverSelected) {
      this.connected.emit(this.serverSelected);
      this.isConnected = true;
    }
  }

  kp(event) {
    if (event.keyCode === 13) {
      this.connect();
    }
  }
}
