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
import React, { useMemo } from 'react';
import {
  Initiative,
  InitiativeActionItem,
  ruleName,
} from '../../../../api/types';
import { FilterCard } from '../../../FilterCard';
import { mapByString, mapValues } from '../../../../utils/collections';
import {
  AnyEntityRef,
  Predicate,
  stringifyAnyEntityRef,
} from '../../../../utils/types';
import { useFilters } from '../../../../utils/hooks';
import { Progress } from '@backstage/core-components';
import {
  humanizeEntityRef,
  getEntityRelations,
} from '@backstage/plugin-catalog-react';
import {
  parseEntityRef,
  RELATION_OWNED_BY,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  defaultGroupRefContext,
  defaultSystemRefContext,
} from '../../../../utils/ComponentUtils';

const createRulePredicate = (
  rule: string,
  actionItems: InitiativeActionItem[],
  pass: boolean,
) => {
  return (componentRef: AnyEntityRef) => {
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
      mapByString(initiative.emphasizedRules, rule => `${rule.ruleId}`),
      rule => {
        return {
          display: ruleName(rule),
          value: rule.expression,
          id: rule.ruleId.toString(),
        };
      },
    );
  }, [initiative.emphasizedRules]);

  const { filterGroups, loading } = useFilters(
    (entityRef: string) => entityRef,
    {
      baseFilters: [
        {
          name: 'Groups',
          groupProperty: entity =>
            getEntityRelations(entity, RELATION_OWNED_BY, {
              kind: 'group',
            }).map(entityRef =>
              stringifyAnyEntityRef(entityRef, { defaultKind: 'group' }),
            ),
          formatProperty: (groupRef: string) =>
            humanizeEntityRef(parseEntityRef(groupRef), defaultGroupRefContext),
        },
        {
          name: 'Systems',
          groupProperty: entity =>
            getEntityRelations(entity, RELATION_PART_OF, {
              kind: 'system',
            }).map(entityRef =>
              stringifyAnyEntityRef(entityRef, { defaultKind: 'system' }),
            ),
          formatProperty: (groupRef: string) =>
            humanizeEntityRef(
              parseEntityRef(groupRef),
              defaultSystemRefContext,
            ),
        },
      ],
    },
  );

  if (loading || filterGroups === undefined) {
    return <Progress />;
  }

  return (
    <FilterCard
      setFilter={setFilter}
      filterDefinitions={[
        {
          name: 'Failing Rule',
          filters: ruleFilterDefinitions,
          generatePredicate: (rule: string) =>
            createRulePredicate(rule, actionItems, false),
        },
        {
          name: 'Passing Rule',
          filters: ruleFilterDefinitions,
          generatePredicate: (rule: string) =>
            createRulePredicate(rule, actionItems, true),
        },
        ...filterGroups,
      ]}
    />
  );
};
