import { TestBed } from '@angular/core/testing';

import { HistoryMessageCursorService } from './history-message-cursor.service';

describe('HistoryMessageCursorService', () => {
  let service: HistoryMessageCursorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoryMessageCursorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
