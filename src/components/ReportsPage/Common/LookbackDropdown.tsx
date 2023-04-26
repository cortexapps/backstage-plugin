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
import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { enumKeys } from '../../../utils/types';
import { Lookback, lookbackLabels } from '../../../utils/lookback';

interface LookbackDropdownProps {
  lookback: Lookback | undefined;
  setLookback: (event: React.ChangeEvent<{ value: unknown }>) => void;
}

export const LookbackDropdown = ({
  lookback,
  setLookback,
}: LookbackDropdownProps) => {
  return (
    <FormControl>
      <InputLabel>Time Range</InputLabel>
      <Select value={lookback} onChange={setLookback}>
        {enumKeys(Lookback).map(key => (
          <MenuItem key={`Lookback-${key}`} value={Lookback[key]}>
            {lookbackLabels(Lookback[key])}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
