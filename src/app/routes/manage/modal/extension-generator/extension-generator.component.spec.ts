import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExtensionGeneratorComponent } from './extension-generator.component';

describe('ExtensionGeneratorComponent', () => {
  let component: ExtensionGeneratorComponent;
  let fixture: ComponentFixture<ExtensionGeneratorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtensionGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
