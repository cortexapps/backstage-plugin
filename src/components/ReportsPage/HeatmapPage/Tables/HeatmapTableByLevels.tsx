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
import { HeatmapCell } from '../HeatmapCell';
import {
  getAverageRuleScores,
  getSortedRulesByLevels,
  StringIndexable,
} from '../HeatmapUtils';
import { mean as _average, round as _round } from 'lodash';
import { HeatmapTableHeader } from './HeatmapTableHeader';
import { useCortexApi } from '../../../../utils/hooks';
import { Progress, WarningPanel } from '@backstage/core-components';

interface HeatmapTableByLevelsProps {
  scorecardId: string;
  rules: string[];
  data: StringIndexable<ScorecardServiceScore[]>;
}

export const HeatmapTableByLevels = ({
  scorecardId,
  rules,
  data,
}: HeatmapTableByLevelsProps) => {
  const {
    value: ladders,
    loading,
    error,
  } = useCortexApi(api => api.getScorecardLadders(scorecardId), [scorecardId]);

  if (loading) {
    return <Progress />;
  }

  if (error || ladders === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scorecard.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (ladders.length === 0 || ladders?.[0] === undefined) {
    return <WarningPanel severity="error" title="Scorecard has no ladders." />;
  }

  // currently we only support 1 ladder per Scorecard
  const ladder = ladders?.[0];
  const rulesByLevels = getSortedRulesByLevels(rules, ladder?.levels);

  const headers = [
    'Level',
    'Service Count',
    'Average Score',
    'Average Score Percentage',
    ...rulesByLevels,
  ];

  return (
    <Table>
      <HeatmapTableHeader headers={headers} />
      <TableBody>
        {Object.entries(data).map(([key, values]) => {
          const firstScore = values[0];
          const serviceCount = values.length;
          const averageScore = _round(
            _average(values.map(score => score.score)),
            2,
          );
          const averageScorePercentage = _average(
            values.map(score => score.scorePercentage),
          );
          const averageRuleScores = getAverageRuleScores(values, serviceCount);

          return (
            <TableRow key={firstScore.componentRef}>
              <TableCell>{key}</TableCell>
              <TableCell>{serviceCount}</TableCell>
              <HeatmapCell score={averageScore} />
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
