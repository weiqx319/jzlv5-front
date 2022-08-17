import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditCampaignSingleComponent } from './edit-campaign-single.component';

describe('EditCampaignSingleComponent', () => {
  let component: EditCampaignSingleComponent;
  let fixture: ComponentFixture<EditCampaignSingleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCampaignSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCampaignSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
