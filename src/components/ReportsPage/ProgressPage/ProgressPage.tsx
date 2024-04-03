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
import React, { useCallback, useEffect, useState } from 'react';
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
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { stringifyUrl } from 'query-string';

const defaultRule = {
  value: 'DEFAULT_RULE_AVERAGE',
  label: 'Average',
};

export const ProgressPage = () => {
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
  const [lookback, setLookback] = useDropdown(Lookback.MONTHS_1);
  const [groupBy, setGroupBy] = useDropdown<GroupByOption>(
    GroupByOption.SERVICE,
  );
  const [selectedRule, setSelectedRule] = useDropdown<string>(
    defaultRule.value,
  );
  const [filterOptions, setFilterOptions] = useState<string[] | undefined>();
  const [filters, setFilters] = useState<string[] | undefined>();

  useEffect(() => {
    const targetUrl = stringifyUrl({ url: location.pathname, query: {
      scorecardId: selectedScorecardId ? `${selectedScorecardId}` : undefined,
    } });

    if (`${location.pathname}${location.search}` !== targetUrl) {
      navigate(targetUrl, { replace: true });
    }
  }, [selectedScorecardId, location, searchParams, navigate])

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

  if (groupBy === GroupByOption.LEVEL) {
    return (
        <WarningPanel severity="error" title="Functionality not supported.">
          Group by for levels is not supported yet.
        </WarningPanel>
    );
  }

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
                  <Select value={selectedRule} onChange={setSelectedRule}>
                    <MenuItem value={defaultRule.value}>
                      {defaultRule.label}
                    </MenuItem>
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
              ruleExpression={
                selectedRule === defaultRule.value ? undefined : selectedRule
              }
            />
          )}
        </Grid>
      </Grid>
    </Content>
  );
};
