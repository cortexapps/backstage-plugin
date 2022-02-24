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
import { Grid, Typography } from '@material-ui/core';
import { InfoCard, Progress, WarningPanel } from '@backstage/core-components';
import LoyaltyIcon from '@material-ui/icons/Loyalty';
import { useDetailCardStyles } from '../../../styles/styles';
import { useEntityFromUrl } from '@backstage/plugin-catalog-react';
import { useCortexApi } from '../../../utils/hooks';
import { stringifyAnyEntityRef } from '../../../utils/types';
import { ruleName } from '../../../api/types';

interface ScorecardsServiceNextRulesProps {
  scorecardId: number;
}

export const ScorecardsServiceNextRules = ({
  scorecardId,
}: ScorecardsServiceNextRulesProps) => {
  const classes = useDetailCardStyles();

  const { entity } = useEntityFromUrl();

  const {
    value,
    loading: nextStepsLoading,
    error: nextStepsError,
  } = useCortexApi(
    async cortexApi => {
      return entity !== undefined
        ? await cortexApi.getServiceNextSteps(
            stringifyAnyEntityRef(entity),
            scorecardId,
          )
        : undefined;
    },
    [entity],
  );

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

  return (
    <InfoCard title="Ladder Progress" className={classes.root}>
      <Grid container direction="column">
        <Grid item>
          {nextSteps.currentLevel !== undefined ? (
            <Typography variant="subtitle1" className={classes.level}>
              <b>Current Level: </b> {nextSteps.currentLevel.name}
              <LoyaltyIcon
                style={{ color: `${nextSteps.currentLevel.color}` }}
              />
            </Typography>
          ) : (
            <Typography variant="subtitle1" className={classes.level}>
              This service hasn't achieved any levels yet.
            </Typography>
          )}
        </Grid>
        <Grid item>
          {nextSteps.nextLevel !== undefined ? (
            <Typography variant="subtitle1" className={classes.level}>
              <b>Next Level: </b> {nextSteps.nextLevel.name}
              <LoyaltyIcon style={{ color: `${nextSteps.nextLevel.color}` }} />
              <br />
              Complete these rules to get to the next level:
              <br />
              {nextSteps.rulesToComplete.map(rule => (
                <i key={`NextRule-${rule.id}`}>
                  &#8226; {ruleName(rule)}
                  <br />
                </i>
              ))}
            </Typography>
          ) : (
            <Typography variant="subtitle1" className={classes.level}>
              Congratulations!! This service has achieved all levels!
            </Typography>
          )}
        </Grid>
      </Grid>
    </InfoCard>
  );
};
