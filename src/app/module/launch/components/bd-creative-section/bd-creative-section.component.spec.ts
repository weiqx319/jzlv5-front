import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {BdCreativeSectionComponent} from "./bd-creative-section.component";


describe('BdBdCreativeSectionComponent', () => {
  let component: BdCreativeSectionComponent;
  let fixture: ComponentFixture<BdCreativeSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BdCreativeSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BdCreativeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
