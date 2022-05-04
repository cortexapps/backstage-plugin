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

import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { useCortexApi } from '../../utils/hooks';
import { stringifyAnyEntityRef } from '../../utils/types';
import {
  EmptyState,
  InfoCard,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import React from 'react';
import { isUndefined } from 'lodash';
import { TeamServiceActionItemsRow } from './TeamServiceActionItemsRow';
import { Grid } from '@material-ui/core';
import { groupByString, mapValues } from '../../utils/collections';

export const CortexTeamActionItemsWidget = () => {
  const {
    entity,
    loading: entityLoading,
    error: entityError,
  } = useAsyncEntity();

  const {
    value: initiativeActionItems,
    loading: actionItemsLoading,
    error: actionItemsError,
  } = useCortexApi(
    async cortexApi => {
      return entity !== undefined
        ? await cortexApi.getInitiativeActionItemsForTeam(
            stringifyAnyEntityRef(entity),
          )
        : undefined;
    },
    [entity],
  );

  if (entityLoading || actionItemsLoading) {
    return <Progress />;
  }

  if (isUndefined(entity) || entityError) {
    return (
      <WarningPanel severity="error" title="Could not load entity.">
        {entityError?.message}
      </WarningPanel>
    );
  }

  if (actionItemsError || isUndefined(initiativeActionItems)) {
    return (
      <WarningPanel severity="error" title="Could not load team action items.">
        {actionItemsError?.message}
      </WarningPanel>
    );
  }

  if (initiativeActionItems.length === 0) {
    return (
      <EmptyState
        missing="info"
        title="No team action items to display"
        description="The team does not have any action items for the initiatives it is part of."
      />
    );
  }

  const serviceToInitiativeActionItems = groupByString(
    initiativeActionItems,
    initiativeActionItem => initiativeActionItem.componentRef,
  );

  const serviceToRuleToInitiative = mapValues(
    serviceToInitiativeActionItems,
    items => groupByString(items, item => item.rule.expression),
  );

  return (
    <InfoCard title="Team Action Items">
      <Grid container direction="column">
        {Object.keys(serviceToRuleToInitiative).map(service => (
          <TeamServiceActionItemsRow
            key={`${service}-key`}
            serviceComponentRef={{
              kind: 'component',
              namespace: entity.metadata.namespace ?? 'default',
              name: service,
            }}
            ruleToInitiativeActionItem={serviceToRuleToInitiative[service]}
          />
        ))}
      </Grid>
    </InfoCard>
  );
};
