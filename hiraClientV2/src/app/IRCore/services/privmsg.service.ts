import { EventEmitter, Injectable } from '@angular/core';
import { IndividualMessage, IndividualMessageTypes } from '../dto/IndividualMessage';
import { MessageHandler, OnMessageReceived } from '../handlers/Message.handler';
import { PostProcessor } from '../utils/PostProcessor';
import { GenericMessage, Author } from './ChannelData';
import { PrivmsgData } from './PrivmsgData';
import { UserInfoService } from './user-info.service';

@Injectable({
  providedIn: 'root'
})
export class PrivmsgService implements OnMessageReceived {

  public readonly messagesReceived: EventEmitter<GenericMessage> = new EventEmitter<GenericMessage>();
  public readonly newPrivOpened: EventEmitter<string> = new EventEmitter<string>();
  public readonly closedPriv: EventEmitter<string> = new EventEmitter<string>();
  public privMsgs: { [key: string]: PrivmsgData } = {};

  constructor(private userSrv: UserInfoService) {
    MessageHandler.setHandler(this);
  }

  onMessageReceived(message: IndividualMessage) {
    if(message.messageType == IndividualMessageTypes.PRIVMSG) {
      const msg: GenericMessage = {
        message: (message.message as string),
        messageWithMetadata:  PostProcessor.processMessage(message.message as string, message.author, this.userSrv.getNick()),
        author: new Author<string>(message.author),
        date: message.date + ' ' + message.time,
        special: message.meAction,
        target: message.channel
      };
      if(this.privMsgs[message.author]) {
        this.privMsgs[message.author].messages.push(msg);
      } else {
        this.newPrivOpened.emit(message.author);
        this.privMsgs[message.author] = new PrivmsgData();
        this.privMsgs[message.author].user = message.author;
      }
      this.messagesReceived.emit(msg);
    }
  }

  getPrivate(nick: string): PrivmsgData {
    if(!this.messagesReceived[nick]) {
      this.newPrivOpened.emit(nick);
      this.privMsgs[nick] = new PrivmsgData();
      this.privMsgs[nick].user = nick;
    }
    return this.messagesReceived[nick];
  }

  closePrivate(nick: string) {
    delete this.privMsgs[nick];
    this.closedPriv.emit(nick);
  }

}
