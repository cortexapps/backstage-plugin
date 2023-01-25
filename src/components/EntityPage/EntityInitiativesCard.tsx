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
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../api';
import { useAsync } from 'react-use';
import { Entity } from '@backstage/catalog-model';
import {
  EmptyState,
  InfoCard,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { stringifyAnyEntityRef } from '../../utils/types';
import { ScorecardResultDetails } from '../Scorecards/ScorecardDetailsPage/ScorecardsTableCard/ScorecardResultDetails';
import { dedupeByString } from '../../utils/collections';
import { RuleOutcomeType } from '../../api/types';

interface EntityInitiativesCardProps {
  entity: Entity;
}

export const EntityInitiativesCard = ({
  entity,
}: EntityInitiativesCardProps) => {
  const cortexApi = useApi(cortexApiRef);

  const {
    value: actionItems,
    loading,
    error,
  } = useAsync(async () => {
    return await cortexApi.getComponentActionItems(
      stringifyAnyEntityRef(entity),
    );
  }, []);

  const dedupedActionItems = useMemo(() => {
    return actionItems
      ? dedupeByString(actionItems, actionItem => actionItem.rule.expression)
      : [];
  }, [actionItems]);

  if (loading) {
    return <Progress />;
  }

  if (error || actionItems === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load action items.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (actionItems.length === 0) {
    return (
      <EmptyState
        missing="info"
        title="No remaining action items. Keep it up!"
      />
    );
  }

  return (
    <InfoCard title="Action Items">
      <ScorecardResultDetails
        hideWeights
        ruleOutcomes={dedupedActionItems.map(actionItem => {
          return {
            rule: actionItem.rule,
            score: 0,
            type: RuleOutcomeType.APPLICABLE,
          };
        })}
      />
    </InfoCard>
  );
};
