import { EventEmitter } from '@angular/core';
import { Quit } from './../dto/Quit';

export class QuitHandler {
  public static readonly quitResponse: EventEmitter<Quit> = new EventEmitter<Quit>();

  public static onQuit(quit: Quit) {
    this.quitResponse.emit(quit);
  }
}
