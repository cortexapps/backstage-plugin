/*
 * Copyright 2023 Cortex Applications, Inc.
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
import {
  CategoryFilter,
  ScorecardLadder,
  ScorecardServiceScore,
} from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { humanizeAnyEntityRef } from '../../../../utils/types';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { ScorecardServiceRefLink } from '../../../ScorecardServiceRefLink';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { Box, Typography, makeStyles } from '@material-ui/core';
import { isNil } from 'lodash';
import {
  levelSort,
  scorePercentageSort,
  levelColumn,
  scoreColumn,
  PAGE_SIZE,
} from './ScorecardsScoresTableConfig';

interface ScorecardsScoresTableProps {
  category: CategoryFilter;
  entitiesByTag: StringIndexable<HomepageEntity>;
  ladder?: ScorecardLadder;
  scorecardId: number;
  scores: ScorecardServiceScore[];
}

const useScorecardsScoresTableCardStyle = makeStyles(() => ({
  tag: {
    fontFamily: 'Input, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: 12,
  },
}));

export const ScorecardsScoresTable = ({
  category,
  entitiesByTag,
  ladder,
  scorecardId,
  scores,
}: ScorecardsScoresTableProps) => {
  const classes = useDetailCardStyles();
  const scorecardsTableCardClasses = useScorecardsScoresTableCardStyle();

  const columns: TableColumn[] = useMemo(
    () => [
      {
        customFilterAndSearch: (filter, rowData: { name?: string }) => {
          return (
            rowData.name
              ?.toLocaleLowerCase()
              .includes(filter.toLocaleLowerCase()) ?? false
          );
        },
        customSort: (data1: { name?: string }, data2: { name?: string }) => {
          return (data2?.name ?? '')?.localeCompare(data1?.name ?? '');
        },
        field: 'name',
        highlight: true,
        sorting: true,
        title: `${category} name`,
        render: ({
          name,
          tag = '',
          description,
        }: {
          name?: string;
          tag?: string;
          description?: string;
        }) => (
          <Box>
            <ScorecardServiceRefLink
              scorecardId={scorecardId}
              componentRef={tag}
            >
              {name}
            </ScorecardServiceRefLink>
            {description && (
              <Typography variant="subtitle2">{description}</Typography>
            )}
          </Box>
        ),
      },
      {
        sorting: true,
        field: 'tag',
        title: 'Tag',
        customSort: (data1: { tag?: string }, data2: { tag?: string }) => {
          const tag1 = data1?.tag ?? '';
          const tag2 = data2?.tag ?? '';

          return tag2.localeCompare(tag1);
        },
        customFilterAndSearch: (filter, rowData: { tag?: string }) => {
          return (
            rowData.tag
              ?.toLocaleLowerCase()
              .includes(filter.toLocaleLowerCase()) ?? false
          );
        },
        render: ({ tag }: { tag?: string }) => (
          <Typography
            variant="subtitle2"
            className={scorecardsTableCardClasses.tag}
          >
            {tag}
          </Typography>
        ),
      },
    ],
    [category, scorecardId, scorecardsTableCardClasses.tag],
  );

  const data = useMemo(() => {
    return scores
      .map(score => {
        const currentLevel = score.ladderLevels?.[0]?.currentLevel;
        const serviceName =
          entitiesByTag[score.componentRef]?.name ??
          humanizeAnyEntityRef(score.componentRef, defaultComponentRefContext);

        return {
          level: currentLevel,
          name: serviceName,
          scorePercentage: score.scorePercentage,
          description: score.description,
          tag: score.componentRef,
        };
      })
      .sort(!isNil(ladder) ? levelSort : scorePercentageSort);
  }, [entitiesByTag, ladder, scores]);

  const tableColumns = useMemo(() => {
    return !isNil(ladder)
      ? [levelColumn, ...columns]
      : [scoreColumn, ...columns];
  }, [columns, ladder]);

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
      columns={tableColumns}
      data={data}
      options={{
        pageSize: PAGE_SIZE,
        pageSizeOptions: [PAGE_SIZE, PAGE_SIZE * 2, PAGE_SIZE * 4],
        paging: showPagination,
        padding: 'dense',
      }}
    />
  );
};
