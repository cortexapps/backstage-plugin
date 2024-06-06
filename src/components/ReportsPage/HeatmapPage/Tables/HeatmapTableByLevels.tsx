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
import React from 'react';
import { isUndefined, mean as _average } from 'lodash';
import { Table, TableBody, TableRow } from '@material-ui/core';
import { WarningPanel } from '@backstage/core-components';

import { HeatmapTableHeader } from './HeatmapTableHeader';
import { HeatmapCell } from '../HeatmapCell';
import {
  getAverageRuleScores,
  getSortedRulesByLevels,
  StringIndexable,
} from '../HeatmapUtils';

import { ScorecardLadder, ScorecardServiceScore } from '../../../../api/types';

interface HeatmapTableByLevelsProps {
  ladder: ScorecardLadder | undefined;
  rules: string[];
  data: StringIndexable<ScorecardServiceScore[]>;
  entityCategory: string;
}

export const HeatmapTableByLevels = ({
  ladder,
  rules,
  data,
  entityCategory,
}: HeatmapTableByLevelsProps) => {
  const rulesByLevels = getSortedRulesByLevels(rules, ladder?.levels);

  const headers = ['Level', `${entityCategory} Count`, 'Average Score', ...rulesByLevels];

  if (isUndefined(ladder)) {
    return (
      <WarningPanel severity="error" title="Scorecard has no levels defined." />
    );
  }

  return (
    <Table>
      <HeatmapTableHeader headers={headers} />
      <TableBody>
        {Object.entries(data).map(([identifier, values]) => {
          const firstScore = values[0];
          const serviceCount = values.length;
          const averageScorePercentage = _average(
            values.map(score => score.scorePercentage),
          );
          const averageRuleScores = getAverageRuleScores(values);

          return (
            <TableRow key={`TableRow-${firstScore.componentRef}`}>
              <HeatmapCell text={identifier} />
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
