import { Injectable } from '@angular/core';
import { IRCMessageDTO, IRCParser, MessageTypes } from '../utils/IRCParser';
import { environment } from 'src/environments/environment';

declare var electronApi;

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor() { }

  public static getLogs(target: string): IRCMessageDTO[] {
    return JSON.parse(localStorage.getItem(target));
  }

  public static clearLogs(target: string) {
    localStorage.removeItem(target);
  }

  public addLog(target: string, message: IRCMessageDTO) {
    let logs = JSON.parse(localStorage.getItem(target));
    if (!message.date) {
      message.date = IRCParser.getDateStr();
      message.time = IRCParser.getTime();
    }
    if (logs) {
      logs.push(message);
    } else {
      logs = [message];
    }
    if (logs.length > environment.maxLogs) {
      logs = logs.slice(environment.maxLogs * -1);
    }
    localStorage.setItem(target, JSON.stringify(logs));
    if (environment.electron && !localStorage.getItem('ignoreLogs')) {
      let messageTXT;
      const author = message.privateAuthor ? message.privateAuthor :  message.author;
      if (message.meAction) {
        messageTXT = message.date + ' ' + message.time + ' **' + author + ' ' + message.message + '\n';
      } else {
        messageTXT = message.date + ' ' + message.time + ' [' + author + '] ' + message.message + '\n';
      }
      // write to disk:
      electronApi.log({
        target,
        message: messageTXT
      });
    }
  }

}
