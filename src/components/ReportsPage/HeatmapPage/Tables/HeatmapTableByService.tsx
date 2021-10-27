/*
 * Copyright 2021 Cortex Applications, Inc.
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
import React from 'react';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { TableCell } from '@material-ui/core';
import { ScorecardServiceScore } from '../../../../api/types';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityName } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { HeatmapCell } from '../HeatmapCell';
import { getAverageRuleScores, StringIndexable } from '../HeatmapUtils';
import { mean as _average } from 'lodash';
import { HeatmapTableHeader } from './HeatmapTableHeader';

interface HeatmapTableByServiceProps {
  rules: string[];
  data: StringIndexable<ScorecardServiceScore[]>;
}

export const HeatmapTableByService = ({
  rules,
  data,
}: HeatmapTableByServiceProps) => {
  const headers = ['Service Details', 'Score', 'Score Percentage', ...rules];

  return (
    <Table>
      <HeatmapTableHeader headers={headers} />
      <TableBody>
        {Object.entries(data).map(([key, values]) => {
          const firstScore = values[0];
          const serviceCount = values.length;
          const averageScorePercentage = _average(
            values.map(score => score.scorePercentage),
          );
          const averageRuleScores = getAverageRuleScores(values, serviceCount);

          return (
            <TableRow key={firstScore.componentRef}>
              <TableCell>
                <EntityRefLink
                  entityRef={parseEntityName(
                    firstScore.componentRef,
                    defaultComponentRefContext,
                  )}
                />
              </TableCell>
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
      </TableBody>
    </Table>
  );
};
