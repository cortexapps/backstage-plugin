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
import React, { Dispatch, useMemo, useRef } from 'react';
import Table from '@material-ui/core/Table';
import { useVirtualizer } from '@tanstack/react-virtual';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { TableCell, Typography } from '@material-ui/core';
import { ScorecardServiceScore } from '../../../../api/types';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { entityComponentRef } from '../../../../utils/ComponentUtils';
import { HeatmapCell } from '../HeatmapCell';
import { getAverageRuleScores, StringIndexable } from '../HeatmapUtils';
import { mean as _average, meanBy, orderBy } from 'lodash';
import { HeaderItem, HeatmapTableHeader } from './HeatmapTableHeader';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { ScorecardServiceRefLink } from '../../../ScorecardServiceRefLink';
import { SortBy } from '../HeatmapFilters';

interface HeatmapTableByServiceProps {
  header: string;
  scorecardId: number;
  data: StringIndexable<ScorecardServiceScore[]>;
  entitiesByTag: StringIndexable<HomepageEntity>;
  rules: string[];
  sortBy?: SortBy;
  setSortBy: Dispatch<React.SetStateAction<SortBy | undefined>>;
  tableHeight: number;
}

const heightEstimator = () => 82;

export const HeatmapTableByService = ({
  header,
  scorecardId,
  data,
  entitiesByTag,
  rules,
  setSortBy,
  sortBy,
  tableHeight,
}: HeatmapTableByServiceProps) => {
  const headers: HeaderItem[] = [
    {
      label: header,
      sortKey: 'identifier',
    },
    {
      label: 'Score',
      sortKey: 'score',
    },
    {
      label: 'Score percentage',
      sortKey: 'percentage',
    },
    ...rules.map(rule => ({
      label: rule,
    })),
  ];

  const dataValues = useMemo(() => {
    if (!sortBy) return Object.entries(data);

    return orderBy(
      Object.entries(data),
      ([key, values]) => {
        if (sortBy.column === 'identifier') {
          return entitiesByTag[values[0].componentRef]?.name?.toLowerCase();
        } else if (sortBy.column === 'score') {
          return values[0].score;
        } else if (sortBy.column === 'percentage') {
          return meanBy(values, 'scorePercentage');
        }
        return key;
      },
      sortBy.desc ? 'desc' : 'asc',
    );
  }, [data, sortBy, entitiesByTag]);

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: dataValues.length,
    estimateSize: heightEstimator,
    getScrollElement: () => parentRef.current!,
    overscan: 10,
  });
  const totalSize = virtualizer.getTotalSize();
  const virtualRows = virtualizer.getVirtualItems();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div
      style={{
        height: `${tableHeight}px`,
        overflow: 'auto',
      }}
      ref={parentRef}
    >
      <Table>
        <HeatmapTableHeader
          headers={headers}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <TableBody>
          {paddingTop > 0 && <tr style={{ height: paddingTop }} />}
          {virtualizer.getVirtualItems().map(item => {
            const [key, values = []] = dataValues[item.index];
            const firstScore = values[0];
            const averageScorePercentage = _average(
              values.map(score => score.scorePercentage),
            );
            const averageRuleScores = getAverageRuleScores(values);

            return (
              <TableRow key={`TableRow-${firstScore.componentRef}`}>
                <TableCell>
                  <ScorecardServiceRefLink
                    scorecardId={scorecardId}
                    componentRef={entityComponentRef(
                      entitiesByTag,
                      entitiesByTag[firstScore.componentRef]?.codeTag,
                    )}
                  >
                    <Typography variant="subtitle1">
                      {entitiesByTag[firstScore.componentRef]?.name}
                    </Typography>
                  </ScorecardServiceRefLink>
                </TableCell>
                <HeatmapCell
                  score={averageScorePercentage}
                  text={`${firstScore.score}`}
                />
                <HeatmapCell score={averageScorePercentage} />
                {averageRuleScores.map((score, idx) => (
                  <HeatmapCell
                    key={`HeatmapCell-${key}-${idx}`}
                    score={score > 0 ? 1 : 0}
                    text={score > 0 ? '1' : '0'}
                  />
                ))}
              </TableRow>
            );
          })}
          {paddingBottom > 0 && <tr style={{ height: paddingBottom }} />}
        </TableBody>
      </Table>
    </div>
  );
};
