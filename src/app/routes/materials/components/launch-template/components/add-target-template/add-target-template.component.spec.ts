import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {AddTargetTemplateComponent} from "./add-target-template.component";


describe('AddTargetTemplateComponent', () => {
  let component: AddTargetTemplateComponent;
  let fixture: ComponentFixture<AddTargetTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTargetTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTargetTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
