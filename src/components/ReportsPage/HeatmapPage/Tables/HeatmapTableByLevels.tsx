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
import React, { Dispatch, useMemo } from 'react';
import { isUndefined, mean as _average, orderBy, meanBy } from 'lodash';
import { Link, Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { WarningPanel } from '@backstage/core-components';

import { HeaderItem, HeatmapTableHeader } from './HeatmapTableHeader';
import { HeatmapCell } from '../HeatmapCell';
import {
  getAverageRuleScores,
  getSortedRulesByLevels,
  StringIndexable,
} from '../HeatmapUtils';

import { ScorecardLadder, ScorecardServiceScore } from '../../../../api/types';
import { SortBy } from '../HeatmapFilters';

interface HeatmapTableByLevelsProps {
  ladder: ScorecardLadder | undefined;
  rules: string[];
  data: StringIndexable<ScorecardServiceScore[]>;
  entityCategory: string;
  onSelect: (identifier: string) => void;
  sortBy?: SortBy;
  setSortBy: Dispatch<React.SetStateAction<SortBy | undefined>>;
}

export const HeatmapTableByLevels = ({
  ladder,
  rules,
  data,
  entityCategory,
  onSelect,
  sortBy,
  setSortBy,
}: HeatmapTableByLevelsProps) => {
  const rulesByLevels = getSortedRulesByLevels(rules, ladder?.levels);

  const headers: HeaderItem[] = [
    {
      label: 'Level',
      sortKey: 'identifier',
    },
    {
      label: `${entityCategory} Count`,
      sortKey: 'score',
    },
    {
      label: 'Average Score',
      sortKey: 'percentage',
    },
    ...rulesByLevels.map(label => {
      return { label };
    }),
  ];

  const dataValues = useMemo(() => {
    if (!sortBy) return Object.entries(data);

    return orderBy(
      Object.entries(data),
      ([key, values]) => {
        if (sortBy.column === 'identifier') {
          return values[0].componentRef?.toLowerCase();
        } else if (sortBy.column === 'score') {
          return values.length;
        } else if (sortBy.column === 'percentage') {
          return meanBy(values, 'scorePercentage');
        }
        return key;
      },
      sortBy.desc ? 'desc' : 'asc',
    );
  }, [data, sortBy]);

  if (isUndefined(ladder)) {
    return (
      <WarningPanel severity="error" title="Scorecard has no levels defined." />
    );
  }

  return (
    <Table>
      <HeatmapTableHeader
        headers={headers}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <TableBody>
        {dataValues.map(([identifier, values]) => {
          const firstScore = values[0];
          const serviceCount = values.length;
          const averageScorePercentage = _average(
            values.map(score => score.scorePercentage),
          );
          const averageRuleScores = getAverageRuleScores(values);

          return (
            <TableRow key={`TableRow-${firstScore.componentRef}`}>
              <TableCell>
                <Link
                  variant="subtitle1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onSelect(identifier);
                  }}
                >
                  {identifier}
                </Link>
              </TableCell>
              <HeatmapCell text={serviceCount.toString()} />
              <HeatmapCell score={averageScorePercentage} />
              {averageRuleScores.map((score, idx) => (
                <HeatmapCell
                  key={`HeatmapCell-${identifier}-${idx}`}
                  score={score}
                />
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
