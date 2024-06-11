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
import React, { useCallback, useMemo, useState } from 'react';
import { Content, ContentHeader, EmptyState, Progress } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { SingleScorecardHeatmap } from './SingleScorecardHeatmap';
import { ScorecardSelector } from '../ScorecardSelector';
import { useCortexApi, useEntitiesByTag } from '../../../utils/hooks';
import { FilterType, GroupByOption, HeaderType } from '../../../api/types';
import { CopyButton } from '../../Common/CopyButton';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { buildUrl } from '../../../utils/URLUtils';
import { isEmpty, isFinite, isFunction, isUndefined } from 'lodash';
import { stringifyUrl } from 'query-string';
import { getEntityCategoryFromFilter } from '../../Scorecards/ScorecardDetailsPage/ScorecardMetadataCard/ScorecardMetadataUtils';
import { isScorecardTeamBased } from '../../../utils/ScorecardFilterUtils';
import { defaultFilters as defaultScoreFilters } from './HeatmapFiltersModal';
import { HeatmapFilters, HeatmapPageFilters } from './HeatmapFilters';

const defaultFilters: HeatmapPageFilters = {
  groupBy: GroupByOption.ENTITY,
  headerType: HeaderType.RULES,
  scoreFilters: defaultScoreFilters,
  useHierarchy: false,
  hideWithoutChildren: true,
}

export const HeatmapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filtersToParams = (filters: HeatmapPageFilters) => ({
    scorecardId: filters.selectedScorecardId,
    groupBy: filters.groupBy !== defaultFilters.groupBy ? filters.groupBy as string : undefined,
    headerType: filters.headerType !== defaultFilters.headerType ? filters.headerType as string : undefined,
    serviceIds: filters.scoreFilters.serviceIds.length ? filters.scoreFilters.serviceIds.join(',') : undefined,
    groups: filters.scoreFilters.groups.length ? filters.scoreFilters.groups.join(',') : undefined,
    teams: filters.scoreFilters.teams.length ? filters.scoreFilters.teams.join(',') : undefined,
    users: filters.scoreFilters.users.length ? filters.scoreFilters.users.join(',') : undefined,
    domainIds: filters.scoreFilters.domainIds.length ? filters.scoreFilters.domainIds.join(',') : undefined,
    levels: filters.scoreFilters.levels.length ? filters.scoreFilters.levels.join(',') : undefined,
    hierarchy: filters.useHierarchy ? 'true' : undefined,
    hideWithoutChildren: !filters.hideWithoutChildren ? 'false' : undefined,
  });

  const queryScorecardId = Number(searchParams.get('scorecardId') ?? undefined);
  const initialScorecardId = Number.isNaN(queryScorecardId)
    ? undefined
    : queryScorecardId;

  const [filters, setFilters] = useState<HeatmapPageFilters>({
    selectedScorecardId: initialScorecardId,
    groupBy: (searchParams.get('groupBy') as GroupByOption) ?? defaultFilters.groupBy,
    headerType: (searchParams.get('headerType') as HeaderType) ?? defaultFilters.headerType,
    useHierarchy: !!searchParams.has('hierarchy'),
    hideWithoutChildren: !searchParams.has('hideWithoutChildren'),
    scoreFilters: {
      serviceIds: searchParams.get('serviceIds')?.split(',').map((i) => parseInt(i, 10)).filter(isFinite) ?? defaultFilters.scoreFilters.serviceIds,
      groups: searchParams.get('groups')?.split(',') ?? defaultFilters.scoreFilters.groups,
      teams: searchParams.get('teams')?.split(',') ?? defaultFilters.scoreFilters.teams,
      users: searchParams.get('users')?.split(',') ?? defaultFilters.scoreFilters.users,
      domainIds: searchParams.get('domainIds')?.split(',').map((i) => parseInt(i, 10)).filter(isFinite) ?? defaultFilters.scoreFilters.domainIds,
      levels: searchParams.get('levels')?.split(',') ?? defaultFilters.scoreFilters.levels,
    },
  });
  const setFiltersAndNavigate = useCallback((value: React.SetStateAction<HeatmapPageFilters>) => 
    setFilters((prev) => {
      const newFilters = isFunction(value) ? value(prev) : value;

      navigate(
        stringifyUrl({ url: location.pathname, query: filtersToParams(newFilters)}),
        { replace: true }
      );

      return newFilters;
    })
  , [location.pathname, navigate]);

  const { value: ladders, loading: loadingLadders } = useCortexApi(
    async (api) => {
      if (!filters.selectedScorecardId) {
        return undefined;
      }
      
      const ladders = api.getScorecardLadders(filters.selectedScorecardId);

      if (isEmpty(ladders)) {
        setFiltersAndNavigate((prev) => ({ ...prev, headerType: HeaderType.RULES }));
      }

      return ladders;
    },
    [filters.selectedScorecardId],
  );

  const getShareableLink = useCallback(() => {
    return buildUrl(filtersToParams(filters), location.pathname);
  }, [filters, location]);

  const scorecardsResult = useCortexApi(api => api.getScorecards());

  const { entityCategory, excludedGroupBys } = useMemo(() => {
    const selectedScorecard = scorecardsResult.value?.find((scorecard) => scorecard.id === filters.selectedScorecardId);

    const excludedGroupBys = isScorecardTeamBased(selectedScorecard) ? [GroupByOption.TEAM] : [];
    if (selectedScorecard?.filter?.type === FilterType.DOMAIN_FILTER) excludedGroupBys.push(GroupByOption.DOMAIN);
    if (isEmpty(ladders)) excludedGroupBys.push(GroupByOption.LEVEL);

    if (filters.groupBy && excludedGroupBys.includes(filters.groupBy)) {
      setFiltersAndNavigate((prev) => ({ ...prev, groupBy: defaultFilters.groupBy }));
    }

    return {
      entityCategory: getEntityCategoryFromFilter(selectedScorecard?.filter) ?? 'Entity',
      excludedGroupBys,
    }
  }, [filters, setFiltersAndNavigate, scorecardsResult, ladders]);

  const onScorecardSelectChange = (selectedScorecardId?: number) => {
    setFiltersAndNavigate((prev) => ({ ...prev, selectedScorecardId, scoreFilters: defaultScoreFilters }));
  }

  const { entitiesByTag, loading: loadingEntities } = useEntitiesByTag();

  return (
    <Content>
      <ContentHeader title="Bird's Eye">
        <CopyButton textToCopy={getShareableLink} aria-label="Share link">
          Share link
        </CopyButton>
      </ContentHeader>
      <Grid container direction="column">
        <Grid item lg={12}>
          <ScorecardSelector
            selectedScorecardId={filters.selectedScorecardId}
            onSelect={onScorecardSelectChange}
            scorecardsResult={scorecardsResult}
          />
        </Grid>
        <Grid item style={{ marginTop: '20px' }}>
          <HeatmapFilters
            filters={filters}
            setFiltersAndNavigate={setFiltersAndNavigate}
            excludedGroupBys={excludedGroupBys}
            entitiesByTag={entitiesByTag}
            ladder={ladders?.[0]}
          />
        </Grid>
        <Grid item lg={12}>
          {isUndefined(filters.selectedScorecardId)
            ? (
              <EmptyState title="Select a Scorecard" missing="data" />
            )
            : (loadingEntities || loadingLadders)
              ? <Progress />
              : (
                <SingleScorecardHeatmap
                  entityCategory={entityCategory}
                  entitiesByTag={entitiesByTag}
                  scorecardId={filters.selectedScorecardId}
                  filters={filters}
                  ladder={ladders?.[0]}
                />
              )
          }
        </Grid>
      </Grid>
    </Content>
  );
};
