import { EventEmitter } from '@angular/core';
import { Join } from './../dto/Join';

export class JoinHandler {
  public static readonly joinResponse: EventEmitter<Join> = new EventEmitter<Join>();

  public static onJoin(join: Join) {
    this.joinResponse.emit(join);
  }
}
