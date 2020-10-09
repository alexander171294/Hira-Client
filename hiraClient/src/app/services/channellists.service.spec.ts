import { TestBed } from '@angular/core/testing';

import { ChannellistsService } from './channellists.service';

describe('ChannellistsService', () => {
  let service: ChannellistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannellistsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
