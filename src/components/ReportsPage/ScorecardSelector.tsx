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
import React, { useMemo } from 'react';
import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { Progress, WarningPanel } from '@backstage/core-components';
import { Scorecard } from '../../api/types';
import { AsyncState } from 'react-use/lib/useAsyncFn';

interface ScorecardSelectorCard {
  selectedScorecardId?: number;
  onSelect: (id?: number) => void;
  hideReset?: boolean;
  scorecardsResult: AsyncState<Scorecard[]>
}

export const ScorecardSelector = ({
  selectedScorecardId,
  onSelect,
  hideReset,
  scorecardsResult,
}: ScorecardSelectorCard) => {
  const {
    value: scorecards,
    loading,
    error,
  } = scorecardsResult;

  const sortedScorecards = useMemo(() => {
    return scorecards?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];
  }, [scorecards]);

  const selected = useMemo(
    () =>
      scorecards &&
      scorecards.find(scorecard => scorecard.id === selectedScorecardId),
    [scorecards, selectedScorecardId],
  );

  if (loading) {
    return <Progress />;
  }

  if (error || scorecards === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecards.">
        {error?.message}
      </WarningPanel>
    );
  }

  return (
    <Card>
      <FormControl variant="standard">
        <InputLabel>Select a Scorecard</InputLabel>
        <Select
          value={selected?.id}
          onChange={event => onSelect(event.target.value as number | undefined)}
        >
          {sortedScorecards.map(scorecard => (
            <MenuItem
              key={`ScorecardOption-${scorecard.id}`}
              value={scorecard.id}
            >
              {scorecard.name}
            </MenuItem>
          ))}
          {hideReset !== true && <MenuItem value={undefined}>Reset</MenuItem>}
        </Select>
      </FormControl>
    </Card>
  );
};
