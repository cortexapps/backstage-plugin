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
import { Typography, Box } from '@material-ui/core';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useCortexApi } from '../../../utils/hooks';
import { AnyEntityRef, stringifyAnyEntityRef } from '../../../utils/types';
import { ScorecardLadderLevelBadge } from '../../Common/ScorecardLadderLevelBadge';
import { isNil } from 'lodash';
import { ScorecardServiceRuleRow } from './ScorecardsServiceRuleRow';
import {
  CortexInfoCard,
  useCortexInfoCardStyles,
} from '../../Common/CortexInfoCard';
import useScorecardServiceRuleRowStyle from './useScorecardServiceRuleRowStyles';

interface ScorecardsServiceNextRulesProps {
  scorecardId: number;
  entityRef: AnyEntityRef;
}

export const ScorecardsServiceNextRules = ({
  entityRef,
  scorecardId,
}: ScorecardsServiceNextRulesProps) => {
  const {
    value,
    loading: nextStepsLoading,
    error: nextStepsError,
  } = useCortexApi(
    async cortexApi => {
      return await cortexApi.getServiceNextSteps(
        stringifyAnyEntityRef(entityRef),
        scorecardId,
      );
    },
    [entityRef],
  );
  const rulesCardClasses = useCortexInfoCardStyles();
  const scorecardServiceRuleRowClasses = useScorecardServiceRuleRowStyle();

  const nextSteps = value?.[0] ?? undefined;

  if (nextStepsLoading) {
    return <Progress />;
  }

  if (nextSteps === undefined || nextStepsError) {
    return (
      <WarningPanel
        severity="error"
        title="Ran into an error loading next steps for service."
      >
        {nextStepsError?.message}
      </WarningPanel>
    );
  }

  if (isNil(nextSteps.nextLevel) || isNil(nextSteps.rulesToComplete)) {
    return null;
  }

  return (
    <CortexInfoCard
      title={
        <Box display="flex" flexDirection="row">
          <Typography
            variant="body1"
            className={rulesCardClasses.cardHeaderTitle}
          >
            Tasks to advance to {nextSteps.nextLevel.name}
          </Typography>
          <ScorecardLadderLevelBadge
            name={nextSteps.nextLevel.name}
            color={nextSteps.nextLevel.color}
          />
        </Box>
      }
    >
      {nextSteps.rulesToComplete.map(rule => (
        <ScorecardServiceRuleRow
          key={`rule-to-complete-${rule.id}`}
          classes={scorecardServiceRuleRowClasses}
          rule={rule}
        />
      ))}
    </CortexInfoCard>
  );
};
