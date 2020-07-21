export class PostProcessor {

  public static processMessage(message: string): MessageWithMetadata {
    const mwm = new MessageWithMetadata();
    const youtubeLink = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?/.exec(message);
    if (youtubeLink) {
      message = message.replace(youtubeLink[0], '');
      mwm.youtube = youtubeLink[5];
    }
    const imageLink = /(http(s?):)([\/|.|\w|\s|-])*\.(?:jpg|gif|png)/.exec(message);
    if (imageLink) {
      message = message.replace(imageLink[0], '');
      mwm.image = imageLink[0];
    }
    mwm.message = message;
    return mwm;
  }

  public static processUserMetadata(user: string): UserWithMetadata {
    const mod = user[0];
    if (mod === '~' ||
        mod === '&' ||
        mod === '@' ||
        mod === '%' ||
        mod === '+') {
      user = user.slice(1);
    }
    const out = new UserWithMetadata();
    out.nick = user;
    if (mod === '~') {
      out.status = UserStatuses.FOUNDER;
    } else if (mod === '&') {
      out.status = UserStatuses.NET_OPERATOR;
    } else if (mod === '@') {
      out.status = UserStatuses.OPERATOR;
    } else if (mod === '%') {
      out.status = UserStatuses.HALF_OPERATOR;
    } else if (mod === '+') {
      out.status = UserStatuses.VOICE;
    }
    return out;
  }

}


export class UserWithMetadata {
  public nick: string;
  public status: UserStatuses;
}

export class MessageWithMetadata {
  public message: string;
  public youtube?: string;
  public image?: string;
}

export enum UserStatuses {
  FOUNDER = 'FOUNDER',
  NET_OPERATOR = 'NET_OPERATOR',
  OPERATOR = 'OPERATOR',
  HALF_OPERATOR = 'HALF_OPERATOR',
  VOICE = 'VOICE',
}
