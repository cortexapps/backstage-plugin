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

import {
  defaultComponentRefContext,
  entityComponentRef,
} from '../../../../utils/ComponentUtils';
import { HeatmapTableHeader } from './HeatmapTableHeader';
import { LevelsInfoCell } from '../LevelsInfoCell';
import {
  getServicesInLevelsFromScores,
  StringIndexable,
} from '../HeatmapUtils';

import { GroupByOption, ScorecardServiceScore } from '../../../../api/types';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { SortBy } from '../HeatmapFilters';

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
  const headers = [
    {
      label: header,
      sortKey: 'identifier',
    },
    ...(notGroupedByServices ? [`${entityCategory} Count`] : []).map(label => ({
      label,
    })),
    ...levels.map(label => ({ label })),
  ];

  return (
    <Table>
      <HeatmapTableHeader
        headers={headers}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <TableBody>
        {Object.entries(data).map(([key, values = []]) => {
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
              {scores.map((score, idx) => (
                <LevelsInfoCell
                  key={`LevelsInfoCell-${key}-${idx}`}
                  entitiesByTag={entitiesByTag}
                  identifier={key}
                  scores={score}
                />
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
