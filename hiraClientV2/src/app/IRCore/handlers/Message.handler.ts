import { IndividualMessage } from './../dto/IndividualMessage';
import { IRCMessage } from '../utils/IRCMessage.util';
import { EventEmitter } from '@angular/core';

/**
 * Clase para manejar la recepción de mensajes privados y de canal.
 */

export class MessageHandler {

  public static readonly messageResponse: EventEmitter<IndividualMessage> = new EventEmitter<IndividualMessage>();

  public static onMessage(message: IndividualMessage) {
    this.messageResponse.emit(message);
  }

  public static getMeAction(parsedMessage: IRCMessage): string[] {
    return /\x01ACTION ([^\x01]+)\x01/.exec(parsedMessage.message);
  }

  public static setHandler(hdlr: OnMessageReceived) {
    this.messageResponse.subscribe(message => {
      hdlr.onMessageReceived(message);
    });
  }

}

export interface OnMessageReceived {
  onMessageReceived(message: IndividualMessage);
}
