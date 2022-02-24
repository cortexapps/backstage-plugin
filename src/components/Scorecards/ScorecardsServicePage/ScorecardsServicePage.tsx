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
import React, { useEffect, useState } from 'react';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import {
  Content,
  InfoCard,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useAsync } from 'react-use';
import { cortexApiRef } from '../../../api';
import { scorecardServiceDetailsRouteRef } from '../../../routes';
import { Gauge } from '../../Gauge';
import Box from '@material-ui/core/Box';
import { DefaultEntityRefLink } from '../../DefaultEntityLink';
import { ScorecardResultDetails } from '../ScorecardDetailsPage/ScorecardsTableCard/ScorecardResultDetails';
import { ScorecardsServiceProgress } from './ScorecardsServiceProgress';
import { entityEquals } from '../../../utils/types';
import { ScorecardsServiceNextRules } from './ScorecardsServiceNextRules';
import { ScorecardServiceScoresRule } from '../../../api/types';

const useStyles = makeStyles({
  progress: {
    height: '100%',
  },
});

export const ScorecardsServicePage = () => {
  const cortexApi = useApi(cortexApiRef);

  const { scorecardId, kind, namespace, name } = useRouteRefParams(
    scorecardServiceDetailsRouteRef,
  );

  const entityRef = { kind, namespace, name };

  const classes = useStyles();

  const [selectedRules, setSelectedRules] = useState<
    ScorecardServiceScoresRule[]
  >([]);

  const { value, loading, error } = useAsync(async () => {
    const allScores = await cortexApi.getScorecardScores(+scorecardId);
    const ladders = await cortexApi.getScorecardLadders(+scorecardId);

    const score = allScores.find(serviceScore =>
      entityEquals(serviceScore.componentRef, entityRef),
    );

    return { score, ladders };
  }, []);

  const { score, ladders } = value ?? { score: undefined, ladders: [] };

  useEffect(() => {
    setSelectedRules(score?.rules ?? []);
  }, [score]);

  if (loading) {
    return <Progress />;
  }

  if (error || score === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scores.">
        {error?.message ?? ''}
      </WarningPanel>
    );
  }

  // currently we only support 1 ladder per Scorecard
  const ladder = ladders?.[0];

  return (
    <Content>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        style={{ marginBottom: '20px' }}
      >
        <Box alignSelf="center" width={1 / 16}>
          <Gauge
            value={score.scorePercentage}
            strokeWidth={10}
            trailWidth={10}
          />
        </Box>
        <Box alignSelf="center" textAlign="center">
          <Typography variant="h4" component="h2">
            <DefaultEntityRefLink entityRef={entityRef} />
          </Typography>
        </Box>
      </Box>

      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <InfoCard title="Rules">
            <ScorecardResultDetails rules={selectedRules} />
          </InfoCard>
        </Grid>
        <Grid item lg={8} xs={12}>
          {ladder && <ScorecardsServiceNextRules scorecardId={+scorecardId} />}
          <InfoCard title="Score Progress" className={classes.progress}>
            <ScorecardsServiceProgress
              scorecardId={scorecardId}
              entityRef={entityRef}
              setSelectedRules={setSelectedRules}
            />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
