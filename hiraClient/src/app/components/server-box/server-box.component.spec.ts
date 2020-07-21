import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerBoxComponent } from './server-box.component';

describe('ServerBoxComponent', () => {
  let component: ServerBoxComponent;
  let fixture: ComponentFixture<ServerBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
