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
import { isEmpty, isNil } from 'lodash';
import {
  RELATION_OWNED_BY,
  parseEntityRef,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  getEntityRelations,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import { EntityFilterGroup } from '@cortexapps/backstage-plugin-extensions';
import {
  defaultGroupRefContext,
  defaultSystemRefContext,
} from '../../../../utils/ComponentUtils';
import {
  AnyEntityRef,
  Predicate,
  combinePredicates,
  stringifyAnyEntityRef,
} from '../../../../utils/types';
import {
  FilterDefinition,
  FilterDefinitionWithPredicate,
  FilterValue,
} from '../../../FilterCard/Filters';
import { InitiativeActionItem } from '../../../../api/types';
import { HomepageEntity } from '../../../../api/userInsightTypes';

export type InitiativeFilter = Predicate<string>;
export type FilterShape = Record<string, boolean>;

export enum FilterDefinitionName {
  FailingRules = 'Failing rules',
  PassingRules = 'Passing rules',
  EmailOwners = 'Email owners',
  ShowActionItemsFor = 'myEntities',
}

export const groupAndSystemFilters: EntityFilterGroup[] = [
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
      humanizeEntityRef(parseEntityRef(groupRef), defaultSystemRefContext),
  },
];

export const toPredicateFilters = (filters: FilterShape, name: string) => {
  return Object.keys(filters)
    .filter(key => key.includes(name))
    .reduce<Record<string, boolean>>((acc, key) => {
      const newKey = key.replace(name, '');
      acc[newKey] = filters[key];
      return acc;
    }, {});
};

export const getPredicateFilterFromFilters = (
  filters: FilterShape,
  oneOf: Record<string, boolean>,
  filterDefinitions: FilterDefinitionWithPredicate<string>[],
) => {
  const allFilters = filterDefinitions.reduce<
    Record<string, Predicate<string>>
  >((acc, filter) => {
    const predicateFilters = toPredicateFilters(filters, filter.name);

    const filterOneOf = oneOf[filter.name] ?? true;

    acc[filter.name] = (componentRef: string) => {
      if (isEmpty(predicateFilters)) {
        return true;
      }

      const results = Object.keys(predicateFilters)
        .filter(id => predicateFilters[id] && !isNil(filter.filters[id]))
        .map(id =>
          filter.generatePredicate(filter.filters[id].value)(componentRef),
        );

      return (
        isEmpty(results) ||
        (filterOneOf ? results.some(Boolean) : results.every(Boolean))
      );
    };

    return acc;
  }, {});

  return combinePredicates(Object.values(allFilters));
};

const oneOfPrefix = 'oneOf__';

export const toQueryParams = (
  filters: FilterShape,
  oneOf: Record<string, boolean>,
  filterDefinitions: FilterDefinition[],
) => {
  const result: Record<string, string[]> = Object.entries(filters).reduce(
    (acc, [key, value]) => {
      if (!value) {
        return acc;
      }

      const filter = filterDefinitions.find(filter =>
        key.includes(filter.name),
      );

      if (!filter) {
        return acc;
      }

      const filterEntry = key.replace(filter.name, '');

      if (!acc[filter.name]) {
        acc[filter.name] = [];
      }
      acc[filter.name].push(filterEntry);

      return acc;
    },
    {} as Record<string, string[]>,
  );

  const oneOfResult: Record<string, boolean> = Object.entries(oneOf).reduce(
    (acc, [key, value]) => {
      if (!value) {
        acc[`${oneOfPrefix}${key}`] = false;
      }
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return {
    ...oneOfResult,
    ...result,
  };
};

export const useFiltersFromQueryParams = (queryParams: string) => {
  const searchParams = new URLSearchParams(queryParams);

  const filters: Record<string, boolean> = {};
  const oneOf: Record<string, boolean> = {};

  searchParams.forEach((value, key) => {
    if (key.startsWith(oneOfPrefix)) {
      oneOf[key.replace(oneOfPrefix, '')] = value === 'true';
    } else {
      const filterName = Object.values(FilterDefinitionName).find(filterName =>
        key.includes(filterName),
      );
      filters[`${filterName}${value}`] = true;
    }
  });

  return { filters, oneOf };
};

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

const myEntitiesValue = 'my entities';
const showActionItemForFilters: Record<string, FilterValue> = {
  // Defined as "true" to make it look nicer in the URL (url?myEntities=true instead of url?myEntities=myEntities)
  true: {
    display: 'My entities',
    id: myEntitiesValue,
    value: myEntitiesValue,
  },
};

export const getFilterDefinitions = ({
  actionItems,
  entitiesByTag,
  ownerOptionsMap,
  ruleFilterDefinitions,
  userEntities,
}: {
  actionItems: InitiativeActionItem[];
  entitiesByTag: Record<HomepageEntity['codeTag'], HomepageEntity>;
  ownerOptionsMap: Record<string, FilterValue>;
  ruleFilterDefinitions: Record<string, FilterValue>;
  userEntities: string[];
}) => {
  return [
    {
      name: FilterDefinitionName.ShowActionItemsFor,
      displayName: 'Show action items for',
      filters: showActionItemForFilters,
      oneOfDisabled: true,
      generatePredicate: (restriction: string) => {
        return (componentRef: string) => {
          return (
            restriction !== myEntitiesValue ||
            userEntities.includes(componentRef)
          );
        };
      },
    },
    {
      name: FilterDefinitionName.FailingRules,
      filters: ruleFilterDefinitions,
      generatePredicate: (failingRule: string) =>
        createRulePredicate(failingRule, actionItems, false),
    },
    {
      name: FilterDefinitionName.PassingRules,
      filters: ruleFilterDefinitions,
      generatePredicate: (passingRule: string) =>
        createRulePredicate(passingRule, actionItems, true),
    },
    {
      name: FilterDefinitionName.EmailOwners,
      filters: ownerOptionsMap,
      generatePredicate: (emailOwner: string) => {
        return (componentRef: string) => {
          const entity = entitiesByTag[componentRef];

          if (!entity) {
            return false;
          }

          return entity.serviceOwnerEmails.some(
            email => email.email === emailOwner,
          );
        };
      },
    },
  ];
};
