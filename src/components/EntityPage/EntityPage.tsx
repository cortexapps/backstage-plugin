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
import React, { useEffect, useMemo, useState } from 'react';
import {
  Content,
  EmptyState,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { EntityScorecardsCard } from './EntityScorecardsCard';
import { useEntityFromUrl } from '@backstage/plugin-catalog-react';
import { EntityScorecardOverview } from './EntityScorecardOverview';
import { stringifyAnyEntityRef } from '../../utils/types';
import { useCortexApi } from '../../utils/hooks';
import { EntityScorecardRules } from './EntityScorecardRules';

export const EntityPage = () => {
  const {
    entity,
    loading: entityLoading,
    error: entityError,
  } = useEntityFromUrl();
  const [selectedScorecardId, setSelectedScorecardId] = useState<
    number | undefined
  >();

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
    const first = scores?.[0];
    if (first !== undefined) {
      setSelectedScorecardId(first.scorecard.id);
    }
  }, [scores, setSelectedScorecardId]);

  const selectedScore = useMemo(() => {
    return scores?.find(score => score.scorecard.id === selectedScorecardId);
  }, [scores, selectedScorecardId]);

  if (entityLoading || scoresLoading) {
    return <Progress />;
  }

  if (entity === undefined || entityError) {
    return (
      <WarningPanel severity="error" title="Could not load entity.">
        {entityError?.message}
      </WarningPanel>
    );
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

  return (
    <Content>
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <EntityScorecardsCard
            scores={scores}
            onSelect={setSelectedScorecardId}
            selectedScorecardId={selectedScorecardId}
          />
        </Grid>
        <Grid item lg={8}>
          <EntityScorecardOverview score={selectedScore} />
          <EntityScorecardRules score={selectedScore} />
        </Grid>
      </Grid>
    </Content>
  );
};
