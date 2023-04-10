/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { Lookback } from '../../../utils/lookback';
import { AggregatedScorecardProgress } from './AggregatedScorecardProgress';
import { GroupByOption, ruleName } from '../../../api/types';
import { SerieFilter } from './SerieFilter';
import { GroupByDropdown } from '../Common/GroupByDropdown';
import { LookbackDropdown } from '../Common/LookbackDropdown';

export const ProgressPage = () => {
  const [selectedScorecardId, setSelectedScorecardId] = useState<
    number | undefined
  >();
  const [lookback, setLookback] = useDropdown(Lookback.MONTHS_1);
  const [groupBy, setGroupBy] = useDropdown<GroupByOption>(
    GroupByOption.SERVICE,
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
      <WarningPanel severity="error" title="Could not load Scorecard.">
        {error.message}
      </WarningPanel>
    );
  }

  return (
    <Content>
      <ContentHeader title="Progress" />
      <Grid container direction="column">
        <Grid item lg={12}>
          <Grid container direction="row">
            <Grid item lg={8}>
              <ScorecardSelector
                onSelect={setSelectedScorecardId}
                selectedScorecardId={selectedScorecardId}
                hideReset
              />
            </Grid>
            <Grid item lg={4}>
              <LookbackDropdown lookback={lookback} setLookback={setLookback} />
            </Grid>
          </Grid>
          <Grid container style={{ marginTop: '20px' }}>
            <Grid item lg={2}>
              <GroupByDropdown groupBy={groupBy} setGroupBy={setGroupBy} />
            </Grid>
            {scorecard && (
              <Grid item lg={10}>
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
                      <MenuItem key={`Rule-${rule.id}`} value={rule.expression}>
                        {ruleName(rule)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {filterOptions && (
              <Grid item lg={12}>
                <SerieFilter options={filterOptions} onSelect={setFilters} />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item lg={12}>
          {selectedScorecardId === undefined ? (
            <EmptyState title="Select a Scorecard" missing="data" />
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
