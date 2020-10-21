import { Part } from './../dto/Part';
import { EventEmitter } from '@angular/core';

export class PartHandler {
  public static readonly partResponse: EventEmitter<Part> = new EventEmitter<Part>();

  public static onPart(part: Part) {
    this.partResponse.emit(part);
  }
}
