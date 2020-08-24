import { UserWithMetadata, PostProcessor } from './../utils/PostProcessor';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserStatusService {

  private ul: UsersList = {};
  private cr: CustomRangos = {};

  constructor(private httpC: HttpClient) { }

  public updateUser(user: UserWithMetadata) {
    if (this.ul[user.nick]) {
      this.ul[user.nick].away = user.away;
      this.ul[user.nick].status = user.status;
      this.ul[user.nick].isNetOp = user.isNetOp;
    } else {
      this.ul[user.nick] = user;
    }
  }

  public processAndUpdateUsers(users: string[]): UserWithMetadata[] {
    const out: UserWithMetadata[] = [];
    users.forEach(user => {
      const userMD = PostProcessor.processUserMetadata(user);
      this.updateUser(userMD);
      out.push(userMD);
    });
    return out;
  }

  public getUser(user: string): UserWithMetadata {
    if (this.ul[user]) {
      return this.ul[user];
    } else {
      const udata = new UserWithMetadata();
      udata.nick = user;
      return udata;
    }
  }

  public getUserCR(user: string, channelName: string): CustomR {
    if (!this.cr[channelName]) {
      this.cr[channelName] = {};
    }
    if (this.cr[channelName][user]) {
      return this.cr[channelName][user];
    } else {
      this.cr[channelName][user] = new CustomR();
      return this.cr[channelName][user];
    }
  }

  public getFromBECR(user: string, channelName: string) {
    // get custom range from backend.
    this.httpC.get(environment.toolService + 'customr?usr=' + encodeURIComponent(user) + '&chn=' + encodeURIComponent(channelName))
    .subscribe((r: CustomR) => {
      this.cr[channelName][user].exists = r.exists;
      this.cr[channelName][user].color = r.color;
      this.cr[channelName][user].rango = r.rango;
    });
  }

  refreshCR(user: string, channel: string) {
    if (!this.cr[channel]) {
      this.cr[channel] = {};
    }
    if (!this.cr[channel][user]) {
      this.cr[channel][user] = new CustomR();
    }
    console.log('REFRESH CR');
    this.getFromBECR(user, channel);
  }

}


export class UsersList {
  [key: string]: UserWithMetadata;
}

export class CustomRangos {
  [key: string]: CustomRangosChannel;
}

export class CustomRangosChannel {
  [key: string]: CustomR
}

export class CustomR {
  exists: boolean;
  rango: string;
  color: string;
}
