/* tslint:disable:no-unused-variable */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { TaskLogService } from './task-log.service';

describe('Service: TaskLog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskLogService]
    });
  });

  it('should ...', inject([TaskLogService], (service: TaskLogService) => {
    expect(service).toBeTruthy();
  }));
});
