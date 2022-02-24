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
import { mean as _average, round as _round } from 'lodash';
import { Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityName } from '@backstage/catalog-model';

import { HeatmapTableHeader } from './HeatmapTableHeader';
import { HeatmapCell } from '../HeatmapCell';
import { getFormattedScorecardScores } from '../HeatmapUtils';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { filterNotUndefined } from '../../../../utils/collections';

import { GroupByOption, ScoresByIdentifier } from '../../../../api/types';

interface AllScorecardsHeatmapTableProps {
  groupBy: GroupByOption;
  scorecardNames: string[];
  serviceScores: ScoresByIdentifier[];
}

export const AllScorecardsHeatmapTable = ({
  groupBy,
  scorecardNames,
  serviceScores,
}: AllScorecardsHeatmapTableProps) => {
  const data = useMemo(
    () => getFormattedScorecardScores(scorecardNames, serviceScores),
    [scorecardNames, serviceScores],
  );
  const headers = ['Entity', 'Average Score', ...scorecardNames];

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
            <TableRow key={groupScore.identifier}>
              <TableCell>
                {groupBy !== GroupByOption.SERVICE ? (
                  <>{groupScore.identifier!!}</>
                ) : (
                  <EntityRefLink
                    entityRef={parseEntityName(
                      groupScore.identifier!!,
                      defaultComponentRefContext,
                    )}
                  />
                )}
              </TableCell>
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
