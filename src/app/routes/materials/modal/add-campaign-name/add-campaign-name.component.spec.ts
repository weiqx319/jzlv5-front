import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCampaignNameComponent } from './add-campaign-name.component';

describe('AddCampaignNameComponent', () => {
  let component: AddCampaignNameComponent;
  let fixture: ComponentFixture<AddCampaignNameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCampaignNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCampaignNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
