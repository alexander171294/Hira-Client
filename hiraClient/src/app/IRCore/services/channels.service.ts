import { Injectable } from '@angular/core';
import { ChannelData } from './ChannelData';

/**
 * Servicio para gestionar canales y sus usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelsService {

  private channels: ChannelData[];

  constructor() {

  }
}
