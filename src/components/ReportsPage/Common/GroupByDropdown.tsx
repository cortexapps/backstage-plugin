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
import { GroupByOption } from '../../../api/types';

interface GroupByDropdownProps {
  groupBy: GroupByOption | undefined;
  setGroupBy: (event: React.ChangeEvent<{ value: unknown }>) => void;
}

const GroupByLabels = {
  [GroupByOption.SERVICE]: GroupByOption.SERVICE,
  [GroupByOption.TEAM]: GroupByOption.TEAM,
  [GroupByOption.SERVICE_GROUP]: 'Group',
  [GroupByOption.LEVEL]: GroupByOption.LEVEL,
};

export const GroupByDropdown = ({
  groupBy,
  setGroupBy,
}: GroupByDropdownProps) => {
  return (
    <FormControl>
      <InputLabel style={{ minWidth: '100px' }}>Group By</InputLabel>
      <Select value={groupBy} onChange={setGroupBy}>
        {Object.values(GroupByOption).map(value => (
          <MenuItem key={`GroupByOption-${value}`} value={value}>
            {GroupByLabels[value]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
