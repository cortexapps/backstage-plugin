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
import React, { useCallback, useState } from 'react';
import {
  Content,
  ContentHeader,
  EmptyState,
  WarningPanel,
} from '@backstage/core-components';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { ScorecardSelector } from '../ScorecardSelector';
import { useCortexApi, useDropdown } from '../../../utils/hooks';
import { enumKeys } from '../../../utils/types';
import { Lookback, lookbackLabels } from '../../../utils/lookback';
import { AggregatedScorecardProgress } from './AggregatedScorecardProgress';
import { GroupByOption, ruleName } from '../../../api/types';
import { SerieFilter } from './SerieFilter';

export const ProgressPage = () => {
  const [selectedScorecardId, setSelectedScorecardId] = useState<
    string | undefined
  >();
  const [lookback, setLookback] = useDropdown(Lookback.MONTHS_1);
  const [groupBy, setGroupBy] = useDropdown<GroupByOption>(
    GroupByOption.SCORECARD,
  );
  const [selectedRule, setSelectedRule] = useDropdown<string>(undefined);
  const [filterOptions, setFilterOptions] = useState<string[] | undefined>();
  const [filters, setFilters] = useState<string[] | undefined>();

  const resetFilterOptions = useCallback(
    (o: string[]) => {
      setFilterOptions(o.length > 1 ? o : undefined);
      setFilters(undefined);
    },
    [setFilterOptions, setFilters],
  );

  const { value: scorecard, error } = useCortexApi(
    async api =>
      selectedScorecardId
        ? await api.getScorecard(selectedScorecardId)
        : undefined,
    [selectedScorecardId],
  );

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not load scorecard">
        {error.message}
      </WarningPanel>
    );
  }

  return (
    <Content>
      <ContentHeader title="Progress" />
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <ScorecardSelector
            onSelect={setSelectedScorecardId}
            selectedScorecardId={selectedScorecardId}
            hideReset
          />
          <Grid container style={{ marginTop: '20px' }}>
            <Grid item xs={6}>
              <FormControl>
                <InputLabel>Time Range</InputLabel>
                <Select value={lookback} onChange={setLookback}>
                  {enumKeys(Lookback).map(key => (
                    <MenuItem key={key} value={Lookback[key]}>
                      {lookbackLabels(Lookback[key])}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl>
                <InputLabel style={{ minWidth: '100px' }}>Group By</InputLabel>
                <Select value={groupBy} onChange={setGroupBy}>
                  {enumKeys(GroupByOption).map(key => (
                    <MenuItem key={key} value={GroupByOption[key]}>
                      {GroupByOption[key].valueOf()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {scorecard && (
              <Grid item xs={12}>
                <FormControl>
                  <InputLabel style={{ minWidth: '200px' }}>
                    Group By Rule
                  </InputLabel>
                  <Select
                    value={selectedRule ?? 'Overall'}
                    onChange={setSelectedRule}
                  >
                    <MenuItem value={undefined}>Overall</MenuItem>
                    {scorecard.rules.map(rule => (
                      <MenuItem key={rule.id} value={rule.expression}>
                        {ruleName(rule)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {filterOptions && (
              <Grid item xs={12}>
                <SerieFilter options={filterOptions} onSelect={setFilters} />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item lg={8} xs={12}>
          {selectedScorecardId === undefined ? (
            <EmptyState title="Select a scorecard" missing="data" />
          ) : (
            <AggregatedScorecardProgress
              scorecardId={selectedScorecardId}
              lookback={lookback!!}
              groupBy={groupBy!!}
              setFilterOptions={resetFilterOptions}
              filters={filters}
              ruleExpression={selectedRule}
            />
          )}
        </Grid>
      </Grid>
    </Content>
  );
};
