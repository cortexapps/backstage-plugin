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
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import {
  Content,
  InfoCard,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import { useAsync } from 'react-use';
import { cortexApiRef } from '../../../api';
import { scorecardServiceDetailsRouteRef } from '../../../routes';
import { compareRefs } from '../../../utils/ComponentUtils';
import { Gauge } from '../../Gauge';
import Box from '@material-ui/core/Box';
import { DefaultEntityRefLink } from '../../DefaultEntityLink';
import { ScorecardsTableRowDetails } from '../ScorecardDetailsPage/ScorecardsTableCard/ScorecardsTableRowDetails';
import { ScorecardsServiceProgress } from './ScorecardsServiceProgress';

export const ScorecardsServicePage = () => {
  const cortexApi = useApi(cortexApiRef);

  const { scorecardId, kind, namespace, name } = useRouteRefParams(
    scorecardServiceDetailsRouteRef,
  );

  const entityRef = { kind, namespace, name };

  const {
    value: score,
    loading,
    error,
  } = useAsync(async () => {
    const allScores = await cortexApi.getScorecardScores(scorecardId);
    return allScores.find(serviceScore =>
      compareRefs(serviceScore.componentRef, entityRef),
    );
  }, []);

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
          <Gauge value={score.scorePercentage} strokeWidth={8} trailWidth={8} />
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
            <ScorecardsTableRowDetails score={score} />
          </InfoCard>
        </Grid>
        <Grid item lg={8} xs={12}>
          <InfoCard title="Score Progress">
            <ScorecardsServiceProgress entityRef={entityRef} />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
