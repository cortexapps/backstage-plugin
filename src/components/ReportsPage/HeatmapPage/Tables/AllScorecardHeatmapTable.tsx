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
import { mean as _average, round as _round } from 'lodash';
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';

import { HeaderItem, HeatmapTableHeader } from './HeatmapTableHeader';
import { HeatmapCell } from '../HeatmapCell';
import { getFormattedScorecardScores, StringIndexable } from '../HeatmapUtils';
import {
  defaultComponentRefContext,
  entityComponentRef,
} from '../../../../utils/ComponentUtils';
import { filterNotUndefined } from '../../../../utils/collections';

import { GroupByOption, ScoresByIdentifier } from '../../../../api/types';
import { HomepageEntity } from '../../../../api/userInsightTypes';

interface AllScorecardsHeatmapTableProps {
  entitiesByTag: StringIndexable<HomepageEntity>;
  groupBy: GroupByOption;
  scorecardNames: string[];
  serviceScores: ScoresByIdentifier[];
}

export const AllScorecardsHeatmapTable = ({
  entitiesByTag,
  groupBy,
  scorecardNames,
  serviceScores,
}: AllScorecardsHeatmapTableProps) => {
  const data = useMemo(
    () => getFormattedScorecardScores(scorecardNames, serviceScores),
    [scorecardNames, serviceScores],
  );
  const isGroupedByService = groupBy === GroupByOption.ENTITY;
  const numberOfServicesOrEmpty = !isGroupedByService
    ? ['Number of Services']
    : [];
  const headers: HeaderItem[] = [
    { label: 'Entity' },
    ...numberOfServicesOrEmpty.map(label => ({ label })),
    { label: 'Average Score' },
    ...scorecardNames.map(label => ({ label })),
  ];

  return (
    <Table>
      <HeatmapTableHeader headers={headers} />
      <TableBody>
        {data.map(groupScore => {
          const averageScore = _round(
            _average(
              filterNotUndefined(
                groupScore.scores.map(score => score?.scorePercentage),
              ),
            ),
            2,
          );

          return (
            <TableRow key={`TableRow-${groupScore.identifier}`}>
              <TableCell>
                {!isGroupedByService ? (
                  <>{groupScore.identifier!!}</>
                ) : (
                  <EntityRefLink
                    entityRef={parseEntityRef(
                      entityComponentRef(
                        entitiesByTag,
                        groupScore.identifier!!,
                      ),
                      defaultComponentRefContext,
                    )}
                    title={entitiesByTag[groupScore.identifier!!]?.name}
                  />
                )}
              </TableCell>
              {!isGroupedByService && (
                <TableCell style={{ textAlign: 'center' }}>
                  {groupScore.numberOfServices}
                </TableCell>
              )}
              <HeatmapCell
                score={isNaN(averageScore) ? undefined : averageScore}
                text={isNaN(averageScore) ? 'N/A' : undefined}
              />
              {groupScore.scores.map((score, idx) => (
                <React.Fragment key={`ReportsTableRuleRow-${idx}`}>
                  <HeatmapCell
                    score={score?.scorePercentage}
                    text={score !== undefined ? undefined : 'N/A'}
                  />
                </React.Fragment>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
