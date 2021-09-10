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
import { scorecardServiceDetailsRouteRef } from '../../../../../routes';
import {
  Content,
  ContentHeader,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useAsync } from 'react-use';
import { cortexApiRef } from '../../../../../api';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(styles => ({
  header: {
    height: '100%',
  },
}));

export const ScorecardsServicePage = () => {
  const cortexApi = useApi(cortexApiRef);
  const classes = useStyles();

  const { scorecardId, serviceId } = useRouteRefParams(
    scorecardServiceDetailsRouteRef,
  );

  const {
    value: scorecard,
    loading,
    error,
  } = useAsync(async () => {
    await Promsie.all(
      cortexApi.getScorecard(scorecardId),
      cortexApi.getScorecard(),
    );
  }, []);

  if (loading) {
    return <Progress />;
  }

  if (error || scorecard === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scorecard.">
        {error?.message ?? ''}
      </WarningPanel>
    );
  }

  return (
    <Content>
      {/*<Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">*/}
      {/*  <Box alignSelf="center">*/}
      {/*    <ArrowBackIcon/>*/}
      {/*  </Box>*/}
      {/*  <Box alignSelf="center" height="100%">*/}
      {/*    <Typography variant="subtitle1" className={classes.header}>*/}
      {/*      Back to overview*/}
      {/*    </Typography>*/}
      {/*  </Box>*/}
      {/*</Box>*/}

      <ContentHeader title={scorecard.name} />
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <ScorecardMetadataCard scorecard={scorecard} scores={scores} />
          <ScorecardRulesCard scorecard={scorecard} />
          <ScorecardFilterCard
            scorecard={scorecard}
            setFilter={newFilter => setFilter(() => newFilter)}
          />
        </Grid>
        <Grid item lg={8} xs={12}>
          <ScorecardsTableCard
            scorecardId={scorecard.id}
            scores={filteredScores}
          />
        </Grid>
      </Grid>
    </Content>
  );
};
