import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QueryRankingComponent } from './query-ranking.component';

describe('QueryRankingComponent', () => {
  let component: QueryRankingComponent;
  let fixture: ComponentFixture<QueryRankingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryRankingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
