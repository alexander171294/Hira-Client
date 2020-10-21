import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronCFGComponent } from './electron-cfg.component';

describe('ElectronCFGComponent', () => {
  let component: ElectronCFGComponent;
  let fixture: ComponentFixture<ElectronCFGComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectronCFGComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectronCFGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
