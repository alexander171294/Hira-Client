import { UserWithMetadata, PostProcessor } from './../utils/PostProcessor';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserStatusService {

  private ul: UsersList = {};

  constructor() { }

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

}


export class UsersList {
  [key: string]: UserWithMetadata;
}
