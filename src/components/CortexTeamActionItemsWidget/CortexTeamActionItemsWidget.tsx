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
  Link,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import React from 'react';
import { isUndefined } from 'lodash';
import { MetadataItem } from '../MetadataItem';
import { DefaultEntityRefLink } from '../DefaultEntityLink';
import { useRouteRef } from '@backstage/core-plugin-api';
import { initiativeRouteRef } from '../../routes';
import { Grid, TableCell, TableRow } from '@material-ui/core';

export const CortexTeamActionItemsWidget = () => {
  const {
    entity,
    loading: entityLoading,
    error: entityError,
  } = useAsyncEntity();
  const initiativeRef = useRouteRef(initiativeRouteRef);

  const {
    value: serviceInitiativeActionItems,
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

  if (actionItemsError || isUndefined(serviceInitiativeActionItems)) {
    return (
      <WarningPanel severity="error" title="Could not load team action items.">
        {actionItemsError?.message}
      </WarningPanel>
    );
  }

  if (
    serviceInitiativeActionItems.flatMap(
      serviceInitiative => serviceInitiative.actionItems,
    ).length === 0
  ) {
    return (
      <EmptyState
        missing="info"
        title="No team action items to display"
        description="The team does not have any action items for the initiatives it is part of."
      />
    );
  }

  return (
    <InfoCard title="Team Action Items">
      {serviceInitiativeActionItems.map(serviceInitiativeActionItem => (
        <Grid
          key={serviceInitiativeActionItem.componentRef}
          // container
          // direction="column"
          spacing={2}
          // lg={4}
        >
          <DefaultEntityRefLink
            entityRef={{
              kind: 'component',
              namespace: entity.metadata.namespace ?? 'default',
              name: serviceInitiativeActionItem.componentRef,
            }}
          >
            <MetadataItem gridSizes={{ xs: 12 }} label={'Component name'}>
              {serviceInitiativeActionItem.componentRef}
            </MetadataItem>
          </DefaultEntityRefLink>
          {serviceInitiativeActionItem.actionItems.map(actionItem => (
            <TableRow key={actionItem.componentRef}>
              <TableCell>
                <Link
                  to={initiativeRef({
                    id: `${actionItem.initiative.initiativeId}`,
                  })}
                >
                  <Grid container direction="row" spacing={2}>
                    <MetadataItem gridSizes={{ xs: 12 }} label={'Initiative'}>
                      {actionItem.initiative.name}
                    </MetadataItem>
                    <MetadataItem gridSizes={{ xs: 12 }} label={'Rule'}>
                      {actionItem.rule.expression}
                    </MetadataItem>
                    <MetadataItem
                      gridSizes={{ xs: 12, sm: 6, lg: 4 }}
                      label={'Deadline'}
                    >
                      {actionItem.initiative.targetDate}
                    </MetadataItem>
                  </Grid>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </Grid>
      ))}
      <TableRow></TableRow>
    </InfoCard>
  );
};
