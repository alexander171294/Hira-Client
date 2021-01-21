import { MessageWithMetadata } from './../utils/PostProcessor';
import { environment } from 'src/environments/environment';
import { User } from '../dto/User';

export class ChannelData {
  name: string;
  topic: string;
  users: User[] = [];
  messages: GenericMessage[] = [];
}

export class GenericMessage {
  message: string;
  messageWithMetadata?: MessageWithMetadata;
  author: Author<User | string>;
  date: string;
  special: boolean; // for actions "me"
  quote: Quote;
}

export class Quote {
  author: string | User;
  quote: string;
}

export class Author<t> {
  user: t;
  image: string;

  constructor(user: t) {
    if(typeof user == 'string') {
      this.image = environment.hiranaTools + '/avatar?usr=' + user;
    } else {
      // typeof User
      this.image = environment.hiranaTools + '/avatar?usr=' + (user as any).nick;
    }
    this.user = user;
  }
}
