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
import { enumKeys } from '../../../utils/types';
import { HeaderType } from '../../../api/types';

interface HeaderTypeDropdownProps {
  headerType: HeaderType | undefined;
  setHeaderType: (headerType: HeaderType) => void;
}

export const HeaderTypeDropdown = ({
  headerType,
  setHeaderType,
}: HeaderTypeDropdownProps) => {
  const onHeaderTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setHeaderType(event.target.value as HeaderType);
  };

  return (
    <FormControl>
      <InputLabel style={{ minWidth: '100px' }}>Driven By</InputLabel>
      <Select value={headerType} onChange={onHeaderTypeChange}>
        {enumKeys(HeaderType).map(key => (
          <MenuItem key={`HeaderType-${key}`} value={HeaderType[key]}>
            {HeaderType[key].valueOf()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
