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
import { InfoCard } from '@backstage/core-components';
import { makeStyles, Table, TableBody } from '@material-ui/core';
import { EntityScorecardsCardRow } from './EntityScorecardsCardRow';
import { BackstageTheme } from '@backstage/theme';
import { ServiceScorecardScore } from '../../api/types';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  table: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}!important`,
    },
    '&:nth-of-type(even)': {
      backgroundColor: `${theme.palette.background.paper}!important`,
    },
  },
}));

interface EntityScorecardsCardProps {
  scores: ServiceScorecardScore[];
  selectedScorecardId?: number;
  onSelect: (scorecardId: number) => void;
}

export const EntityScorecardsCard = ({
  scores,
  selectedScorecardId,
  onSelect,
}: EntityScorecardsCardProps) => {
  const classes = useStyles();

  return (
    <InfoCard title="Scorecards">
      <Table className={classes.table}>
        <TableBody>
          {scores.map(score => (
            <EntityScorecardsCardRow
              key={score.scorecard.id}
              score={score}
              onSelect={() => onSelect(score.scorecard.id)}
              selected={selectedScorecardId === score.scorecard.id}
            />
          ))}
        </TableBody>
      </Table>
    </InfoCard>
  );
};
