import { TestBed } from '@angular/core/testing';

import { IRCProtocolService } from './ircprotocol.service';

describe('IRCProtocolService', () => {
  let service: IRCProtocolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IRCProtocolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
