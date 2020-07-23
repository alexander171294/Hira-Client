import { TestBed } from '@angular/core/testing';

import { VcardGetterService } from './vcard-getter.service';

describe('VcardGetterService', () => {
  let service: VcardGetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VcardGetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
