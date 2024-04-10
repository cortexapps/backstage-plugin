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
import { Content, ContentHeader, EmptyState } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { SingleScorecardHeatmap } from './SingleScorecardHeatmap';
import { ScorecardSelector } from '../ScorecardSelector';
import { useCortexApi } from '../../../utils/hooks';
import { GroupByOption, HeaderType } from '../../../api/types';
import { GroupByDropdown } from '../Common/GroupByDropdown';
import { CopyButton } from '../../Common/CopyButton';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { buildUrl } from '../../../utils/URLUtils';
import { HeaderTypeDropdown } from '../Common/HeaderTypeDropdown';
import { isUndefined } from 'lodash';
import { stringifyUrl } from 'query-string';
import { getEntityCategoryFromFilter } from '../../Scorecards/ScorecardDetailsPage/ScorecardMetadataCard/ScorecardMetadataUtils';
import { isScorecardTeamBased } from '../../../utils/ScorecardFilterUtils';

const defaultFilters = {
  groupBy: GroupByOption.SERVICE,
  headerType: HeaderType.RULES,
}

interface HeatmapPageFilters {
  selectedScorecardId?: number;
  groupBy: GroupByOption;
  headerType: HeaderType;
}

export const HeatmapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filtersToParams = (filters: HeatmapPageFilters) => ({
    scorecardId: filters.selectedScorecardId,
    groupBy: filters.groupBy !== defaultFilters.groupBy ? filters.groupBy as string : undefined,
    headerType: filters.headerType !== defaultFilters.headerType ? filters.headerType as string : undefined,
  });

  const queryScorecardId = Number(searchParams.get('scorecardId') ?? undefined);
  const initialScorecardId = Number.isNaN(queryScorecardId)
    ? undefined
    : queryScorecardId;

  const [filters, setFilters] = useState<HeatmapPageFilters>({
    selectedScorecardId: initialScorecardId,
    groupBy: (searchParams.get('groupBy') as GroupByOption) ?? defaultFilters.groupBy,
    headerType: (searchParams.get('headerType') as HeaderType) ?? defaultFilters.headerType,
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

  const onGroupByChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFiltersAndNavigate({ groupBy: event.target.value as GroupByOption });
  }

  const onHeaderTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFiltersAndNavigate({ headerType: event.target.value as HeaderType });
  }

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
            onSelect={(selectedScorecardId) => setFiltersAndNavigate({ selectedScorecardId })}
            scorecardsResult={scorecardsResult}
          />
        </Grid>
        <Grid container direction="row" style={{ marginTop: '20px' }}>
          <Grid item>
            <GroupByDropdown excluded={excludedGroupBys} groupBy={filters.groupBy} setGroupBy={onGroupByChange} />
          </Grid>
          <Grid item>
            <HeaderTypeDropdown
              headerType={filters.headerType}
              setHeaderType={onHeaderTypeChange}
            />
          </Grid>
        </Grid>
        <Grid item lg={12}>
          {isUndefined(filters.selectedScorecardId) ? (
            <EmptyState title="Select a Scorecard" missing="data" />
          ) : (
            <SingleScorecardHeatmap
              entityCategory={entityCategory}
              scorecardId={filters.selectedScorecardId}
              groupBy={filters.groupBy}
              headerType={filters.headerType}
            />
          )}
        </Grid>
      </Grid>
    </Content>
  );
};
