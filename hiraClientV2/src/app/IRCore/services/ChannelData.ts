import { User } from '../dto/User';

export class ChannelData {
  name: string;
  topic: string;
  users: User[] = [];
  messages: GenericMessage[] = [];
}

export class GenericMessage {
  message: string;
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
}
