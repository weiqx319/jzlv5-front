import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {CreativeSectionComponent} from "./creative-section.component";


describe('CreativeSectionComponent', () => {
  let component: CreativeSectionComponent;
  let fixture: ComponentFixture<CreativeSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreativeSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreativeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
