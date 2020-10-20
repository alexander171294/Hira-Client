import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GmodeComponent } from './gmode.component';

describe('GmodeComponent', () => {
  let component: GmodeComponent;
  let fixture: ComponentFixture<GmodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GmodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GmodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
