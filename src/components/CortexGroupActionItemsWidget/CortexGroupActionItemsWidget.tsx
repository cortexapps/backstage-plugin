/*
 * Copyright 2023 Cortex Applications, Inc.
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
import { useCortexApi, useInitiativesCustomName } from '../../utils/hooks';
import { stringifyAnyEntityRef } from '../../utils/types';
import {
  EmptyState,
  InfoCard,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import React from 'react';
import { isUndefined } from 'lodash';
import { GroupComponentActionItemsRow } from './GroupComponentActionItemsRow';
import { Grid } from '@material-ui/core';
import { groupByString, mapValues } from '../../utils/collections';
import { parseEntityRef } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../utils/ComponentUtils';

export const CortexGroupActionItemsWidget = () => {
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

  const { plural: initiativesName } = useInitiativesCustomName();

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
      <WarningPanel severity="error" title="Could not load group action items.">
        {actionItemsError?.message}
      </WarningPanel>
    );
  }

  if (initiativeActionItems.length === 0) {
    return (
      <EmptyState
        missing="info"
        title="No group action items to display"
        description={`The group does not have any action items for the ${initiativesName} it is part of.`}
      />
    );
  }

  const componentRefToInitiativeActionItems = groupByString(
    initiativeActionItems,
    initiativeActionItem => initiativeActionItem.componentRef,
  );

  const componentRefToRuleToInitiative = mapValues(
    componentRefToInitiativeActionItems,
    items => groupByString(items, item => item.rule.expression),
  );

  return (
    <InfoCard title="Group Action Items">
      <Grid container direction="column">
        {Object.keys(componentRefToRuleToInitiative).map(componentRef => (
          <GroupComponentActionItemsRow
            key={`${componentRef}-key`}
            componentRef={parseEntityRef(
              componentRef,
              defaultComponentRefContext,
            )}
            ruleToInitiativeActionItem={
              componentRefToRuleToInitiative[componentRef]
            }
          />
        ))}
      </Grid>
    </InfoCard>
  );
};
