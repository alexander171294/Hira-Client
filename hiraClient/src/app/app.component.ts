import { ConnectionStatus, ConnectionStatusData, WebSocketUtil } from './IRCore/utils/WebSocket.util';
import { ConnectionMethods, ServerData } from 'src/app/utils/ServerData';
import { IRCoreService } from './IRCore/IRCore.service';
import { Component, OnInit } from '@angular/core';
import { ParamParse } from './utils/ParamParse';
import { environment } from 'src/environments/environment';
import { MotdHandler } from './IRCore/handlers/Motd.handler';
import { CBoxChatTypes } from './components/chat-box/chat-box.component';
import { ChatData } from './components/chat-list/chat-list.component';

declare var electronApi: any;
declare var GLB_electronConfig: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public embd: boolean;
  public connectPopup = true;
  public isConnected: boolean;
  public connectionError: string;
  public channelListPopup: boolean;
  public advertenciaBanneado: boolean;
  public advertenciaKickeado: boolean;
  public canalKickeado: string;
  public cambiarNickPopup: boolean;
  public nuevoNick: string;
  public whoDataOf: string;
  public gmodeOf: string;
  public electronCFG: boolean;

  private server: ServerData;

  public inServerChat = true;
  public messages: any;
  public chatName: string = 'SERVER';
  public chatType = CBoxChatTypes.SERVER;

  constructor(private irCoreSrv: IRCoreService) {
    WebSocketUtil.statusChanged.subscribe((status: ConnectionStatusData<any>) => {
        if (status.status === ConnectionStatus.CONNECTED) {
          this.onConnect();
        }
        if (status.status === ConnectionStatus.DISCONNECTED) {
          this.onDisconnect();
        }
        if (status.status === ConnectionStatus.ERROR) {
          this.onDisconnect();
        }
    });
    MotdHandler.requirePasswordResponse.subscribe(d => {
      this.onRequiredPassword();
    });
  }

  ngOnInit(): void {
    ParamParse.parseHash(window.location.hash.slice(1));
    this.embd = ParamParse.parametria.embedded ? true : false;
    if (environment.electron) {
      const script = document.createElement('script');
      script.setAttribute('src', 'assets/electron.js');
      document.body.append(script);
    }
    // console.log(ParamParse.parametria.skin);
    if (ParamParse.parametria.skin) {
      if (environment.skins[ParamParse.parametria.skin]) {
        document.body.classList.add(environment.skins[ParamParse.parametria.skin]);
      }
    } else if (localStorage.getItem('ThemeForzed')) {
      document.body.classList.add(environment.skins[localStorage.getItem('ThemeForzed')]);
    }
  }

  connect(serverData: ServerData) {
    if (serverData.isWS) {
      this.irCoreSrv.connect('wss://' + serverData.server);
    } else {
      this.irCoreSrv.connect(environment.gateway);
    }
    this.server = serverData;
    this.connectPopup = false;
  }

  private onConnect() {
    this.isConnected = true;
    if (!this.server.isWS) {
      // enviar datos de conexión del gateway
      const uname = this.server.username ? this.server.username : this.server.apodo;
      let hostGW;
      if (!this.server.isWS) {
        hostGW = this.server.server;
      }
      this.irCoreSrv.handshake(uname, this.server.apodo, hostGW);
    }
  }

  private onRequiredPassword() {
    if (this.server.autoConnect === ConnectionMethods.PASS) {
      this.irCoreSrv.serverPass(this.server.username, this.server.password, this.server.apodo);
    } else {
      // TODO: popup de aviso que se requiere login
    }
  }

  private onDisconnect() {
    this.connectPopup = true;
    this.connectionError = 'Ocurrió un error de conexión';
  }

  closeChlList(evt) {

  }

  kpChgNick(evt) {

  }

  changeNickConfirmar() {

  }

  closeGmode(evt) {

  }

  changeChat(cdata: ChatData) {
    if (cdata.privateChat) {

    } else {

    }
  }
}
