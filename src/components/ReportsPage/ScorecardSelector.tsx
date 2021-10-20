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
import React from 'react';
import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useCortexApi } from '../../utils/hooks';

interface ScorecardSelectorCard {
  selectedScorecardId?: string;
  onSelect: (id?: string) => void;
  hideReset?: boolean;
}

export const ScorecardSelector = ({
  selectedScorecardId,
  onSelect,
  hideReset,
}: ScorecardSelectorCard) => {
  const {
    value: scorecards,
    loading,
    error,
  } = useCortexApi(api => api.getScorecards());

  if (loading) {
    return <Progress />;
  }

  if (error || scorecards === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load scorecards.">
        {error?.message}
      </WarningPanel>
    );
  }

  return (
    <Card>
      <FormControl variant="standard">
        <InputLabel>Select a Scorecard</InputLabel>
        <Select
          value={scorecards.find(
            scorecard => scorecard.id === selectedScorecardId,
          )}
          onChange={event => {
            onSelect(event.target.value as string | undefined);
          }}
        >
          {scorecards.map(scorecard => (
            <MenuItem key={scorecard.id} value={scorecard.id}>
              {scorecard.name}
            </MenuItem>
          ))}
          {hideReset !== true && <MenuItem value={undefined}>Reset</MenuItem>}
        </Select>
      </FormControl>
    </Card>
  );
};