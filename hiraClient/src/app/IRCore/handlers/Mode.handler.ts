import { EventEmitter } from '@angular/core';
import { NewMode } from '../dto/NewMode';

/**
 * Clase para gestionar los cambios de modos en un canal (sobre un usuario)
 */

export class ModeHandler {

  public static readonly modeChange: EventEmitter<NewMode> = new EventEmitter<NewMode>();

  public static modeParser(rawMessage: string): string[] {
    return /(\+|\-)?([a-zA-Z]+)\s(.*)/.exec(rawMessage);
  }

  public static changeMode(mode: NewMode) {
    this.modeChange.emit(mode);
  }

}
