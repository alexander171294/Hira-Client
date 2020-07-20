import { TestBed } from '@angular/core/testing';

import { IRCProtoService } from './ircproto.service';

describe('IRCProtoService', () => {
  let service: IRCProtoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IRCProtoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
