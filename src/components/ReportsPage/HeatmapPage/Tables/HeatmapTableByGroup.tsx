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
import React, { Dispatch } from 'react';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { ScorecardServiceScore } from '../../../../api/types';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { HeatmapCell } from '../HeatmapCell';
import { getAverageRuleScores, StringIndexable } from '../HeatmapUtils';
import { mean as _average } from 'lodash';
import { HeaderItem, HeatmapTableHeader } from './HeatmapTableHeader';
import { TableCell, Link } from '@material-ui/core';
import { SortBy } from '../HeatmapFilters';

interface HeatmapTableByGroupProps {
  header: string;
  rules: string[];
  data: StringIndexable<ScorecardServiceScore[]>;
  entityCategory: string;
  hideWithoutChildren?: boolean;
  onSelect: (identifier: string) => void;
  useHierarchy: boolean;
  lastPathItem?: string;
  sortBy?: SortBy;
  setSortBy: Dispatch<React.SetStateAction<SortBy | undefined>>;
}

export const HeatmapTableByGroup = ({
  header,
  rules,
  data,
  entityCategory,
  hideWithoutChildren = false,
  onSelect,
  useHierarchy,
  lastPathItem,
  sortBy,
  setSortBy,
}: HeatmapTableByGroupProps) => {
  const headers: HeaderItem[] = [
    {
      label: header,
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
    ...rules.map(rule => ({
      label: rule,
    })),
  ];

  return (
    <Table>
      <HeatmapTableHeader
        headers={headers}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <TableBody>
        {Object.entries(data).map(([identifier, values = []]) => {
          const serviceCount = values.length;

          if (serviceCount < 1 && hideWithoutChildren) {
            return undefined;
          }

          const averageScore = _average(
            values.map(score => score.scorePercentage),
          );
          const averageRuleScores = getAverageRuleScores(values);

          return (
            <TableRow key={`TableRow-${identifier}`}>
              <TableCell>
                {useHierarchy ? (
                  <Link
                    variant="subtitle1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onSelect(identifier);
                    }}
                  >
                    {identifier === lastPathItem
                      ? `Everything owned by ${lastPathItem}`
                      : identifier}
                  </Link>
                ) : (
                  <Link
                    variant="subtitle1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onSelect(identifier);
                    }}
                  >
                    {identifier}
                  </Link>
                )}
              </TableCell>
              <HeatmapCell text={serviceCount.toString()} />
              {isNaN(averageScore) ? (
                <HeatmapCell text="N/A" />
              ) : (
                <HeatmapCell score={averageScore} />
              )}
              {averageRuleScores.length
                ? averageRuleScores.map((score, idx) => (
                    <HeatmapCell
                      key={`HeatmapCell-${identifier}-${idx}`}
                      score={score}
                    />
                  ))
                : rules.map((_, idx) => (
                    <HeatmapCell
                      key={`HeatmapCell-${identifier}-${idx}`}
                      text="N/A"
                    />
                  ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
