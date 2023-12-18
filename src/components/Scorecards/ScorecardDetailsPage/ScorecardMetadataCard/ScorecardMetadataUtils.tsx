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

import { isEmpty, isUndefined } from 'lodash';
import {
  CategoryFilter,
  EntityFilter,
  FilterType,
} from '../../../../api/types';

export const getJoinerString = (idx: number, length: number) => {
  return `${idx !== 0 && length > 2 ? ', ' : ''} ${
    idx === length - 1 && length >= 2 ? 'and ' : ''
  }`;
};

export const getEntityGroupsFromFilter = (
  filter: EntityFilter | null,
): { entityGroups: string[]; excludeEntityGroups: string[] } => {
  if (
    filter?.type === FilterType.DOMAIN_FILTER ||
    filter?.type === FilterType.SERVICE_FILTER ||
    filter?.type === FilterType.RESOURCE_FILTER ||
    filter?.type === FilterType.TEAM_FILTER
  ) {
    const entityGroups = filter?.entityGroupFilter?.entityGroups ?? [];
    const excludeEntityGroups =
      filter?.entityGroupFilter?.excludedEntityGroups ?? [];

    return { entityGroups, excludeEntityGroups };
  }

  return { entityGroups: [], excludeEntityGroups: [] };
};

export const getResourceTypesFromFilter = (
  filter: EntityFilter | null,
): { include: boolean; types: string[] } => {
  if (filter?.type === FilterType.RESOURCE_FILTER) {
    const types = filter?.typeFilter?.types ?? [];
    const include =
      isUndefined(filter?.typeFilter) ||
      (filter?.typeFilter?.include === true && !isEmpty(types));

    return { include, types };
  }

  return { include: true, types: [] };
};

export const getQueryFromFilter = (
  filter?: EntityFilter | null,
): string | null | undefined => {
  return filter?.type === FilterType.CQL_FILTER ? filter.query : undefined;
};

export const getEntityCategoryFromFilter = (
  filter: EntityFilter | null,
): CategoryFilter => {
  if (filter?.type === FilterType.CQL_FILTER) {
    return filter.category;
  } else if (filter?.type === FilterType.DOMAIN_FILTER) {
    return CategoryFilter.Domain;
  } else if (filter?.type === FilterType.RESOURCE_FILTER) {
    return CategoryFilter.Resource;
  } else if (filter?.type === FilterType.TEAM_FILTER) {
    return CategoryFilter.Team;
  } else {
    return CategoryFilter.Service;
  }
};
