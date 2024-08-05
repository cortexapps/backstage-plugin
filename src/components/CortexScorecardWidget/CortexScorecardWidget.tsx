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
import React, { useMemo } from 'react';
import { useCortexApi } from '../../utils/hooks';
import { stringifyAnyEntityRef } from '../../utils/types';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { EntityScorecardsCard } from '../EntityPage/EntityScorecardsCard';
import { EmptyState, Progress, WarningPanel } from '@backstage/core-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { hasText } from '../../utils/SearchUtils';
import { ServiceScorecardScore } from '../../api/types';

interface ScorecardFilters {
  ids?: number[];
  names?: string[];
  scores?: number[];
}

export interface CortexScorecardWidgetProps {
  includeFilters?: ScorecardFilters;
  excludeFilters?: ScorecardFilters;
}

const isScoreFiltered = (
  score: ServiceScorecardScore,
  filters: ScorecardFilters,
) => {
  const filteredById =
    filters?.ids && filters?.ids?.length !== 0
      ? filters?.ids?.includes(score.scorecard.id)
      : false;
  const filteredByName =
    filters?.names && filters?.names?.length !== 0
      ? filters?.names
          ?.map(name => name.toLowerCase())
          ?.reduce(
            (includes: boolean, query: string) =>
              includes || hasText(score, 'scorecard.name', query),
            false,
          )
      : false;
  const filteredByScore =
    filters?.scores && filters?.scores?.length !== 0
      ? filters?.scores?.includes(score.score.scorePercentage)
      : false;
  return filteredById || filteredByName || filteredByScore;
};

export const CortexScorecardWidget = ({
  includeFilters,
  excludeFilters,
}: CortexScorecardWidgetProps) => {
  const {
    entity,
    loading: entityLoading,
    error: entityError,
  } = useAsyncEntity();
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
      scores?.filter(score => {
        if (includeFilters === undefined && excludeFilters === undefined) {
          return true;
        }

        return (
          (includeFilters !== undefined &&
            isScoreFiltered(score, includeFilters)) ||
          (excludeFilters !== undefined &&
            !isScoreFiltered(score, excludeFilters))
        );
      }),
    [scores, includeFilters, excludeFilters],
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
      <WarningPanel severity="error" title="Could not load Scorecards.">
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
      onSelect={scorecardId => {
        const target = location.pathname.endsWith('/') ? 'cortex' : '/cortex';
        navigate(`${location.pathname}${target}?scorecardId=${scorecardId}`);
      }}
    />
  );
};
