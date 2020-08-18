import { v4 as uuidv4 } from 'uuid';

export class ServerData {
  public id: string = ServerData.getRandomID();
  public name: string;
  public apodo: string;
  public apodoSecundario: string;
  public username: string;
  public method: string;
  public server: string;
  public created: string;
  public password: string;
  public autoConnect: ConnectionMethods | string;
  public connected: boolean;
  public submsg: string;
  public autojoin: string;
  public isWS: boolean;

  public static getRandomID(): string {
    return uuidv4();
  }
}

export enum ConnectionMethods {
  ANON = 'ANON',
  LP = 'LP',
  PASS = 'PASS'
}
