import { TestBed } from '@angular/core/testing';

import { IRCProtoService } from './message-handler.service';

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
