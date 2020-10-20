import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannellistsService {

  private channels: {name: string, description: string}[] = [];
  public onCleared: EventEmitter<void> = new EventEmitter<void>();
  public whoisResponse: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  public clearChannel() {
    this.channels = [];
    this.onCleared.emit();
  }

  public addChannel(channel: {name: string, description: string}) {
    this.channels.push(channel);
  }

  public getChannelList() {
    return this.channels;
  }

  public whoisData(user: string) {
    this.whoisResponse.emit(user);
  }
}
