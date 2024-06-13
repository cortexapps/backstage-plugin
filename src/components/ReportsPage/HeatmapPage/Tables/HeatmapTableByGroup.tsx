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
import TableRow from '@material-ui/core/TableRow/TableRow';
import { ScorecardServiceScore } from '../../../../api/types';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { HeatmapCell } from '../HeatmapCell';
import { getAverageRuleScores, StringIndexable } from '../HeatmapUtils';
import { mean as _average, orderBy, meanBy } from 'lodash';
import { HeaderItem, HeatmapTableHeader } from './HeatmapTableHeader';
import { TableCell, Link } from '@material-ui/core';
import { SortBy } from '../HeatmapFilters';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { useVirtualizer } from '@tanstack/react-virtual';

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
  entitiesByTag: StringIndexable<HomepageEntity>;
}

const heightEstimator = () => 82;

export const HeatmapTableByGroup = ({
  header,
  rules,
  data,
  // entitiesByTag,
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

  const dataValues = useMemo(() => {
    if (!sortBy) return Object.entries(data);

    return orderBy(
      Object.entries(data),
      ([key, values]) => {
        if (sortBy.column === 'identifier') {
          return values[0].componentRef?.toLowerCase();
          // return entitiesByTag[]?.name?.toLowerCase();
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
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: dataValues.length,
    estimateSize: heightEstimator,
    overscan: 10,
    getScrollElement: () => parentRef.current,
  });

  const totalSize = virtualizer.getTotalSize();
  const virtualRows = virtualizer.getVirtualItems();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <Table>
      <HeatmapTableHeader
        headers={headers}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <TableBody>
        {paddingTop > 0 && <tr style={{ height: paddingTop }} />}
        {virtualizer.getVirtualItems().map(item => {
          const [identifier, values = []] = dataValues[item.index];
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
        {paddingBottom > 0 && <tr style={{ height: paddingBottom }} />}
      </TableBody>
    </Table>
  );
};
