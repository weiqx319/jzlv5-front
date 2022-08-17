import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCampaignTemplateComponent } from './add-campaign-template.component';

describe('AddCampaignTemplateComponent', () => {
  let component: AddCampaignTemplateComponent;
  let fixture: ComponentFixture<AddCampaignTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCampaignTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCampaignTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
