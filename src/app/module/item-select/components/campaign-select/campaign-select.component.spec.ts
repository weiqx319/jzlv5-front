import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CampaignSelectComponent } from './campaign-select.component';

describe('CampaignSelectComponent', () => {
  let component: CampaignSelectComponent;
  let fixture: ComponentFixture<CampaignSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
