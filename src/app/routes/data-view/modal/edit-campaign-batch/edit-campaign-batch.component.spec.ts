import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditCampaignBatchComponent } from './edit-campaign-batch.component';

describe('EditCampaignBatchComponent', () => {
  let component: EditCampaignBatchComponent;
  let fixture: ComponentFixture<EditCampaignBatchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCampaignBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCampaignBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
