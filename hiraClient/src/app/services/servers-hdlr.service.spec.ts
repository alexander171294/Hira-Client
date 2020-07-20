import { TestBed } from '@angular/core/testing';

import { ServersHdlrService } from './servers-hdlr.service';

describe('ServersHdlrService', () => {
  let service: ServersHdlrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServersHdlrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
