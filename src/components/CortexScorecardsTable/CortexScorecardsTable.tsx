/*
 * Copyright 2021 Cortex Applications, Inc.
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
import React, { useState } from 'react';
import { ServiceScorecardScore } from '../../api/types';
import { CodeSnippet, Table, TableColumn, WarningPanel } from '@backstage/core';
import { CortexScorecardScoresColumn } from './CortexScorecardScoresColumn';
import SyncIcon from '@material-ui/icons/Sync';
import { Entity } from '@backstage/catalog-model';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { CircularProgress } from '@material-ui/core';

export type CortexScorecardsRow = {
  entity: Entity;
  scores?: ServiceScorecardScore[];
};

type CortexScorecardsTableProps = {
  loading: boolean;
  error?: any;
  entityScores: CortexScorecardsRow[];
  syncCortex: () => Promise<void>;
};

const columns: TableColumn<CortexScorecardsRow>[] = [
  {
    title: 'Name',
    field: 'entity.metadata.name',
    highlight: true,
    render: ({ entity }) => (
      <EntityRefLink entityRef={entity} defaultKind="Component" />
    ),
  },
  {
    title: 'Scores',
    field: 'scores',
    highlight: true,
    render: ({ scores }) => <CortexScorecardScoresColumn scores={scores} />,
  },
];

export const CortexScorecardsTable = ({
  error,
  loading,
  entityScores,
  syncCortex,
}: CortexScorecardsTableProps) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = () => {
    setIsSyncing(true);
    syncCortex().finally(() => setIsSyncing(false));
  };

  if (error) {
    return (
      <div>
        <WarningPanel severity="error" title="Could not fetch Cortex scores.">
          <CodeSnippet language="text" text={error.toString()} />
        </WarningPanel>
      </div>
    );
  }

  return (
    <Table<CortexScorecardsRow>
      title="Scorecard Scores"
      columns={columns}
      data={entityScores}
      options={{
        paging: true,
        pageSize: 20,
        actionsColumnIndex: -1,
        loadingType: 'linear',
        showEmptyDataSourceMessage: !loading,
        padding: 'dense',
        pageSizeOptions: [20, 50, 100],
      }}
      isLoading={loading}
      actions={[
        {
          icon: () => (isSyncing ? <CircularProgress /> : <SyncIcon />),
          tooltip: 'Sync Cortex',
          isFreeAction: true,
          onClick: sync,
        },
      ]}
    />
  );
};
