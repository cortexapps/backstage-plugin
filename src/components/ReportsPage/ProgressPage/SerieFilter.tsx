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
import React from 'react';
import { Autocomplete } from '@material-ui/lab';
import { Checkbox, TextField } from '@material-ui/core';

interface SerieFilterProps {
  options: string[];
  onSelect: (filters: string[]) => void;
}

export const SerieFilter = ({ options, onSelect }: SerieFilterProps) => {
  return (
    <Autocomplete
      options={options}
      multiple
      onChange={(_event, values) => {
        onSelect(values as string[]);
      }}
      renderOption={(option, { selected }) => (
        <React.Fragment>
          <Checkbox style={{ marginRight: 8 }} checked={selected} />
          {option}
        </React.Fragment>
      )}
      renderInput={params => (
        <TextField {...params} variant="standard" label="Filter By" />
      )}
    />
  );
};
