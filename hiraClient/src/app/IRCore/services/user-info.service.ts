import { Injectable } from '@angular/core';
import { NickChange } from '../dto/NickChange';
import { OnNickChanged, StatusHandler } from '../handlers/Status.handler';

/**
 * Servicio para gestionar mi información
 */
@Injectable({
  providedIn: 'root'
})
export class UserInfoService implements OnNickChanged {

  private actualNick: string;

  constructor() {
    StatusHandler.setHandlerNickChanged(this);
  }

  public getNick(): string {
    return this.actualNick;
  }

  public setNick(nick: string) {
    this.actualNick = nick;
  }

  onNickChanged(nick: NickChange) {
    if (nick.oldNick === this.actualNick) {
      this.actualNick = nick.newNick;
    }
  }
}
