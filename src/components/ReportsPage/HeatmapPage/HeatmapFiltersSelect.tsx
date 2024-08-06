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
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import React, { useCallback, useMemo } from 'react';

export interface ModalSelectItem {
  value: string | number;
  label: string;
}

interface ModalSelectProps<T> {
  configKey: T;
  name: string;
  value: string[];
  onChange: (type: T, value: string[]) => void;
  onReset: (type: T) => void;
  options: string[];
}

export const ModalSelect = <T,>({
  configKey,
  name,
  value,
  onChange,
  onReset,
  options,
}: ModalSelectProps<T>) => {
  const mappedOptions = useMemo(() => {
    return options.map(option => (
      <MenuItem key={`ScorecardOption-domain-${option}`} value={option}>
        {option}
      </MenuItem>
    ));
  }, [options]);

  const changeHandler = useCallback(
    (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      onChange(configKey, event.target.value as string[]);
    },
    [configKey, onChange],
  );

  const resetHandler = useCallback(() => {
    onReset(configKey);
  }, [onReset, configKey]);

  return (
    <Box display="flex" flexDirection="row">
      <FormControl variant="standard" fullWidth>
        <InputLabel>{name}</InputLabel>
        <Select multiple value={value} onChange={changeHandler}>
          {mappedOptions}
        </Select>
      </FormControl>
      {value.length > 0 && (
        <Button
          onClick={resetHandler}
          variant="text"
          aria-label={`Clear ${name.toLocaleLowerCase()} filter`}
          title={`Clear ${name.toLocaleLowerCase()} filter`}
        >
          <Clear />
        </Button>
      )}
    </Box>
  );
};
