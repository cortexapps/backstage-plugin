/*
 * Copyright 2021 Cortex Applications, Inc.
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
import {
  Initiative,
  InitiativeActionItem,
  ScorecardServiceScore,
} from '../../../../api/types';
import { FilterCard } from '../../../FilterCard';
import { mapByString, mapValues } from '../../../../utils/collections';
import { Predicate } from '../../../../utils/types';
import { useGroupsAndSystemsFilters } from '../../../../utils/hooks';
import { Progress } from '@backstage/core-components';

const createRulePredicate = (
  rule: string,
  actionItems: InitiativeActionItem[],
  pass: boolean,
) => {
  return (componentRef: string) => {
    const passed = !actionItems.some(
      actionItem =>
        actionItem.componentRef === componentRef &&
        actionItem.rule.expression === rule,
    );

    return passed === pass;
  };
};

interface InitiativeFilterCardProps {
  initiative: Initiative;
  actionItems: InitiativeActionItem[];
  setFilter: (filter: Predicate<string>) => void;
}

export const InitiativeFilterCard = ({
  initiative,
  actionItems,
  setFilter,
}: InitiativeFilterCardProps) => {
  const ruleFilterDefinitions = useMemo(() => {
    return mapValues(
      mapByString(initiative.emphasizedRules, rule => rule.ruleId),
      rule => {
        return {
          display: rule.expression,
          value: rule.expression,
        };
      },
    );
  }, [initiative.emphasizedRules]);

  const { loading, groups, systems } = useGroupsAndSystemsFilters(
    initiative.scores.map(score => score.componentRef),
    (componentRef: string) => componentRef,
  );

  if (loading) {
    return <Progress />;
  }

  return (
    <FilterCard
      setFilter={setFilter}
      filterDefinitions={[
        {
          name: 'Failing Rule',
          filters: ruleFilterDefinitions,
          generatePredicate: rule =>
            createRulePredicate(rule, actionItems, false),
        },
        {
          name: 'Passing Rule',
          filters: ruleFilterDefinitions,
          generatePredicate: rule =>
            createRulePredicate(rule, actionItems, true),
        },
        ...(groups
          ? [
              {
                name: 'Groups',
                filters: groups.definition,
                generatePredicate: (groupRef: string) =>
                  groups.predicate(groupRef),
              },
            ]
          : []),
        ...(systems
          ? [
              {
                name: 'Systems',
                filters: systems.definition,
                generatePredicate: (systemRef: string) =>
                  systems.predicate(systemRef),
              },
            ]
          : []),
      ]}
    />
  );
};
