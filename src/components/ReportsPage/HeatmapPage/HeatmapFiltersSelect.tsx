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
import { Box, Button, FormControl, InputLabel, Select } from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import React from 'react';

interface ModalSelectProps<T> {
  name: string,
  value: T[],
  onChange: (value: T[]) => void,
  onReset: () => void,
  options: React.ReactNode
}

export const ModalSelect = <T,>({ name, value, onChange, onReset, options }: ModalSelectProps<T>) => {
  return (
    <Box display="flex" flexDirection="row">
      <FormControl variant="standard" fullWidth>
        <InputLabel>{name}</InputLabel>
        <Select
          multiple
          value={value}
          onChange={event => onChange(event.target.value as T[])}
        >
          {options}
        </Select>
      </FormControl>
      {value.length > 0 && (
        <Button
          onClick={onReset}
          variant="text"
          aria-label={`Clear ${name.toLocaleLowerCase()} filter`}
          title={`Clear ${name.toLocaleLowerCase()} filter`}
        >
          <Clear />
        </Button>
      )}
    </Box>
  )
}
