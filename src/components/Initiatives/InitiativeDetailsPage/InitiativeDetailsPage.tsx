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
import React, { useMemo, useState } from 'react';
import { cortexApiRef } from '../../../api';
import { useAsync } from 'react-use';
import {
  Content,
  ContentHeader,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { Grid } from '@material-ui/core';
import { initiativeRouteRef } from '../../../routes';
import { InitiativeMetadataCard } from './InitiativeMetadataCard';
import { InitiativeTableCard } from './InitiativeTableCard';
import { InitiativeFilterCard } from './InitiativeFilterCard';
import { Predicate } from '../../../utils/types';
import { InitiativeStatsCard } from './InitiativeStatsCard';

export const InitiativeDetailsPage = () => {
  const { id: initiativeId } = useRouteRefParams(initiativeRouteRef);

  const cortexApi = useApi(cortexApiRef);

  // Have to store lambda of lambda for React to not eagerly invoke
  const [filter, setFilter] = useState<() => Predicate<string>>(
    () => () => true,
  );

  const { value, loading, error } = useAsync(async () => {
    return await Promise.all([
      cortexApi.getInitiative(+initiativeId),
      cortexApi.getInitiativeActionItems(+initiativeId),
    ]);
  }, []);

  const [initiative, actionItems] = value ?? [undefined, undefined];

  const filteredComponentRefs = useMemo(() => {
    return (
      initiative?.scores?.map(score => score.componentRef)?.filter(filter) ?? []
    );
  }, [initiative, filter]);

  if (loading) {
    return <Progress />;
  }

  if (error || initiative === undefined || actionItems === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load Initiative.">
        {error?.message ?? ''}
      </WarningPanel>
    );
  }

  return (
    <Content>
      <ContentHeader title={initiative.name} />
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <InitiativeMetadataCard initiative={initiative} />
          <InitiativeFilterCard
            initiative={initiative}
            actionItems={actionItems}
            setFilter={newFilter => setFilter(() => newFilter)}
          />
        </Grid>
        <Grid item lg={8} xs={12}>
          <InitiativeStatsCard
            scores={initiative?.scores ?? []}
            actionItems={actionItems}
            filter={filter}
          />
          <InitiativeTableCard
            componentRefs={filteredComponentRefs}
            numRules={initiative.emphasizedRules.length}
            actionItems={actionItems}
          />
        </Grid>
      </Grid>
    </Content>
  );
};
