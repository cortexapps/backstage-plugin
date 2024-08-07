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
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';

export interface SortMethods<T> {
  [title: string]: (a: T, b: T) => number;
}

interface SortDropdownProps {
  label?: string;
  selected: string | undefined;
  items: string[];
  select: (event: React.ChangeEvent<{ value: unknown }>) => void;
}

export const SortDropdown = ({
  label,
  selected,
  items,
  select,
}: SortDropdownProps) => {
  return (
    <FormControl>
      {label && <InputLabel style={{ minWidth: '100px' }}>{label}</InputLabel>}
      <Select value={selected} onChange={select}>
        {items.map(item => (
          <MenuItem key={`SortDropdown-${item}`} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
