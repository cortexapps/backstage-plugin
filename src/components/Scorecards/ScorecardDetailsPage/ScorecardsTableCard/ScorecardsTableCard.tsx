/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { EmptyState, InfoCard, Table as BSTable, TableColumn } from '@backstage/core-components';
import { ScorecardServiceScore } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { Gauge } from '../../../Gauge';
import { humanizeAnyEntityRef } from '../../../../utils/types';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';
import { ScorecardServiceRefLink } from '../../../ScorecardServiceRefLink/ScorecardServiceRefLink';

interface ScorecardsTableProps {
  scorecardId: number;
  scores: ScorecardServiceScore[];
}

const PAGE_SIZE = 25;

const columns: TableColumn[] = [{
  field: 'scorePercentage',
  sorting: false,
  title: 'Score',
}, {
  customFilterAndSearch: (filter, rowData: { serviceName?: string }) => {
    return rowData.serviceName?.indexOf(filter) !== -1;
  },
  title: 'Service name',
  field: 'name',
  sorting: false,
  highlight: true,
}, {
  title: 'Level',
  field: 'level',
  sorting: false,
}];

export const ScorecardsTableCard = ({
  scorecardId,
  scores,
}: ScorecardsTableProps) => {
  const classes = useDetailCardStyles();

  const sortedScores = useMemo(() => {
    scores.sort((a, b) => b.scorePercentage - a.scorePercentage);
    return scores;
  }, [scores]);

  const data = useMemo(() => {
    return sortedScores.map((score) => {
      const currentLevel = score.ladderLevels?.[0]?.currentLevel;
      const serviceName = humanizeAnyEntityRef(
        score.componentRef,
        defaultComponentRefContext,
      );
      return {
        scorePercentage: (
          <Gauge
            value={score.scorePercentage}
            strokeWidth={10}
            trailWidth={10}
          />
        ),
        name: (
          <ScorecardServiceRefLink
            scorecardId={scorecardId}
            componentRef={score.componentRef}
          >
            {serviceName}
          </ScorecardServiceRefLink>
        ),
        level: currentLevel ? (
          <ScorecardLadderLevelBadge
            name={currentLevel.name}
            color={currentLevel.color}
          />) : null,
        serviceName, // for filtering
      };
    })
  }, [scorecardId, sortedScores]);

  const showPagination = sortedScores.length > PAGE_SIZE;

  if (scores.length === 0) {
    return (
      <InfoCard title="Scores" className={classes.root}>
        <EmptyState missing="data" title="No components found." />
      </InfoCard>
    );
  }

  return (
    <BSTable
      options={{
        paging: showPagination,
        pageSize: PAGE_SIZE,
        pageSizeOptions: [25, 50, 100],
      }}
      data={data}
      columns={columns}
      title="Scores"
    />
  );
};
