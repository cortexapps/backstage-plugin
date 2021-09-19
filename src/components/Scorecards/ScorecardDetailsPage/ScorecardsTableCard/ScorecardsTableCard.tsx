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
import { InfoCard } from '@backstage/core';
import React from 'react';
import { ScorecardServiceScore } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { Table, TableBody } from '@material-ui/core';
import { ScorecardsTableRow } from './ScorecardsTableRow';
import { EmptyState } from '@backstage/core-components';

interface ScorecardsTableProps {
  scorecardId: string;
  scores: ScorecardServiceScore[];
}

export const ScorecardsTableCard = ({
  scorecardId,
  scores,
}: ScorecardsTableProps) => {
  const classes = useDetailCardStyles();

  return (
    <InfoCard title="Scores" className={classes.root}>
      {scores.length === 0 ? (
        <EmptyState missing="data" title="No components found." />
      ) : (
        <Table>
          <TableBody>
            {scores
              .sort((a, b) => b.scorePercentage - a.scorePercentage)
              .map(score => (
                <ScorecardsTableRow
                  key={score.serviceId}
                  scorecardId={scorecardId}
                  score={score}
                />
              ))}
          </TableBody>
        </Table>
      )}
    </InfoCard>
  );
};
