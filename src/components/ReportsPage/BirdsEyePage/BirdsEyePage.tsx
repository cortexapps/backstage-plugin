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
import { Content, ContentHeader, EmptyState } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { stringifyUrl } from 'query-string';
import { isUndefined } from 'lodash';
import { BirdsEyeReport } from './BirdsEyeReport';
import { HeatmapReportGroupBy, HeatmapReportType } from '../../../api/types';
import { BirdsEyeFilters } from './BirdsEyeFilters';
import { buildUrl } from '../../../utils/URLUtils';
import { CopyButton } from '../../Common/CopyButton';
import { useCortexApi } from '../../../utils/hooks';
import { getEntityCategoryFromFilter } from '../../Scorecards/ScorecardDetailsPage/ScorecardMetadataCard/ScorecardMetadataUtils';

export interface BirdsEyePageFilters {
  selectedScorecardId?: number;
  groupBy: HeatmapReportGroupBy;
  reportType: HeatmapReportType;
}

const defaultFilters: BirdsEyePageFilters = {
  groupBy: HeatmapReportGroupBy.Entity,
  reportType: HeatmapReportType.Rules,
}

export const BirdsEyePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filtersToParams = (filters: BirdsEyePageFilters) => ({
    scorecardId: filters.selectedScorecardId,
    groupBy: filters.groupBy !== defaultFilters.groupBy ? filters.groupBy as string : undefined,
    reportType: filters.reportType !== defaultFilters.reportType ? filters.reportType as string : undefined,
  });

  const queryScorecardId = Number(searchParams.get('scorecardId') ?? undefined);
  const initialScorecardId = Number.isNaN(queryScorecardId)
    ? undefined
    : queryScorecardId;

  const [filters, setFilters] = useState<BirdsEyePageFilters>({
    selectedScorecardId: initialScorecardId,
    groupBy: (searchParams.get('groupBy') as HeatmapReportGroupBy) ?? defaultFilters.groupBy,
    reportType: (searchParams.get('reportType') as HeatmapReportType) ?? defaultFilters.reportType,
  });
  const setFiltersAndNavigate = useCallback((partialFilters: Partial<BirdsEyePageFilters>) => {
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

  const entityCategory = useMemo(() => {
    const selectedScorecard = scorecardsResult?.value?.find((scorecard) => scorecard.id === filters.selectedScorecardId);
    return getEntityCategoryFromFilter(selectedScorecard?.filter) ?? 'Entity';
  }, [filters.selectedScorecardId, scorecardsResult]);

  return (
    <Content>
      <ContentHeader title="Bird's Eye">
        <CopyButton textToCopy={getShareableLink} aria-label="Share link">
          Share link
        </CopyButton>
      </ContentHeader>
      <Grid container direction="column">
        <BirdsEyeFilters
          filters={filters}
          setFilters={setFiltersAndNavigate}
          scorecardsResult={scorecardsResult}
        />
        <Grid item lg={12}>
          {isUndefined(filters.selectedScorecardId) ? (
            <EmptyState title="Select a Scorecard" missing="data" />
          ) : (
            <BirdsEyeReport
              entityCategory={entityCategory}
              groupBy={filters.groupBy}
              reportType={filters.reportType}
              scorecardId={filters.selectedScorecardId}
            />
          )}
        </Grid>
      </Grid>
    </Content>
  )
}
