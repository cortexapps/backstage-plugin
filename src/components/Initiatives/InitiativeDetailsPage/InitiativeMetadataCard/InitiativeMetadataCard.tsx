/*
 * Copyright 2024 Cortex Applications, Inc.
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
import { Initiative, InitiativeScheduleTimeUnit } from '../../../../api/types';
import { Link, MarkdownContent } from '@backstage/core-components';
import { Box, Typography, makeStyles } from '@material-ui/core';
import { useRouteRef } from '@backstage/core-plugin-api';
import { scorecardRouteRef } from '../../../../routes';
import { CortexInfoCard } from '../../../Common/CortexInfoCard';
import { CaptionTypography } from '../../../Common/StatsItem';
import InitiativeMetadataFilter from './InitiativeMetadataFilter';
import { getTargetDateMessage } from './InitiativeMetadataCardUtils';
import {
  useCortexFrontendUrl,
  useHideCortexLinks,
} from '../../../../utils/hooks';
import { cortexInitiativePageUrl } from '../../../../utils/URLUtils';
import { isNil } from 'lodash';
import {
  maybePluralize,
  maybePluralizeOnlyNoun,
} from '../../../../utils/strings';

interface InitiativeMetadataCardProps {
  initiative: Initiative;
}

const timeUnitToDisplayName: Record<InitiativeScheduleTimeUnit, string> = {
  [InitiativeScheduleTimeUnit.Day]: 'Day',
  [InitiativeScheduleTimeUnit.Week]: 'Week',
  [InitiativeScheduleTimeUnit.Month]: 'Month',
};

export const getTimeUnitDisplayName = (
  timeUnit: InitiativeScheduleTimeUnit,
  count: number,
) => {
  return maybePluralizeOnlyNoun(count, timeUnitToDisplayName[timeUnit]);
};

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

const getNotificationDisplayText = (initiative: Initiative) => {
  const notificationSchedule = initiative.notificationSchedule;
  const isDisabled =
    isNil(notificationSchedule) || notificationSchedule?.isDisabled;

  if (isDisabled) {
    return 'Custom notifications are disabled for this Initiative';
  }

  return `Notifications are configured to be sent every 
  ${maybePluralize(
    notificationSchedule.timeInterval,
    timeUnitToDisplayName[notificationSchedule.timeUnit].toLowerCase(),
  )}`;
};

export const InitiativeMetadataCard = ({
  initiative,
}: InitiativeMetadataCardProps) => {
  const classes = useScorecardMetadataCardStyles();
  const scorecardRef = useRouteRef(scorecardRouteRef);
  const hideLink = useHideCortexLinks();
  const cortexBaseUrl = useCortexFrontendUrl();
  return (
    <CortexInfoCard
      title={
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">{initiative.name}</Typography>
        </Box>
      }
    >
      <Box display="flex" flexDirection="column" gridGap={8}>
        <Typography variant="body2">
          {getTargetDateMessage(initiative)}
        </Typography>
        <Link to={scorecardRef({ id: `${initiative.scorecard.id}` })}>
          <Typography variant="body2">{initiative.scorecard.name}</Typography>
        </Link>
        {initiative.description && (
          <Box className={classes.markdownBox}>
            <CaptionTypography variant="caption">Description</CaptionTypography>
            <MarkdownContent content={initiative.description} />
          </Box>
        )}
        <Box className={classes.markdownBox}>
          <CaptionTypography variant="caption">
            Notification Schedule
          </CaptionTypography>
          <MarkdownContent content={getNotificationDisplayText(initiative)} />
          {!hideLink && (
            <Box>
              <Link
                to={cortexInitiativePageUrl({
                  initiativeId: initiative.id,
                  cortexUrl: cortexBaseUrl,
                })}
                target="_blank"
              >
                <b>Edit notification settings</b>
              </Link>
            </Box>
          )}
        </Box>

        <Box mb={2}>
          <CaptionTypography variant="caption">Filter</CaptionTypography>
          <InitiativeMetadataFilter initiative={initiative} />
        </Box>
      </Box>
    </CortexInfoCard>
  );
};
