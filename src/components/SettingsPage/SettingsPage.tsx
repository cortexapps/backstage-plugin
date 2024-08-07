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
import { Grid } from '@material-ui/core';
import React from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { SyncCard } from './SyncCard';
import { SyncJobsTable } from './SyncJobsTable';

export const SettingsPage = () => {
  return (
    <Content>
      <ContentHeader title="Settings" />
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <SyncCard />
        </Grid>
        <Grid item lg={8}>
          <SyncJobsTable />
        </Grid>
      </Grid>
    </Content>
  );
};
