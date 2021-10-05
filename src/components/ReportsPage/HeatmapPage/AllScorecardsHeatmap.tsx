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
import React, { useMemo } from 'react';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useCortexApi } from '../../../utils/hooks';
import { average } from '../../../utils/numeric';
import TableRow from '@material-ui/core/TableRow/TableRow';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { makeStyles, TableCell } from '@material-ui/core';
import { HeatmapCell } from './HeatmapCell';
import { BackstageTheme } from '@backstage/theme';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityName } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../../utils/ComponentUtils';

export const useHeatmapStyles = makeStyles<BackstageTheme>({
  root: {
    textAlign: 'center',
  },
});

export const AllScorecardsHeatmap = () => {
  const {
    value: serviceScores,
    loading,
    error,
  } = useCortexApi(api => api.getServiceScorecardScores());

  const scorecards = useMemo(() => {
    const out: Record<string, string> = {};
    serviceScores
      ?.flatMap(score => score.scores)
      ?.forEach(score => {
        out[score.scorecardId] = score.scorecardName!!;
      });
    return out;
  }, [serviceScores]);

  const scorecardIds = useMemo(() => {
    return Object.keys(scorecards).sort((a, b) =>
      scorecards[a].localeCompare(scorecards[b]),
    );
  }, [scorecards]);

  const classes = useHeatmapStyles();

  if (loading) {
    return <Progress />;
  }

  if (error || serviceScores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scorecards.">
        {error?.message}
      </WarningPanel>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Entity</TableCell>
          <TableCell className={classes.root}>Average Score</TableCell>
          {scorecardIds.map(scorecardId => (
            <TableCell key={scorecardId} className={classes.root}>
              {scorecards[scorecardId]}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {serviceScores.map(serviceScore => {
          return (
            <TableRow key={serviceScore.identifier}>
              <TableCell>
                <EntityRefLink
                  entityRef={parseEntityName(
                    serviceScore.identifier!!,
                    defaultComponentRefContext,
                  )}
                />
              </TableCell>
              <HeatmapCell
                score={
                  average(
                    serviceScore.scores.map(score => score.scorePercentage),
                  ) ?? 0
                }
              />
              {scorecardIds.map(scorecardId => {
                const score = serviceScore.scores
                  // eslint-disable-next-line eqeqeq
                  .find(s => s.scorecardId == scorecardId)?.scorePercentage;

                return (
                  <React.Fragment key={scorecardId}>
                    <HeatmapCell
                      score={score}
                      text={score !== undefined ? undefined : 'N/A'}
                    />
                  </React.Fragment>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
