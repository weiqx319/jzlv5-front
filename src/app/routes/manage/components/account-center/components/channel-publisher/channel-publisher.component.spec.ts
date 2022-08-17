import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelPublisherComponent } from './channel-publisher.component';

describe('ChannelPublisherComponent', () => {
  let component: ChannelPublisherComponent;
  let fixture: ComponentFixture<ChannelPublisherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChannelPublisherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelPublisherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
