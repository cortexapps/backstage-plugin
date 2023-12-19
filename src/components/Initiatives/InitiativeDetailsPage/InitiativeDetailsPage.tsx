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
import React, { useMemo, useState } from 'react';
import { cortexApiRef } from '../../../api';
import { useAsync } from 'react-use';
import { Content, Progress, WarningPanel } from '@backstage/core-components';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { Box, Button, Grid, Tab, Tabs } from '@material-ui/core';
import { initiativeRouteRef } from '../../../routes';
import { Predicate } from '../../../utils/types';
import { InitiativeStatsCard } from './InitiativeStatsCard';
import { useEntitiesByTag } from '../../../utils/hooks';
import { InitiativeMetadataCard } from './InitiativeMetadataCard';
import { InitiativeFailingTab } from './InitiativeFailingTab';
import { InitiativePassingTab } from './InitiativePassingTab';
import { InitiativeLevelsTab } from './InitiativeLevelsTab/InitiativeLevelsTab';
import { InitiativeRulesTab } from './InitiativeRulesTab';
import { isEmpty, isNil } from 'lodash';
import { InitiativeFilterDialog } from './InitativeFilterDialog';

enum InitiativeDetailsTab {
  'Failing' = 'Failing',
  'Passing' = 'Passing',
  'Levels' = 'Levels',
  'Rules' = 'Rules',
}

export const InitiativeDetailsPage = () => {
  const { id: initiativeId } = useRouteRefParams(initiativeRouteRef);
  const cortexApi = useApi(cortexApiRef);

  const [activeTab, setActiveTab] = useState(InitiativeDetailsTab.Failing);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

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

  const { entitiesByTag, loading: loadingEntities } = useEntitiesByTag();

  const [initiative, actionItems] = value ?? [undefined, undefined];

  const filteredComponentRefs = useMemo(() => {
    return (
      initiative?.scores?.map(score => score.entityTag)?.filter(filter) ?? []
    );
  }, [initiative, filter]);

  const filteredActionItems = useMemo(() => {
    if (isNil(actionItems)) {
      return actionItems;
    }

    return actionItems.filter(actionItem =>
      filteredComponentRefs.some(
        componentRef => actionItem.componentRef === componentRef,
      ),
    );
  }, [actionItems, filteredComponentRefs]);

  const handleTabChange = (
    _event: React.ChangeEvent<{}>,
    newValue: InitiativeDetailsTab,
  ) => {
    setActiveTab(newValue);
  };

  const handleFilterDialogClose = () => {
    setIsFilterDialogOpen(false);
  };

  if (loading || loadingEntities) {
    return <Progress />;
  }

  if (error || initiative === undefined || filteredActionItems === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load Initiative.">
        {error?.message ?? ''}
      </WarningPanel>
    );
  }

  const renderTab = (tabName: InitiativeDetailsTab) => {
    switch (tabName) {
      case InitiativeDetailsTab.Failing:
        return (
          <InitiativeFailingTab
            actionItems={filteredActionItems}
            entitiesByTag={entitiesByTag}
            numRules={initiative.rules.length}
            scorecardId={initiative.scorecard.id}
          />
        );
      case InitiativeDetailsTab.Passing:
        return (
          <InitiativePassingTab
            actionItems={actionItems}
            componentRefs={filteredComponentRefs}
            entitiesByTag={entitiesByTag}
            numRules={initiative.rules.length}
            scorecardId={initiative.scorecard.id}
          />
        );
      case InitiativeDetailsTab.Levels:
        return (
          <InitiativeLevelsTab
            levels={initiative.levels}
            rules={initiative.rules}
          />
        );
      case InitiativeDetailsTab.Rules:
        return <InitiativeRulesTab rules={initiative.rules} />;
    }
  };

  return (
    <Content>
      <Grid container direction="row" spacing={1}>
        <Grid item lg={5} xs={12}>
          <InitiativeMetadataCard initiative={initiative} />
        </Grid>
        <Grid item lg={7} xs={12}>
          <Box display="flex" flexDirection="column">
            <InitiativeStatsCard
              scores={initiative?.scores ?? []}
              actionItems={filteredActionItems}
              filter={filter}
            />
          </Box>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Tabs
          value={activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
        >
          <Tab
            label={InitiativeDetailsTab.Failing}
            value={InitiativeDetailsTab.Failing}
          />
          <Tab
            label={InitiativeDetailsTab.Passing}
            value={InitiativeDetailsTab.Passing}
          />
          {!isEmpty(initiative?.levels) ? (
            <Tab
              label={InitiativeDetailsTab.Levels}
              value={InitiativeDetailsTab.Levels}
            />
          ) : (
            <Tab
              label={InitiativeDetailsTab.Rules}
              value={InitiativeDetailsTab.Rules}
            />
          )}
        </Tabs>
        {activeTab === InitiativeDetailsTab.Failing && (
          <Button
            onClick={() => setIsFilterDialogOpen(true)}
            variant="outlined"
            aria-label="Filter"
          >
            filter
          </Button>
        )}
      </Box>
      <Box my={1}>{renderTab(activeTab)}</Box>
      <InitiativeFilterDialog
        isOpen={isFilterDialogOpen}
        actionItems={actionItems}
        initiative={initiative}
        handleClose={handleFilterDialogClose}
        setFilter={(filter: any) => setFilter(() => filter)}
      />
    </Content>
  );
};
