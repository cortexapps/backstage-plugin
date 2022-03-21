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
import { useCortexApi } from '../../utils/hooks';
import { stringifyAnyEntityRef } from '../../utils/types';
import { useEntity } from '@backstage/plugin-catalog-react';
import { EntityScorecardsCard } from '../EntityPage/EntityScorecardsCard';
import { EmptyState, Progress, WarningPanel } from '@backstage/core-components';
import { useNavigate, useLocation } from 'react-router';

export const CortexScorecardWidget = () => {
  const { entity, loading: entityLoading, error: entityError } = useEntity();
  const location = useLocation();
  const navigate = useNavigate();

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
    <EntityScorecardsCard
      scores={scores}
      onSelect={scorecardId =>
        navigate(`${location.pathname}cortex?scorecardId=${scorecardId}`)
      }
    />
  );
};
