import { Injectable } from '@angular/core';
import { IRCMessageDTO, IRCParser } from '../utils/IRCParser';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor() { }

  public addLog(target: string, message: IRCMessageDTO) {
    let logs = JSON.parse(localStorage.getItem(target));
    delete message.message;
    if (!message.date) {
      message.date = IRCParser.getDateStr();
      message.time = IRCParser.getTime();
    }
    if (logs) {
      logs.push(message);
    } else {
      logs = [message];
    }
    localStorage.setItem(target, JSON.stringify(logs));
  }

  public getLogs(target: string): IRCMessageDTO[] {
    return null;
  }
}
