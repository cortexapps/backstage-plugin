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
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';
import { useVirtualizer } from '@tanstack/react-virtual';

import {
  defaultComponentRefContext,
  entityComponentRef,
} from '../../../../utils/ComponentUtils';
import { HeaderItem, HeatmapTableHeader } from './HeatmapTableHeader';
import { LevelsInfoCell } from '../LevelsInfoCell';
import {
  getServicesInLevelsFromScores,
  StringIndexable,
} from '../HeatmapUtils';

import { GroupByOption, ScorecardServiceScore } from '../../../../api/types';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { SortBy } from '../HeatmapFilters';
import { orderBy } from 'lodash';

interface LevelsDrivenTableProps {
  data: StringIndexable<ScorecardServiceScore[]>;
  entitiesByTag: Record<string, HomepageEntity>;
  groupBy: GroupByOption;
  header: string;
  levels: string[];
  entityCategory: string;
  onSelect: (identifier: string) => void;
  useHierarchy: boolean;
  hideWithoutChildren: boolean;
  lastPathItem?: string;
  sortBy?: SortBy;
  setSortBy: Dispatch<React.SetStateAction<SortBy | undefined>>;
}

const heightEstimator = () => 106;

export const LevelsDrivenTable = ({
  data,
  entitiesByTag,
  groupBy,
  header,
  levels,
  entityCategory,
  onSelect,
  useHierarchy,
  hideWithoutChildren,
  lastPathItem,
  sortBy,
  setSortBy,
}: LevelsDrivenTableProps) => {
  const notGroupedByServices = groupBy !== GroupByOption.ENTITY;
  const headers: HeaderItem[] = [
    {
      label: header,
      sortKey: 'identifier',
    },
    ...(notGroupedByServices ? [`${entityCategory} Count`] : []).map(label => ({
      label,
      sortKey: 'score',
    })),
    ...levels.map(label => ({ label })),
  ];

  const parentRef = useRef<HTMLDivElement>(null);

  const dataValues = useMemo(() => {
    if (!sortBy) return Object.entries(data);

    return orderBy(
      Object.entries(data),
      ([key, values]) => {
        if (sortBy.column === 'identifier') {
          const lowerCaseName =
            entitiesByTag[values[0].componentRef]?.name?.toLowerCase();
          return lowerCaseName || values[0].componentRef?.toLowerCase();
        } else if (sortBy.column === 'score') {
          return values.length;
        }
        return key;
      },
      sortBy.desc ? 'desc' : 'asc',
    );
  }, [data, sortBy]);
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
    <div ref={parentRef}>
      <div>
        <Table>
          <HeatmapTableHeader headers={headers} />
          <TableBody>
            {paddingTop > 0 && <tr style={{ height: paddingTop }} />}
            {virtualizer.getVirtualItems().map(item => {
              const [key, values = []] = dataValues[item.index];
              const serviceCount = values.length;

              if (serviceCount < 1 && hideWithoutChildren) {
                return undefined;
              }

              const scores = getServicesInLevelsFromScores(levels, values);
              const firstScore = values?.[0];

              return (
                <TableRow key={`TableRow-${key}`}>
                  {notGroupedByServices || !firstScore.componentRef ? (
                    <TableCell>
                      {useHierarchy ? (
                        <Link
                          variant="subtitle1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            onSelect(key);
                          }}
                        >
                          {key === lastPathItem
                            ? `Everything owned by ${lastPathItem}`
                            : key}
                        </Link>
                      ) : (
                        <Link
                          variant="subtitle1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            onSelect(key);
                          }}
                        >
                          {key}
                        </Link>
                      )}
                    </TableCell>
                  ) : (
                    <TableCell>
                      <EntityRefLink
                        entityRef={parseEntityRef(
                          entityComponentRef(
                            entitiesByTag,
                            firstScore.componentRef,
                          ),
                          defaultComponentRefContext,
                        )}
                      >
                        <Typography variant="subtitle1">
                          {entitiesByTag[firstScore.componentRef]?.name}
                        </Typography>
                      </EntityRefLink>
                    </TableCell>
                  )}
                  {notGroupedByServices && (
                    <TableCell>
                      <Typography
                        variant="subtitle1"
                        style={{ display: 'inline-block' }}
                      >
                        {serviceCount}
                      </Typography>
                    </TableCell>
                  )}
                  {scores.map((score, _idx) => {
                    return (
                      <LevelsInfoCell
                        // key={`LevelsInfoCell-${key}-${idx}`}
                        entitiesByTag={entitiesByTag}
                        identifier={key}
                        scores={score}
                      />
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
          {paddingBottom > 0 && <tr style={{ height: paddingBottom }} />}
        </Table>
      </div>
    </div>
  );
};
