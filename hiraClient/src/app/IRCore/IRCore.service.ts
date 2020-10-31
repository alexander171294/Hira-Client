import { MessageData, WebSocketUtil } from './utils/WebSocket.util';
import { Injectable } from '@angular/core';
import { IRCParserV2 } from './IRCParserV2';
import { UserInfoService } from './services/user-info.service';

declare var stopEff;

@Injectable({
  providedIn: 'root'
})
export class IRCoreService {

  public static clientName = 'IRCoreV2';

  private webSocket: WebSocketUtil;

  constructor(private userSrv: UserInfoService) {
    WebSocketUtil.messageReceived.subscribe((message: MessageData) => {
      if (message.message.indexOf('PING') === 0) {
        const pingResp = message.message.slice(5);
        this.sendRaw('PONG ' + pingResp);
        return;
      }
      if (message.message.indexOf('ERROR') === 0) {
        console.error('Received error from stream: ', message.message);
        return;
      }
      IRCParserV2.parseMessage(message.message).forEach(msg => {
        IRCParserV2.processMessage(msg, message.message, this.userSrv.getNick());
      });
    });
  }

  public connect(url: string) {
    this.webSocket = new WebSocketUtil();
    this.webSocket.connect(url, 'WSocket');
  }

  public handshake(username: string, apodo: string, gatwayHost?: string) {
    this.sendRaw('ENCODING UTF-8');
    if (gatwayHost) {
      this.sendRaw('HOST ' + gatwayHost);
    }
    this.sendRaw('USER ' + username + ' * * :' + IRCoreService.clientName);
    this.setNick(apodo);
  }

  public identify(password: string) {
    this.sendRaw('PRIVMSG NickServ identify ' + password);
  }

  public serverPass(user: string, password: string, apodo: string) {
    this.sendRaw('PASS ' + user + ':' + password);
  }

  public setNick(nick: string) {
    this.sendRaw('NICK ' + nick);
    this.userSrv.setNick(nick);
  }

  public disconnect(): void {
    this.webSocket.disconnect();
  }

  public sendRaw(rawMessage: string) {
    this.webSocket.send(rawMessage);
  }

  public sendMessageOrCommand(command: string, target?: string) {
    if (command[0] === '/') {
      let cmd = command.slice(1);
      const verb = cmd.split(' ')[0].toLowerCase();
      if (verb === 'query') {
        cmd = cmd.slice(5).trim();
        // TODO: query a cmd
      }
      if (verb === 'join') {
        // enviar cmd esto es un join
        this.sendRaw(cmd);
        return;
      }
      if (verb === 'umode') {
        // enviar cmd esto es un join
        cmd = cmd.replace('umode', 'mode ' + this.userSrv.getNick());
      }
      if (verb === 'stop') {
        // enviar cmd esto es un join
        stopEff();
        return;
      }
      if (verb === 'me') {
        cmd = cmd.slice(2).trim();
        this.sendRaw('PRIVMSG ' + target + ' :' + String.fromCharCode(1) + 'ACTION ' + cmd + String.fromCharCode(1));
        // TODO: registrar mensaje.
        return;
      }
      if (verb === 'cs') {
        // chanserv?
        cmd = cmd.replace('cs', 'PRIVMSG ChanServ :');
      }
      if (verb === 'hc') {
        // chanserv?
        cmd = cmd.replace('hc', 'PRIVMSG HiraClient :');
      }
      if (verb === 'ns') {
        // nickserv?
        cmd = cmd.replace('ns', 'PRIVMSG NickServ :');
      }
      if (verb === 'msg') {
        cmd = cmd.replace('msg', 'PRIVMSG');
      }
      if (verb === 'leave') {
        cmd = cmd.replace('leave', 'PART');
      }
      if (verb === 'away') {
        if (cmd.length === 4) {
          const now = new Date();
          cmd += ' AFK desde ' + now.getDay() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear() + ' ' +
                  now.getHours() + ':' + now.getMinutes();
        }
      }
      if (verb === 'back') {
        cmd = cmd.replace('back', 'away');
      }
      this.sendRaw(cmd);
    } else {
      this.sendRaw('PRIVMSG ' + target + ' :' + command);
      // TODO: registrar mensaje
    }
  }
}