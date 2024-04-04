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
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Content, ContentHeader, EmptyState } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { SingleScorecardHeatmap } from './SingleScorecardHeatmap';
import { ScorecardSelector } from '../ScorecardSelector';
import { useCortexApi, useDropdown } from '../../../utils/hooks';
import { CategoryFilter, FilterType, GroupByOption, HeaderType, Scorecard } from '../../../api/types';
import { GroupByDropdown } from '../Common/GroupByDropdown';
import { CopyButton } from '../../Common/CopyButton';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { buildUrl } from '../../../utils/URLUtils';
import { HeaderTypeDropdown } from '../Common/HeaderTypeDropdown';
import { isUndefined } from 'lodash';
import { stringifyUrl } from 'query-string';

const defaultFilters = {
  groupBy: GroupByOption.SERVICE,
  headerType: HeaderType.RULES,
}

export const HeatmapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryScorecardId = Number(searchParams.get('scorecardId') ?? undefined);
  const initialScorecardId = Number.isNaN(queryScorecardId)
    ? undefined
    : queryScorecardId;

  const [selectedScorecardId, setSelectedScorecardId] = useState<
    number | undefined
  >(initialScorecardId);

  const [groupBy, setGroupBy] = useState<GroupByOption|undefined>(
    (searchParams.get('groupBy') as GroupByOption) ?? defaultFilters.groupBy,
  );
  const [headerType, setHeaderType] = useDropdown<HeaderType>(
    (searchParams.get('headerType') as HeaderType) ?? defaultFilters.headerType,
  );

  useEffect(() => {
    const targetUrl = stringifyUrl({ url: location.pathname, query: {
      scorecardId: selectedScorecardId ? `${selectedScorecardId}` : undefined,
      groupBy: groupBy !== defaultFilters.groupBy ? groupBy as string : undefined,
      headerType: headerType !== defaultFilters.headerType ? headerType as string : undefined,
    } });

    // Check if the new URL is different from current to avoid changing it infinitely
    if (`${location.pathname}${location.search}` !== targetUrl) {
      navigate(targetUrl, { replace: true });
    }
  }, [groupBy, headerType, selectedScorecardId, location, navigate])

  const getShareableLink = useCallback(() => {
    const queryParamsObj = {
      scorecardId: selectedScorecardId,
      groupBy,
      headerType,
    };
    return buildUrl(queryParamsObj, location.pathname);
  }, [location, selectedScorecardId, groupBy, headerType]);

  const scorecardsResult = useCortexApi(api => api.getScorecards());
  const excludedGroupBys = useMemo(() => {
    const teamBasedCardSelected = scorecardsResult.value?.some(
      (scorecard: Scorecard) => scorecard.id === selectedScorecardId && (
        scorecard.filter?.type === FilterType.TEAM_FILTER ||
        (scorecard.filter?.type === 'COMPOUND_FILTER' &&
        scorecard.filter?.typeFilter?.include &&
        scorecard.filter?.typeFilter?.types.includes('team')) ||
        (scorecard.filter?.type === FilterType.CQL_FILTER &&
        scorecard.filter?.category === CategoryFilter.Team)
      )
    );
    return teamBasedCardSelected ? [GroupByOption.TEAM] : [];
  }, [scorecardsResult, selectedScorecardId]);

  const onGroupByChange = (event: ChangeEvent<{ value: unknown }>) => {
    setGroupBy(event.target.value === ''
      ? undefined
      : (event.target.value as GroupByOption | undefined));
  }

  useEffect(() => {
    if (groupBy && excludedGroupBys.includes(groupBy)) {
      setGroupBy(defaultFilters.groupBy);
    }
  }, [excludedGroupBys, groupBy]);

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
            selectedScorecardId={selectedScorecardId}
            onSelect={setSelectedScorecardId}
            scorecardsResult={scorecardsResult}
          />
        </Grid>
        <Grid container direction="row" style={{ marginTop: '20px' }}>
          <Grid item>
            <GroupByDropdown excluded={excludedGroupBys} groupBy={groupBy} setGroupBy={onGroupByChange} />
          </Grid>
          <Grid item>
            <HeaderTypeDropdown
              headerType={headerType}
              setHeaderType={setHeaderType}
            />
          </Grid>
        </Grid>
        <Grid item lg={12}>
          {isUndefined(selectedScorecardId) ? (
            <EmptyState title="Select a Scorecard" missing="data" />
          ) : (
            <SingleScorecardHeatmap
              scorecardId={selectedScorecardId}
              groupBy={groupBy!!}
              headerType={headerType!!}
            />
          )}
        </Grid>
      </Grid>
    </Content>
  );
};
