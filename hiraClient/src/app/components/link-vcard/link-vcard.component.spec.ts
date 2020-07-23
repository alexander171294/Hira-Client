import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkVcardComponent } from './link-vcard.component';

describe('LinkVcardComponent', () => {
  let component: LinkVcardComponent;
  let fixture: ComponentFixture<LinkVcardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkVcardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkVcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
