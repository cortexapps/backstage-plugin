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
import React, { useCallback, useMemo, useState } from 'react';
import {
  AnyEntityRef,
  entityEquals,
  Predicate,
  stringifyAnyEntityRef,
} from './types';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  formatEntityRefTitle,
  getEntityRelations,
} from '@backstage/plugin-catalog-react';
import { groupByString, mapByString, mapValues } from './collections';
import {
  Entity,
  parseEntityName,
  RELATION_OWNED_BY,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  defaultGroupRefContext,
  defaultSystemRefContext,
} from './ComponentUtils';
import { cortexApiRef } from '../api';
import { CortexApi } from '../api/CortexApi';

export function useDropdown<T>(
  initialValue: T | undefined,
): [T | undefined, (event: React.ChangeEvent<{ value: unknown }>) => void] {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const onChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      setValue(
        event.target.value === ''
          ? undefined
          : (event.target.value as T | undefined),
      );
    },
    [setValue],
  );

  return [value, onChange];
}

type GroupAndSystemsHookType = {
  loading: boolean;
  error?: Error;
  systems?: Record<string, Entity[]>;
  groups?: Record<string, Entity[]>;
};

export function useGroupsAndSystems(): GroupAndSystemsHookType {
  const catalogApi = useApi(catalogApiRef);

  const { value, loading, error } = useAsync(async () => {
    const entities = await catalogApi.getEntities({
      filter: {
        kind: 'component',
      },
    });

    const systems = groupByString(entities.items, entity => {
      return getEntityRelations(entity, RELATION_PART_OF, {
        kind: 'system',
      }).map(entityRef =>
        stringifyAnyEntityRef(entityRef, { defaultKind: 'group' }),
      );
    });

    const groups = groupByString(entities.items, entity => {
      return getEntityRelations(entity, RELATION_OWNED_BY, {
        kind: 'group',
      }).map(entityRef =>
        stringifyAnyEntityRef(entityRef, { defaultKind: 'system' }),
      );
    });

    return { systems, groups };
  }, []);

  return {
    loading,
    error,
    systems: value?.systems,
    groups: value?.groups,
  };
}

type GroupAndSystemsFilterHookType<T> = {
  loading: boolean;
  error?: Error;
  systems?: {
    definition: { [id: string]: { display: string; value: string } };
    predicate: (value: string) => Predicate<T>;
  };
  groups?: {
    definition: { [id: string]: { display: string; value: string } };
    predicate: (value: string) => Predicate<T>;
  };
};

export function useGroupsAndSystemsFilters<T>(
  componentRef: (t: T) => AnyEntityRef,
): GroupAndSystemsFilterHookType<T> {
  const { systems, groups, ...rest } = useGroupsAndSystems();

  const groupsFilterDefinition = useMemo(() => {
    return mapValues(
      mapByString(Object.keys(groups ?? {}), groupRef => groupRef),
      groupRef => {
        return {
          display: formatEntityRefTitle(
            parseEntityName(groupRef),
            defaultGroupRefContext,
          ),
          value: groupRef,
        };
      },
    );
  }, [groups]);

  const groupsPredicate = useCallback(
    (groupRef: string) => {
      return (t: T) =>
        groups?.[groupRef]?.some(entity =>
          entityEquals(componentRef(t), entity),
        ) ?? false;
    },
    [componentRef, groups],
  );

  const systemsFilterDefinition = useMemo(() => {
    return mapValues(
      mapByString(Object.keys(systems ?? {}), systemRef => systemRef),
      systemRef => {
        return {
          display: formatEntityRefTitle(
            parseEntityName(systemRef),
            defaultSystemRefContext,
          ),
          value: systemRef,
        };
      },
    );
  }, [systems]);

  const systemsPredicate = useCallback(
    (systemRef: string) => {
      return (t: T) => {
        return (
          systems?.[systemRef]?.some(entity =>
            entityEquals(componentRef(t), entity),
          ) ?? false
        );
      };
    },
    [componentRef, systems],
  );

  return {
    ...(groups && {
      groups: {
        definition: groupsFilterDefinition,
        predicate: groupsPredicate,
      },
    }),
    ...(systems && {
      systems: {
        definition: systemsFilterDefinition,
        predicate: systemsPredicate,
      },
    }),
    ...rest,
  };
}

export function useCortexApi<T>(
  f: (api: CortexApi) => Promise<T>,
  deps: any[] = [],
) {
  const cortexApi = useApi(cortexApiRef);

  return useAsync(async () => {
    return await f(cortexApi);
  }, deps);
}
