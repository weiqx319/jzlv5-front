import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {CampaignSectionComponent} from "./campaign-section.component";


describe('CampaignSectionComponent', () => {
  let component: CampaignSectionComponent;
  let fixture: ComponentFixture<CampaignSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
