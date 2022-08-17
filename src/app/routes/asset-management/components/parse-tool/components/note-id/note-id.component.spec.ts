import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteIdComponent } from './note-id.component';

describe('NoteIdComponent', () => {
  let component: NoteIdComponent;
  let fixture: ComponentFixture<NoteIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
