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
import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useAsync } from 'react-use';
import { isEmpty, isNil, keyBy, mapValues } from 'lodash';
import { Content, Progress, WarningPanel } from '@backstage/core-components';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { Box, Button, Grid, Tab, Tabs } from '@material-ui/core';
import { cortexApiRef } from '../../../api';
import { initiativeRouteRef } from '../../../routes';
import { Predicate } from '../../../utils/types';
import { InitiativeStatsCard } from './InitiativeStatsCard';
import { useEntitiesByTag } from '../../../utils/hooks';
import { InitiativeMetadataCard } from './InitiativeMetadataCard';
import { InitiativeFailingTab } from './InitiativeFailingTab';
import { InitiativePassingTab } from './InitiativePassingTab';
import { InitiativeLevelsTab } from './InitiativeLevelsTab';
import { InitiativeRulesTab } from './InitiativeRulesTab';
import { InitiativeFilterDialog } from './InitativeFilterDialog';
import {
  InitiativeFilter,
  getFilterDefinitions,
  getPredicateFilterFromFilters,
  useFiltersFromQueryParams,
} from './InitativeFilterDialog/InitiativeFilterDialogUtils';
import {
  InitiativeActionItem,
  InitiativeWithScores,
  ruleName,
} from '../../../api/types';
import { HomepageEntity } from '../../../api/userInsightTypes';

enum InitiativeDetailsTab {
  'Failing' = 'Failing',
  'Passing' = 'Passing',
  'Levels' = 'Levels',
  'Rules' = 'Rules',
}

export interface InitiativeDetailsPageProps {
  initiative: InitiativeWithScores;
  actionItems: InitiativeActionItem[];
  entitiesByTag: Record<HomepageEntity['codeTag'], HomepageEntity>;
  userEntities: string[];
}

export const InitiativeDetailsPage: React.FC<InitiativeDetailsPageProps> = ({
  actionItems,
  entitiesByTag,
  initiative,
  userEntities,
}) => {
  const [activeTab, setActiveTab] = useState(InitiativeDetailsTab.Failing);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const location = useLocation();

  const { filters, oneOf } = useFiltersFromQueryParams(location.search);

  const ownerOptions = useMemo(() => {
    const actionItemEntityRefs = actionItems?.map(actionItem => {
      return actionItem.componentRef;
    });

    const actionItemEntities = actionItemEntityRefs?.map(
      (entityRef: string) => {
        return entitiesByTag[entityRef];
      },
    );

    return (
      actionItemEntities?.flatMap(entity => {
        return entity?.serviceOwnerEmails.map(emailOwner => emailOwner.email);
      }) ?? []
    );
  }, [actionItems, entitiesByTag]);

  const ownerOptionsMap = useMemo(() => {
    return ownerOptions.reduce((acc, email) => {
      acc[email] = {
        display: email,
        value: email,
        id: email,
      };

      return acc;
    }, {} as Record<string, { display: string; value: string; id: string }>);
  }, [ownerOptions]);

  const ruleFilterDefinitions = useMemo(() => {
    return mapValues(
      keyBy(initiative?.rules, rule => `${rule.ruleId}`),
      rule => {
        return {
          display: ruleName(rule),
          value: rule.expression,
          id: rule.ruleId.toString(),
        };
      },
    );
  }, [initiative?.rules]);

  const filterDefinitions = getFilterDefinitions({
    actionItems: actionItems ?? [],
    ownerOptionsMap,
    entitiesByTag,
    ruleFilterDefinitions,
    userEntities,
  });

  // Have to store lambda of lambda for React to not eagerly invoke
  const [filter, setFilter] = useState<() => Predicate<string>>(() => {
    return getPredicateFilterFromFilters(filters, oneOf, filterDefinitions);
  });

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
            Filter
          </Button>
        )}
      </Box>
      <Box my={1}>{renderTab(activeTab)}</Box>
      <InitiativeFilterDialog
        filtersDefinition={filterDefinitions}
        handleClose={handleFilterDialogClose}
        isOpen={isFilterDialogOpen}
        setFilter={(filter: InitiativeFilter) => setFilter(() => filter)}
      />
    </Content>
  );
};

const InitiativeDetailsPageWrapper: React.FC = () => {
  const { id: initiativeId } = useRouteRefParams(initiativeRouteRef);
  const cortexApi = useApi(cortexApiRef);

  const { value, loading, error } = useAsync(async () => {
    return await Promise.all([
      cortexApi.getInitiative(+initiativeId),
      cortexApi.getInitiativeActionItems(+initiativeId),
      cortexApi.getUserEntities(),
    ]);
  }, []);

  const [initiative, actionItems, userEntityIds] = value ?? [
    undefined,
    undefined,
    undefined,
  ];

  const { entitiesByTag, loading: loadingEntities } = useEntitiesByTag();

  const userEntities = Object.values(entitiesByTag)
    .filter(entity => userEntityIds?.entityIds.includes(entity.id))
    .map(entity => entity.codeTag);

  return loading || loadingEntities ? (
    <Progress />
  ) : error || initiative === undefined ? (
    <WarningPanel severity="error" title={`Could not load Initiative.`}>
      {error?.message ?? ''}
    </WarningPanel>
  ) : (
    <InitiativeDetailsPage
      actionItems={actionItems ?? []}
      entitiesByTag={entitiesByTag}
      initiative={initiative}
      userEntities={userEntities ?? []}
    />
  );
};

export default InitiativeDetailsPageWrapper;
