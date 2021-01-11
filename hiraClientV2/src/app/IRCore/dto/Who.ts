import { UModes } from './../utils/UModes.utils';

export class Who {
  serverFrom: string;
  nick: string;
  isAway: boolean;
  isNetOp: boolean;
  rawMsg: string;
  mode: UModes;
}
