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
import React, { useEffect, useMemo, useState } from 'react';
import {
  Content,
  ContentHeader,
  EmptyState,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { EntityScorecardsCard } from './EntityScorecardsCard';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyAnyEntityRef } from '../../utils/types';
import { useCortexApi } from '../../utils/hooks';
import { EntityScorecardDetails } from './EntityScorecardDetails';
import { ScorecardServiceRefLink } from '../ScorecardServiceRefLink';
import { useLocation } from 'react-router';

export const EntityPage = () => {
  const { entity } = useEntity();
  const [selectedScorecardId, setSelectedScorecardId] = useState<
    number | undefined
    >();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryScorecardId = Number(queryParams.get('scorecardId') ?? undefined);
  const initialScorecardId = Number.isNaN(queryScorecardId)
    ? undefined
    : queryScorecardId;



  const {
    value: scores,
    loading: scoresLoading,
    error: scoresError,
  } = useCortexApi(
    async cortexApi => {
      return entity !== undefined
        ? await cortexApi.getServiceScores(stringifyAnyEntityRef(entity))
        : undefined;
    },
    [entity],
  );

  useEffect(() => {
    const scorecardId = initialScorecardId ?? scores?.[0].scorecard.id;
    if (scorecardId !== undefined) {
      setSelectedScorecardId(scorecardId);
    }
  }, [initialScorecardId, scores, setSelectedScorecardId]);

  const selectedScore = useMemo(() => {
    return scores?.find(score => score.scorecard.id === selectedScorecardId);
  }, [scores, selectedScorecardId]);

  if (scoresLoading) {
    return <Progress />;
  }

  if (scoresError || scores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scorecards.">
        {scoresError?.message}
      </WarningPanel>
    );
  }

  if (scores.length === 0) {
    return (
      <EmptyState
        missing="info"
        title="No scorecards to display"
        description="You haven't added any scorecards yet."
      />
    );
  }

  if (selectedScorecardId === undefined) {
    return <EmptyState missing="data" title="Select a scorecard" />;
  }

  if (selectedScore === undefined) {
    return (
      <WarningPanel
        severity="error"
        title="Scorecard has not been evaluated."
      />
    );
  }

  return (
    <Content>
      <ContentHeader title="Scorecards">
        <ScorecardServiceRefLink
          scorecardId={selectedScore.scorecard.id}
          componentRef={stringifyAnyEntityRef(entity)}
        >
          <b>View all details</b>
        </ScorecardServiceRefLink>
      </ContentHeader>
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <EntityScorecardsCard
            scores={scores}
            onSelect={setSelectedScorecardId}
            selectedScorecardId={selectedScorecardId}
          />
        </Grid>
        <Grid item lg={8}>
          <EntityScorecardDetails
            scorecardId={selectedScorecardId}
            score={selectedScore}
          />
        </Grid>
      </Grid>
    </Content>
  );
};
