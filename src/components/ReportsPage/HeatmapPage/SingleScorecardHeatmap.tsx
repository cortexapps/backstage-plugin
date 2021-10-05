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
import { Progress, WarningPanel } from '@backstage/core-components';
import { useCortexApi } from '../../../utils/hooks';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { TableCell } from '@material-ui/core';
import { useHeatmapStyles } from './AllScorecardsHeatmap';
import { ruleName } from '../../../api/types';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityName } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../../utils/ComponentUtils';
import { HeatmapCell } from './HeatmapCell';

interface SingleScorecardHeatmapProps {
  scorecardId: string;
}

export const SingleScorecardHeatmap = ({
  scorecardId,
}: SingleScorecardHeatmapProps) => {
  const {
    value: scores,
    loading,
    error,
  } = useCortexApi(api => api.getScorecardScores(scorecardId), [scorecardId]);

  const classes = useHeatmapStyles();

  if (loading) {
    return <Progress />;
  }

  if (error || scores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scorecard.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (scores.length === 0) {
    return (
      <WarningPanel
        severity="error"
        title="Scorecard has not been evaluated."
      />
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Entity</TableCell>
          <TableCell className={classes.root}>Score</TableCell>
          {scores[0].rules.map(rule => (
            <TableCell key={rule.rule.id} className={classes.root}>
              {ruleName(rule.rule)}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {scores.map(score => (
          <TableRow key={score.componentRef}>
            <TableCell>
              <EntityRefLink
                entityRef={parseEntityName(
                  score.componentRef,
                  defaultComponentRefContext,
                )}
              />
            </TableCell>
            <HeatmapCell score={score.scorePercentage} />
            {score.rules.map(rule => (
              <HeatmapCell
                key={rule.rule.id}
                score={rule.score > 0 ? 1 : 0}
                text={rule.score > 0 ? '1' : '0'}
              />
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
