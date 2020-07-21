import { TestBed } from '@angular/core/testing';

import { MessagePoolService } from './message-pool.service';

describe('MessagePoolService', () => {
  let service: MessagePoolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessagePoolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
