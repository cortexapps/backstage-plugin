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
import React, {
  DependencyList,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AnyEntityRef,
  entityEquals,
  nullsToUndefined,
  Predicate,
  stringifyAnyEntityRef,
} from './types';
import { useAsync } from 'react-use';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  getEntityRelations,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import { groupByString, mapByString, mapValues } from './collections';
import {
  Entity,
  parseEntityRef,
  RELATION_OWNED_BY,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  defaultGroupRefContext,
  defaultSystemRefContext,
} from './ComponentUtils';
import { cortexApiRef } from '../api';
import { CortexApi } from '../api/CortexApi';
import { EntityFilterGroup } from '../filters';
import { FilterDefinitionWithPredicate } from '../components/FilterCard/Filters';
import { extensionApiRef } from '../api/ExtensionApi';
import { StringIndexable } from '../components/ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../api/userInsightTypes';
import { isNil, keyBy } from 'lodash';
import { Scorecard } from '../api/types';

export function useInput(
  initialValue: string | undefined = undefined,
): [
  string | undefined,
  (event: React.ChangeEvent<{ value: unknown }>) => void,
] {
  const [value, setValue] = useState<string | undefined>(initialValue);
  const onChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      setValue(
        event.target.value === ''
          ? undefined
          : (event.target.value as string | undefined),
      );
    },
    [setValue],
  );

  return [value, onChange];
}

export function useDropdown<T>(
  initialValue: T | undefined,
  deps: DependencyList = [],
): [T | undefined, (event: React.ChangeEvent<{ value: unknown }>) => void] {
  const [value, setValue] = useState<T | undefined>(initialValue);

  useEffect(() => {
    setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, ...deps]);

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
        stringifyAnyEntityRef(entityRef, { defaultKind: 'system' }),
      );
    });

    const groups = groupByString(entities.items, entity => {
      return getEntityRelations(entity, RELATION_OWNED_BY, {
        kind: 'group',
      }).map(entityRef =>
        stringifyAnyEntityRef(entityRef, { defaultKind: 'group' }),
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
          display: humanizeEntityRef(
            parseEntityRef(groupRef),
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
          display: humanizeEntityRef(
            parseEntityRef(systemRef),
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

export function useFilters<T>(
  entityRef: (t: T) => AnyEntityRef,
  options?: {
    baseFilters?: EntityFilterGroup[];
    deps?: any[];
  },
): {
  loading: boolean;
  error?: Error;
  filterGroups?: FilterDefinitionWithPredicate<T>[];
} {
  const catalogApi = useApi(catalogApiRef);
  const extensionApi = useApi(extensionApiRef);

  const { loading, error, value } = useAsync(async () => {
    return Promise.all([
      catalogApi
        .getEntities({
          filter: {
            kind: 'component',
          },
        })
        .then(response => response.items),
      extensionApi.getAdditionalFilters?.() ?? [],
    ]);
  }, options?.deps ?? []);

  const [components, filters] = value ?? [undefined, undefined];
  const allFilterGroups = useMemo(() => {
    return (options?.baseFilters ?? []).concat(filters ?? []);
  }, [options?.baseFilters, filters]);

  // Because searching through all components for matching groups/systems/etc is expensive
  // we calculate one time and memoize for fast lookup.
  const groupPropertyLookup: Record<string, Set<string>>[] | undefined =
    useMemo(() => {
      return components === undefined
        ? undefined
        : allFilterGroups.map(filterGroup => {
            return components.reduce((mapSoFar, nextComponent) => {
              filterGroup
                .groupProperty(nextComponent)
                ?.forEach(groupProperty => {
                  if (mapSoFar[groupProperty] === undefined) {
                    mapSoFar[groupProperty] = new Set();
                  }
                  mapSoFar[groupProperty].add(
                    stringifyAnyEntityRef(nextComponent),
                  );
                });

              return mapSoFar;
            }, {} as Record<string, Set<string>>);
          });
    }, [allFilterGroups, components]);

  const filterGroups = useMemo(() => {
    if (components === undefined || groupPropertyLookup === undefined) {
      return undefined;
    }

    return allFilterGroups.map((filterGroup, index) => {
      return {
        name: filterGroup.name,
        filters: mapValues(
          mapByString(
            components.flatMap(
              component => filterGroup.groupProperty(component) ?? [],
            ),
            groupProperty => groupProperty,
          ),
          groupProperty => {
            return {
              display: filterGroup.formatProperty
                ? filterGroup.formatProperty(groupProperty)
                : groupProperty,
              value: groupProperty,
              id: groupProperty,
            };
          },
        ),
        generatePredicate: (groupProperty: string) => {
          return (t: T) => {
            return groupPropertyLookup[index][groupProperty].has(
              stringifyAnyEntityRef(entityRef(t)),
            );
          };
        },
      };
    });
  }, [allFilterGroups, components, groupPropertyLookup, entityRef]);

  return { loading, error, filterGroups };
}

export function useCortexFrontendUrl(): string {
  const config = useApi(configApiRef);
  return (
    config.getOptionalString('cortex.frontendBaseUrl') ??
    'https://app.getcortexapp.com'
  );
}

export function useUiExtensions() {
  const extensionApi = useApi(extensionApiRef);
  const { value: uiExtensions, ...rest } = useAsync(async () => {
    return isNil(extensionApi.getUiExtensions)
      ? undefined
      : await extensionApi.getUiExtensions();
  }, []);

  return {
    uiExtensions,
    ...rest,
  };
}

export function useInitiativesCustomName() {
  const config = useApi(configApiRef);

  const singular =
    config.getOptionalString('cortex.initiativeNameOverride.singular') ??
    'Initiative';
  const plural =
    config.getOptionalString('cortex.initiativeNameOverride.plural') ??
    `${singular}s`;

  return { singular, plural };
}

export function useHideCortexLinks() {
  const config = useApi(configApiRef);
  return config.getOptionalBoolean('cortex.hideCortexLinks') ?? false;
}

const defaultCompareFn = (a: Scorecard, b: Scorecard) =>
  a.name.localeCompare(b.name);

export function useScorecardCompareFn() {
  const { uiExtensions, ...rest } = useUiExtensions();
  const customCompareFn = uiExtensions?.scorecards?.sortOrder?.compareFn;
  /**
   * Runtime types for scorecards return nulls instead of undefined recursively.
   * So before passing to our user-supplied compareFn that assumes that they are undefined,
   * we must recursively convert nulls -> undefined.
   */
  const sanitizedCompareFn = isNil(customCompareFn)
    ? undefined
    : (a: Scorecard, b: Scorecard) => {
        return customCompareFn!(nullsToUndefined(a), nullsToUndefined(b));
      };

  return { ...rest, compareFn: sanitizedCompareFn ?? defaultCompareFn };
}

export function usePartialScorecardCompareFn() {
  const {
    uiExtensions,
    loading: loadingUiExtensions,
    error: uiExtensionsError,
  } = useUiExtensions();
  const {
    value: scorecardsById,
    loading: loadingScorecards,
    error: scorecardsError,
  } = useCortexApi(async api =>
    keyBy(await api.getScorecards(), scorecard => scorecard.id),
  );

  const scorecardCompareFn = uiExtensions?.scorecards?.sortOrder?.compareFn;

  type PartialScorecard = {
    id: number;
  };

  /**
   * Runtime types for scorecards return nulls instead of undefined recursively.
   * So before passing to our user-supplied compareFn that assumes that they are undefined,
   * we must recursively convert nulls -> undefined.
   */
  const compareFn =
    !isNil(scorecardCompareFn) && !isNil(scorecardsById)
      ? (a: PartialScorecard, b: PartialScorecard) =>
          scorecardCompareFn!(
            nullsToUndefined(scorecardsById[a.id]),
            nullsToUndefined(scorecardsById[b.id]),
          )
      : undefined;

  return {
    loading: loadingUiExtensions || loadingScorecards,
    error: uiExtensionsError ?? scorecardsError,
    compareFn,
  };
}

export function useEntitiesByTag(): {
  entitiesByTag: StringIndexable<HomepageEntity>;
  loading: boolean;
} {
  const { value: entities, loading } = useCortexApi(
    api => api.getCatalogEntities(),
    [],
  );

  const entitiesByTag: StringIndexable<HomepageEntity> = useMemo(
    () =>
      !isNil(entities) && !isNil(entities.entities)
        ? keyBy(Object.values(entities.entities), entity => entity.codeTag)
        : {},
    [entities],
  );

  return { entitiesByTag, loading };
}
