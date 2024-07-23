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
import React, { useMemo } from 'react';
import {
  Progress,
  Table,
  TableColumn,
  WarningPanel,
} from '@backstage/core-components';
import { useCortexApi } from '../../utils/hooks';
import { JobStatus } from '../../api/types';
import {
  AccessTimeOutlined,
  CancelOutlined,
  CheckCircleOutline,
  SmsFailedOutlined,
  TimelapseOutlined,
} from '@material-ui/icons';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import { Tooltip } from '@material-ui/core';
import { isNil } from 'lodash';

interface SyncJobRow {
  status: JobStatus;
  timestamp: string;
}

const statusLogo = (status: JobStatus) => {
  switch (status) {
    case JobStatus.Done:
      return <CheckCircleOutline color="primary" />;
    case JobStatus.Cancelled:
      return <CancelOutlined color="error" />;
    case JobStatus.TimedOut:
      return <AccessTimeOutlined color="error" />;
    case JobStatus.Failure:
      return <SmsFailedOutlined color="error" />;
    case JobStatus.InProgress:
      return <TimelapseOutlined color="action" />;
  }
};

const formatStatus = (status: JobStatus) => {
  switch (status) {
    case JobStatus.Done:
      return 'Done';
    case JobStatus.Cancelled:
      return 'Canceled';
    case JobStatus.TimedOut:
      return 'Timed out';
    case JobStatus.Failure:
      return 'Failure';
    case JobStatus.InProgress:
      return 'In progress';
  }
};

const columns: TableColumn<SyncJobRow>[] = [
  {
    title: 'Status',
    field: 'status',
    render: ({ status }) => (
      <Grid container alignItems="center" direction="row">
        <Grid item xs={1}>
          {statusLogo(status)}
        </Grid>
        <Grid item xs={11}>
          {formatStatus(status)}
        </Grid>
      </Grid>
    ),
  },
  {
    title: 'Timestamp',
    field: 'timestamp',
    render: ({ timestamp }) => (
      <Tooltip
        title={moment
          .utc(timestamp)
          .local()
          .format('dddd, MM/DD/YYYY, HH:mm:ss')}
      >
        <span>{moment.utc(timestamp).local().format('MMM Do YYYY, h:mm:ss a')}</span>
      </Tooltip>
    ),
    defaultSort: 'desc',
  },
];

export const SyncJobsTable = () => {
  const {
    value: jobsResponse,
    loading,
    error,
  } = useCortexApi(api => api.getSyncJobs());

  const rows: SyncJobRow[] | undefined = useMemo(() => {
    return jobsResponse?.jobs?.map(job => {
      return {
        status: job.status,
        timestamp: job.dateCreated,
      };
    });
  }, [jobsResponse]);

  if (loading || isNil(rows)) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not load sync jobs.">
        {error.message}
      </WarningPanel>
    );
  }

  return (
    <Table
      title="Sync job statuses"
      columns={columns}
      options={{ search: false }}
      data={rows}
    />
  );
};
