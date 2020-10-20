export class WhoData {
  public connectedFrom?: string;
  public server?: string;
  public isGOP: boolean = false;
  public modes: string;
  public userAccount: string;
  public isSecured: boolean = false;
  public idle: number;
  public lastLogin: number;
  public channelList: string[];

  public static appendTo(list: WhoDatas, user: string, param: string, value: any) {
    if (!list[user]) {
      list[user] = new WhoData();
    }
    list[user][param] = value;
  }

  public getLastLogin(): string {
    const date = new Date(this.lastLogin * 1000);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
  }

  public getIdle(): string {
    let out = '';
    let idle = this.idle;
    if (idle >= 60) {
      out = (this.idle % 60) + 's';
      idle = Math.floor(idle / 60);
    } else {
      return this.idle + 's';
    }
    if (idle >= 60) {
      out = (this.idle % 60) + 'm ' + out;
      idle = Math.floor(idle / 60);
    } else {
      return idle + 'm ' + out;
    }
    if (idle >= 24) {
      out = (this.idle % 24) + 'h ' + out;
      idle = Math.floor(idle / 24);
    } else {
      return idle + 'h ' + out;
    }
    return idle + 'd ' + out;
  }

  public getChannelParsed(): any[] {
    const out = [];
    if (!this.channelList) {
      return [];
    }
    this.channelList.forEach(channel => {
      if (channel[0] === '~') {
        out.push({
          channel: channel.substr(1),
          range: 'Founder'
        });
      } else if (channel[0] === '&') {
        out.push({
          channel: channel.substr(1),
          range: 'Admin'
        });
      } else if (channel[0] === '@') {
        out.push({
          channel: channel.substr(1),
          range: 'Operator'
        });
      } else if (channel[0] === '%') {
        out.push({
          channel: channel.substr(1),
          range: 'Halfoperator'
        });
      } else if (channel[0] === '+') {
        out.push({
          channel: channel.substr(1),
          range: 'Voice'
        });
      } else {
        out.push({
          channel,
          range: ''
        });
      }
    });

    return out;
  }
}

export class WhoDatas {
  [key: string]: WhoData;
}
