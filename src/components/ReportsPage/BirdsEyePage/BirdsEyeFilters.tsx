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
import React, { ChangeEvent } from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select } from '@material-ui/core';
import { enumKeys } from '../../../utils/types';
import { HeatmapReportGroupBy, HeatmapReportType, Scorecard } from '../../../api/types';
import { BirdsEyePageFilters } from './BirdsEyePage';
import { ScorecardSelector } from '../ScorecardSelector';
import { AsyncState } from 'react-use/lib/useAsyncFn';

interface BirdsEyeFiltersProps {
  filters: BirdsEyePageFilters;
  setFilters: (updatedFilters: Partial<BirdsEyePageFilters>) => void;
  scorecardsResult: AsyncState<Scorecard[]>;
}

export const BirdsEyeFilters: React.FC<BirdsEyeFiltersProps> = ({ filters, setFilters, scorecardsResult }) => {
  const onReportTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFilters({ reportType: event.target.value as HeatmapReportType });
  };

  const onGroupByChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFilters({ groupBy: event.target.value as HeatmapReportGroupBy });
  };

  return (
    <>
      <Grid item lg={12}>
        <ScorecardSelector
          selectedScorecardId={filters.selectedScorecardId}
          onSelect={(selectedScorecardId) => setFilters({ selectedScorecardId })}
          scorecardsResult={scorecardsResult}
        />
      </Grid>
      <Grid container direction="row" style={{ marginTop: '20px' }}>
        <Grid item>
          <FormControl>
            <InputLabel style={{ minWidth: '100px' }}>Group By</InputLabel>
            <Select value={filters.groupBy} onChange={onGroupByChange}>
              {enumKeys(HeatmapReportGroupBy).map(key => (
                <MenuItem key={`Heatmap-GroupBy-${key}`} value={HeatmapReportGroupBy[key]}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl>
            <InputLabel style={{ minWidth: '100px' }}>Driven By</InputLabel>
            <Select value={filters.reportType} onChange={onReportTypeChange}>
              {enumKeys(HeatmapReportType).map(key => (
                <MenuItem key={`Heatmap-ReportType-${key}`} value={HeatmapReportType[key]}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </>
  )
}
