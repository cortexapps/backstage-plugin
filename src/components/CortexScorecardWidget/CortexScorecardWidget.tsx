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
import React, { useMemo } from 'react';
import { useCortexApi } from '../../utils/hooks';
import { stringifyAnyEntityRef } from '../../utils/types';
import { useEntity } from '@backstage/plugin-catalog-react';
import { EntityScorecardsCard } from '../EntityPage/EntityScorecardsCard';
import { EmptyState, Progress, WarningPanel } from '@backstage/core-components';
import { useNavigate, useLocation } from 'react-router';
import { hasText } from '../../utils/SearchUtils';

interface ScorecardFilter {
  id?: number;
  name?: string;
}

interface CortexScorecardWidgetProps {
  filters?: ScorecardFilter[];
}

export const CortexScorecardWidget = ({
  filters,
}: CortexScorecardWidgetProps) => {
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

  const scoresToDisplay = useMemo(
    () =>
      scores?.filter(score =>
        filters
          ? filters.reduce((include: boolean, filter: ScorecardFilter) => {
              const includedById = filter?.id
                ? score.scorecard.id === filter?.id
                : false;
              const includedByName = filter?.name
                ? hasText(score, 'scorecard.name', filter?.name)
                : false;

              return include || includedById || includedByName;
            }, false)
          : true,
      ),
    [scores, filters],
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

  if (scoresError || scoresToDisplay === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scorecards.">
        {scoresError?.message}
      </WarningPanel>
    );
  }

  if (scoresToDisplay.length === 0) {
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
      title={'Cortex Scorecards'}
      scores={scoresToDisplay}
      onSelect={scorecardId =>
        navigate(`${location.pathname}/cortex?scorecardId=${scorecardId}`)
      }
    />
  );
};
