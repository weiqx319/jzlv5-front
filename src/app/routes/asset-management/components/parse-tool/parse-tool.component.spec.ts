import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParseToolComponent } from './parse-tool.component';

describe('ParseToolComponent', () => {
  let component: ParseToolComponent;
  let fixture: ComponentFixture<ParseToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParseToolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParseToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
