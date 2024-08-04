/*
 * Copyright 2024 Cortex Applications, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { CortexApi } from '../../api/CortexApi';
import React from 'react';
import { JobsResponse, JobStatus } from '../../api/types';
import moment from 'moment';
import { renderWrapped } from '../../utils/TestUtils';
import { SyncJobsTable } from './SyncJobsTable';

describe('SyncJobsTable', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2024, 4, 7, 14, 24, 33));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render timestamps correctly', async () => {
    const cortexApi: Partial<CortexApi> = {
      getSyncJobs(): Promise<JobsResponse> {
        return Promise.resolve({
          jobs: [
            {
              id: 'backstage-sync-12345',
              status: JobStatus.Done,
              dateCreated: moment.utc().toISOString(),
            },
            {
              id: 'backstage-sync-abcd',
              status: JobStatus.TimedOut,
              dateCreated: moment.utc().subtract(1, 'days').toISOString(),
            },
          ],
        });
      },
    };

    const { checkForText } = renderWrapped(<SyncJobsTable />, cortexApi);

    await checkForText('May 7th 2024, 2:24:33 pm');
    await checkForText('May 6th 2024, 2:24:33 pm');
  });
});
