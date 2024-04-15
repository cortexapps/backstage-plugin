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
import { Scorecard, ScorecardServiceScore } from '../../../../api/types';
import { Box, Typography, makeStyles } from '@material-ui/core';
import moment from 'moment';
import { MarkdownContent } from '@backstage/core-components';
import { CortexInfoCard } from '../../../Common/CortexInfoCard';
import { HoverTimestamp } from '../../../Common/HoverTimestamp';
import ScorecardMetadataFilter from './ScorecardMetadataFilter';
import { CaptionTypography } from '../../../Common/StatsItem';
import { Truncated } from '../../../Common/Truncated';

interface ScorecardMetadataCardProps {
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
}

const useScorecardMetadataCardStyles = makeStyles(theme => ({
  markdownBox: {
    '& p': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
}));

export const ScorecardMetadataCard = ({
  scorecard,
  scores,
}: ScorecardMetadataCardProps) => {
  const classes = useScorecardMetadataCardStyles();
  const lastUpdated =
    scores.length === 0
      ? undefined
      : moment.max(scores.map(score => moment.utc(score.lastUpdated).local()));
  const nextUpdated = scorecard.nextUpdated
    ? moment.utc(scorecard.nextUpdated)
    : undefined;

  return (
    <CortexInfoCard
      title={
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">{scorecard.name}</Typography>
          <Typography variant="subtitle2">{scorecard.tag}</Typography>
        </Box>
      }
    >
      <Box display="flex" flexDirection="column">
        {scorecard.description && (
          <Box mb={2} className={classes.markdownBox}>
            <CaptionTypography variant="caption">Description</CaptionTypography>
            <Truncated
              text={scorecard.description}
              truncateToLines={10}
              renderText={(text) => (<MarkdownContent content={text}/>)}
            />
          </Box>
        )}
        <Box mb={2}>
          <CaptionTypography variant="caption">Filter</CaptionTypography>
          <ScorecardMetadataFilter scorecard={scorecard} />
        </Box>

        {(lastUpdated || nextUpdated) && (
          <CaptionTypography variant="caption">Evaluation</CaptionTypography>
        )}
        {lastUpdated && (
          <Typography component="span" variant="caption">
            Updated <HoverTimestamp ts={lastUpdated} />
          </Typography>
        )}
        {nextUpdated && (
          <Typography component="span" variant="caption">
            Next Evaluation <HoverTimestamp ts={nextUpdated} />
          </Typography>
        )}
      </Box>
    </CortexInfoCard>
  );
};
