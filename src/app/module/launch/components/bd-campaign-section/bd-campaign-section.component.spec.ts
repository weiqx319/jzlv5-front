import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {BdCampaignSectionComponent} from "./bd-campaign-section.component";


describe('BdCampaignSectionComponent', () => {
  let component: BdCampaignSectionComponent;
  let fixture: ComponentFixture<BdCampaignSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BdCampaignSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BdCampaignSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
