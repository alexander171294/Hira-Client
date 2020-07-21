export class RichLayer {
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

export enum UserStatuses {
  FOUNDER = 'FOUNDER',
  NET_OPERATOR = 'NET_OPERATOR',
  OPERATOR = 'OPERATOR',
  HALF_OPERATOR = 'HALF_OPERATOR',
  VOICE = 'VOICE',
}
