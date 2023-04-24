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
import {
  EmptyState,
  InfoCard,
  Table as BSTable,
  TableColumn,
} from '@backstage/core-components';
import { ScorecardServiceScore } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { Gauge } from '../../../Gauge';
import { humanizeAnyEntityRef } from '../../../../utils/types';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';
import { ScorecardServiceRefLink } from '../../../ScorecardServiceRefLink';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../../api/userInsightTypes';

interface ScorecardsTableProps {
  entitiesByTag: StringIndexable<HomepageEntity>;
  scorecardId: number;
  scores: ScorecardServiceScore[];
}

const PAGE_SIZE = 25;

const columns: TableColumn[] = [
  {
    field: 'scorePercentage',
    sorting: true,
    title: 'Score',
    render: (data: { scorePercentage?: number }) => {
      return (
        <Gauge
          value={data?.scorePercentage ?? 0}
          strokeWidth={10}
          trailWidth={10}
        />
      );
    },
  },
  {
    customFilterAndSearch: (filter, rowData: { serviceName?: string }) => {
      return rowData.serviceName?.indexOf(filter) !== -1;
    },
    customSort: (
      data1: { serviceName?: string },
      data2: { serviceName?: string },
    ) => {
      return (data1?.serviceName ?? '')?.localeCompare(
        data2?.serviceName ?? '',
      );
    },
    field: 'name',
    highlight: true,
    sorting: true,
    title: 'Service name',
  },
  {
    field: 'level',
    sorting: false,
    title: 'Level',
  },
];

export const ScorecardsTableCard = ({
  entitiesByTag,
  scorecardId,
  scores,
}: ScorecardsTableProps) => {
  const classes = useDetailCardStyles();

  const data = useMemo(() => {
    return scores
      .map(score => {
        const currentLevel = score.ladderLevels?.[0]?.currentLevel;
        const serviceName = entitiesByTag[score.componentRef]?.name ?? humanizeAnyEntityRef(
          score.componentRef,
          defaultComponentRefContext,
        );
        return {
          level: currentLevel ? (
            <ScorecardLadderLevelBadge
              name={currentLevel.name}
              color={currentLevel.color}
            />
          ) : null,
          name: (
            <ScorecardServiceRefLink
              scorecardId={scorecardId}
              componentRef={score.componentRef}
            >
              {serviceName}
            </ScorecardServiceRefLink>
          ),
          scorePercentage: score.scorePercentage,
          serviceName, // for filtering
        };
      })
      .sort((left, right) => right.scorePercentage - left.scorePercentage);
  }, [entitiesByTag, scorecardId, scores]);

  const showPagination = scores.length > PAGE_SIZE;

  if (scores.length === 0) {
    return (
      <InfoCard title="Scores" className={classes.root}>
        <EmptyState missing="data" title="No scores found." />
      </InfoCard>
    );
  }

  return (
    <BSTable
      columns={columns}
      data={data}
      options={{
        pageSize: PAGE_SIZE,
        pageSizeOptions: [PAGE_SIZE, PAGE_SIZE * 2, PAGE_SIZE * 4],
        paging: showPagination,
      }}
      title="Scores"
    />
  );
};
