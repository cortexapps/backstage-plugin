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
import React from 'react';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { ScorecardServiceScore } from '../../../../api/types';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { HeatmapCell } from '../HeatmapCell';
import { getAverageRuleScores, StringIndexable } from '../HeatmapUtils';
import { mean as _average } from 'lodash';
import { HeatmapTableHeader } from './HeatmapTableHeader';

interface HeatmapTableByGroupProps {
  header: string;
  rules: string[];
  data: StringIndexable<ScorecardServiceScore[]>;
}

export const HeatmapTableByGroup = ({
  header,
  rules,
  data,
}: HeatmapTableByGroupProps) => {
  const headers = [header, 'Service Count', 'Average Score', ...rules];

  return (
    <Table>
      <HeatmapTableHeader headers={headers} />
      <TableBody>
        {Object.entries(data).map(([identifier, values]) => {
          const firstScore = values[0];
          const serviceCount = values.length;
          const averageScore = _average(
            values.map(score => score.scorePercentage),
          );
          const averageRuleScores = getAverageRuleScores(values, serviceCount);

          return (
            <TableRow key={firstScore.componentRef}>
              <HeatmapCell text={identifier} />
              <HeatmapCell text={serviceCount.toString()} />
              <HeatmapCell score={averageScore} />
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
