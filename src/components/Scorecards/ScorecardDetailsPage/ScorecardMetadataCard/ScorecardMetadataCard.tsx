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
import { Scorecard, ScorecardServiceScore } from '../../../../api/types';
import { Chip, Grid } from '@material-ui/core';
import moment from 'moment';
import { InfoCard } from '@backstage/core-components';
import { useDetailCardStyles } from '../../../../styles/styles';
import { MetadataItem } from '../../../MetadataItem';

interface ScorecardMetadataCardProps {
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
}

export const ScorecardMetadataCard = ({
  scorecard,
  scores,
}: ScorecardMetadataCardProps) => {
  const classes = useDetailCardStyles();

  const lastUpdated =
    scores.length === 0
      ? undefined
      : moment.max(scores.map(score => moment.utc(score.lastUpdated).local()));
  const nextUpdated = scorecard.nextUpdated
    ? moment.utc(scorecard.nextUpdated)
    : undefined;

  return (
    <InfoCard title="Details" className={classes.root}>
      <Grid container>
        {scorecard.description && (
          <MetadataItem gridSizes={{ xs: 12 }} label="Description">
            {scorecard.description}
          </MetadataItem>
        )}
        <MetadataItem gridSizes={{ xs: 12, sm: 6, lg: 4 }} label="Owner">
          {scorecard.creator.name}
        </MetadataItem>
        {scorecard.tags.length > 0 && (
          <MetadataItem gridSizes={{ xs: 12, sm: 6, lg: 4 }} label="Applies To">
            {scorecard.tags.map(s => (
              <Chip key={s.id} size="small" label={s.tag} />
            ))}
          </MetadataItem>
        )}
        {lastUpdated && (
          <MetadataItem
            gridSizes={{ xs: 12, sm: 6, lg: 4 }}
            label="Last Updated"
          >
            {lastUpdated.fromNow()}
          </MetadataItem>
        )}
        {nextUpdated && (
          <MetadataItem
            gridSizes={{ xs: 12, sm: 6, lg: 4 }}
            label="Next Evaluation"
          >
            {nextUpdated.fromNow()}
          </MetadataItem>
        )}
      </Grid>
    </InfoCard>
  );
};
