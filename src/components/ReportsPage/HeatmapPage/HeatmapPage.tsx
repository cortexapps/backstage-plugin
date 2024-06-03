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
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Content, ContentHeader, EmptyState, Progress } from '@backstage/core-components';
import { Checkbox, FormControlLabel, Grid, InputLabel } from '@material-ui/core';
import { SingleScorecardHeatmap } from './SingleScorecardHeatmap';
import { ScorecardSelector } from '../ScorecardSelector';
import { useCortexApi, useEntitiesByTag } from '../../../utils/hooks';
import { GroupByOption, HeaderType } from '../../../api/types';
import { GroupByDropdown } from '../Common/GroupByDropdown';
import { CopyButton } from '../../Common/CopyButton';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { buildUrl } from '../../../utils/URLUtils';
import { HeaderTypeDropdown } from '../Common/HeaderTypeDropdown';
import { isFinite, isUndefined } from 'lodash';
import { stringifyUrl } from 'query-string';
import { getEntityCategoryFromFilter } from '../../Scorecards/ScorecardDetailsPage/ScorecardMetadataCard/ScorecardMetadataUtils';
import { isScorecardTeamBased } from '../../../utils/ScorecardFilterUtils';
import { HeatmapFiltersModal, ScoreFilters } from './HeatmapFiltersModal';
import { defaultFilters as defaultScoreFilters } from './HeatmapFiltersModal';

interface HeatmapPageFilters {
  selectedScorecardId?: number;
  groupBy: GroupByOption;
  headerType: HeaderType;
  scoreFilters: ScoreFilters;
  useHierarchy: boolean;
}

const defaultFilters: HeatmapPageFilters = {
  groupBy: GroupByOption.ENTITY,
  headerType: HeaderType.RULES,
  scoreFilters: defaultScoreFilters,
  useHierarchy: false,
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
    hierarchy: filters.useHierarchy ? 'true' : undefined,
  });

  const queryScorecardId = Number(searchParams.get('scorecardId') ?? undefined);
  const initialScorecardId = Number.isNaN(queryScorecardId)
    ? undefined
    : queryScorecardId;

  const [filters, setFilters] = useState<HeatmapPageFilters>({
    selectedScorecardId: initialScorecardId,
    groupBy: (searchParams.get('groupBy') as GroupByOption) ?? defaultFilters.groupBy,
    headerType: (searchParams.get('headerType') as HeaderType) ?? defaultFilters.headerType,
    useHierarchy: (searchParams.has('hierarchy')) ?? defaultFilters.useHierarchy,
    scoreFilters: {
      serviceIds: searchParams.get('serviceIds')?.split(',').map((i) => parseInt(i, 10)).filter(isFinite) ?? defaultFilters.scoreFilters.serviceIds,
      groups: searchParams.get('groups')?.split(',') ?? defaultFilters.scoreFilters.groups,
      teams: searchParams.get('teams')?.split(',') ?? defaultFilters.scoreFilters.teams,
      users: searchParams.get('users')?.split(',') ?? defaultFilters.scoreFilters.users,
    },
  });
  const setFiltersAndNavigate = useCallback((partialFilters: Partial<HeatmapPageFilters>) => {
    const newFilters = {
      ...filters,
      ...partialFilters
    };

    setFilters(newFilters);

    navigate(
      stringifyUrl({ url: location.pathname, query: filtersToParams(newFilters)}),
      { replace: true }
    );
  }, [filters, location.pathname, navigate]);

  const getShareableLink = useCallback(() => {
    return buildUrl(filtersToParams(filters), location.pathname);
  }, [filters, location]);

  const scorecardsResult = useCortexApi(api => api.getScorecards());

  const { entityCategory, excludedGroupBys } = useMemo(() => {
    const selectedScorecard = scorecardsResult.value?.find((scorecard) => scorecard.id === filters.selectedScorecardId);

    const excludedGroupBys = isScorecardTeamBased(selectedScorecard) ? [GroupByOption.TEAM] : [];

    if (filters.groupBy && excludedGroupBys.includes(filters.groupBy)) {
      setFiltersAndNavigate({ groupBy: defaultFilters.groupBy });
    }

    return {
      entityCategory: getEntityCategoryFromFilter(selectedScorecard?.filter) ?? 'Entity',
      excludedGroupBys,
    }
  }, [filters, setFiltersAndNavigate, scorecardsResult]);

  const onScorecardSelectChange = (selectedScorecardId?: number) => {
    setFiltersAndNavigate({ selectedScorecardId, scoreFilters: defaultScoreFilters });
  }

  const onGroupByChange = (event: ChangeEvent<{ value: unknown }>) => {
    const groupBy = event.target.value as GroupByOption;
    setFiltersAndNavigate({ groupBy, useHierarchy: groupBy === GroupByOption.TEAM ? filters.useHierarchy : false });
  }

  const onHeaderTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFiltersAndNavigate({ headerType: event.target.value as HeaderType });
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
          <Grid container direction="row" justifyContent="space-between">
            <Grid item>
              <Grid container direction="row" spacing={2} alignItems="center">
                <Grid item>
                  <GroupByDropdown excluded={excludedGroupBys} groupBy={filters.groupBy} setGroupBy={onGroupByChange} />
                </Grid>
                <Grid item>
                  <HeaderTypeDropdown
                    headerType={filters.headerType}
                    setHeaderType={onHeaderTypeChange}
                  />
                </Grid>
                {filters.groupBy === GroupByOption.TEAM && (
                  <Grid item>
                    <Grid container direction="row" alignItems="center">
                      <FormControlLabel
                        aria-label='Use Team hierarchy'
                        control={
                          <Checkbox
                            checked={filters.useHierarchy}
                            onChange={() => setFiltersAndNavigate({ useHierarchy: !filters.useHierarchy })}
                          />
                        }
                        label={
                          <InputLabel>
                            Use Team hierarchy
                          </InputLabel>
                        }
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item>
              <HeatmapFiltersModal
                filters={filters.scoreFilters}
                setFilters={(scoreFilters: ScoreFilters) => setFiltersAndNavigate({ scoreFilters })}
                entitiesByTag={entitiesByTag}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item lg={12}>
          {isUndefined(filters.selectedScorecardId)
            ? (
              <EmptyState title="Select a Scorecard" missing="data" />
            )
            : loadingEntities
              ? <Progress />
              : (
                <SingleScorecardHeatmap
                  entityCategory={entityCategory}
                  entitiesByTag={entitiesByTag}
                  scorecardId={filters.selectedScorecardId}
                  groupBy={filters.groupBy}
                  headerType={filters.headerType}
                  scoreFilters={filters.scoreFilters}
                  useHierarchy={filters.useHierarchy}
                />
              )
          }
        </Grid>
      </Grid>
    </Content>
  );
};
