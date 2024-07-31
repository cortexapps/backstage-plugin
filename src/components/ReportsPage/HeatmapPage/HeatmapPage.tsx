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
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ContentHeader,
  Progress,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { ScorecardSelector } from '../ScorecardSelector';
import { useCortexApi } from '../../../utils/hooks';
import { CopyButton } from '../../Common/CopyButton';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { isFunction } from 'lodash';
import { stringifyUrl } from 'query-string';
import {
  defaultInitial,
  Filters,
  HeaderType,
  PathType,
} from "@cortexapps/birdseye";
import { HeatmapTable } from './HeatmapTable';

export const HeatmapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filtersToParams = (filters: Filters) => {
    return {
      scorecardId: filters.scorecardId,
      entity: filters.dataFilters.selectedEntities,
      group: filters.dataFilters.selectedGroups,
      team: filters.dataFilters.selectedTeams,
      domain: filters.dataFilters.selectedDomains,
      level: filters.dataFilters.selectedLevels,
      owner: filters.dataFilters.selectedOwners,
      groupBy: filters.path.find(({ type }) => type === PathType.GroupBy)?.label,
      showHierarchy: filters.useHierarchy ? 'true' : undefined,
      hideWithoutChildren: filters.hideTeamsWithoutServices ? undefined : 'false',
      headerType: filters.headerType,
    };
  };

  const [filters, setFilters] = useState<Filters>({
    ...defaultInitial,
    scorecardId: searchParams.get('scorecardId') ?? undefined,
    dataFilters: {
      ...defaultInitial.dataFilters,
      selectedEntities: searchParams.getAll('entity') ?? [],
      selectedGroups: searchParams.getAll('group') ?? [],
      selectedTeams: searchParams.getAll('team') ?? [],
      selectedDomains: searchParams.getAll('domain') ?? [],
      selectedLevels: searchParams.getAll('level') ?? [],
      selectedOwners: searchParams.getAll('owner') ?? [],
    },
    path: searchParams.get('groupBy')
      ? defaultInitial.path.find(({ type }) => type === PathType.GroupBy)
        ? defaultInitial.path.map(
          (path) => path.type === PathType.GroupBy ? { type: PathType.GroupBy, label: searchParams.get('groupBy')! } : path
        )
        : [
          ...defaultInitial.path,
          { type: PathType.GroupBy, label: searchParams.get('groupBy')! },
        ]
      : [],
    useHierarchy: searchParams.has('showHierarchy'),
    hideTeamsWithoutServices: !searchParams.has('hideWithoutChildren'),
    headerType: searchParams.get('headerType') as HeaderType ?? undefined,
  });
  const setFiltersAndNavigate = useCallback(
    (value: React.SetStateAction<Filters>) =>
      setFilters(prev => {
        const newFilters = isFunction(value) ? value(prev) : value;

        navigate(
          stringifyUrl({
            url: location.pathname,
            query: filtersToParams(newFilters),
          }),
          { replace: true },
        );

        return newFilters;
      }),
    [location.pathname, navigate],
  );

  const scorecardsResult = useCortexApi(api => api.getScorecards());
  const { loading: isLoadingScorecards } = scorecardsResult;
  const { value: scores, loading: isLoadingScores } = useCortexApi(
    async api =>
      filters.scorecardId
        ? api.getScorecardScores(Number.parseInt(filters.scorecardId))
        : undefined,
    [filters.scorecardId],
  );
  const { value: ladders, loading: isLoadingLadder } = useCortexApi(
    async api =>
      filters.scorecardId
        ? api.getScorecardLadders(Number.parseInt(filters.scorecardId))
        : undefined,
    [filters.scorecardId],
  );
  const { value: catalog, loading: isLoadingCatalog } = useCortexApi(api => api.getCatalogEntities());
  const { value: domainHierarchies, loading: isLoadingDomainHierarchies } = useCortexApi(api => api.getDomainHierarchies());
  const { value: domainAncestors, loading: isLoadingDomainAncestors } = useCortexApi(api => api.getEntityDomainAncestors());
  const isLoading = isLoadingScorecards
    || isLoadingScores
    || isLoadingCatalog
    || isLoadingLadder
    || isLoadingDomainHierarchies
    || isLoadingDomainAncestors;

  const onScorecardSelectChange = (scorecardId?: number) => {
    setFiltersAndNavigate({ ...defaultInitial, scorecardId: scorecardId?.toString() });
  };

  useEffect(() => {
    setFiltersAndNavigate(filters);
  }, [filters, setFiltersAndNavigate]);

  const scorecard = scorecardsResult.value?.find((result => result.id.toString() === filters.scorecardId));

  return (
    <>
      <ContentHeader title="Bird's Eye">
        <CopyButton
          textToCopy={() => '' /* TODO */}
          aria-label="Share link"
          onSuccess={() => {} /* TODO */}
        >
          Share link
        </CopyButton>
      </ContentHeader>
      <Grid container direction="column">
        <Grid item lg={12}>
          {/* TODO: Controlled / uncontrolled state */}
          <ScorecardSelector
            selectedScorecardId={filters.scorecardId ? Number.parseInt(filters.scorecardId) : undefined}
            onSelect={onScorecardSelectChange}
            scorecardsResult={scorecardsResult}
          />
        </Grid>
        <Grid item lg={12}>
          {isLoading ? (
            <Progress />
          ) : (
            scorecard && (
              <HeatmapTable
                allDomains={[
                  {
                    "id": '36',
                    "cid": "en2e8a42777d161c82",
                    "codeTag": "examples",
                    "name": "Examples",
                    "type": "domain" as any,
                    "description": undefined,
                    "icon": {
                      "kind": "cortex",
                      "tag": "domain",
                      "url": "http://api.local.getcortexapp.com:8080/api/internal/v1/static?type=FS&kind=cortex&path=domain"
                    },
                    "serviceOwnerEmails": [],
                    "groupNames": [
                      "guests"
                    ],
                    "serviceGroupTags": [],
                    "isArchived": false
                  }
                ]}
                allTeams={[
                  {
                    "id": '30',
                    "cid": "en2e8a4277c0bced85",
                    "identifier": {
                      "name": "Guests",
                      "teamTag": "guests",
                      "ownerGroup": "guests",
                      "ownerProviderType": "CORTEX_TEAMS" as any
                    },
                    "shortDescription": undefined,
                    "fullDescription": undefined,
                    "links": [],
                    "slackChannels": [],
                    "numTeamMembers": 0,
                    "isArchived": false
                  }
                ]}
                catalog={catalog?.entities ?? []}
                domainAncestryMap={domainAncestors?.entitiesToAncestors ?? {}}
                domainHierarchy={domainHierarchies}
                filters={filters}
                ladder={ladders?.[0]}
                scorecard={scorecard}
                scores={scores ?? []}
                setFilters={setFilters}
                teamsByEntity={{
                  "28": [],
                  "29": [],
                  "30": [],
                  "31": [],
                  "32": [],
                  "33": [],
                  "34": [],
                  "35": [],
                  "36": []
                }}
              />
            )
          )}
        </Grid>
      </Grid>
    </>
  );
};
