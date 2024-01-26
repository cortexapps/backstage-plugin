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
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  makeStyles,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
import Select from '@material-ui/core/Select';
import { fallbackPalette } from '../../styles/styles';
import { Autocomplete } from '@material-ui/lab';
import { mapByString, mapValues } from '../../utils/collections';
import { useFilter } from './useFilter';

const useStyles = makeStyles(theme => ({
  name: {
    color: theme.palette?.text?.secondary ?? fallbackPalette.text.secondary,
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  select: {
    color: theme.palette?.text?.secondary ?? fallbackPalette.text.secondary,
    fontSize: '14px',
  },
  rulesList: {
    padding: 0,
  },
}));

export interface FilterValue {
  display: string;
  value: string;
  id: string;
}

export interface FilterDefinition {
  name: string;
  oneOfDisabled?: boolean;
  filters: { [id: string]: FilterValue };
}

interface FiltersProps extends FilterDefinition {}

export const Filters: React.FC<FiltersProps> = ({
  name,
  filters,
  oneOfDisabled,
}) => {
  const { checkedFilters, setCheckedFilters, oneOf, setOneOf } = useFilter();
  const classes = useStyles();
  const currentOneOf = oneOf[name] ?? true;

  const toggleAllFilters = (allCheckedFilters: FilterValue[]) => {
    setCheckedFilters(oldFilters => {
      const newFilters = mapValues(
        mapByString(allCheckedFilters, filter => `${name}${filter.id}`),
        () => true,
      );

      return { ...oldFilters, ...newFilters };
    });
  };

  const toggleFilter = (filter: string) => {
    setCheckedFilters(prevFilters => {
      const filterName = `${name}${filter}`;

      const newFilters = {
        ...prevFilters,
        [filterName]: !(prevFilters[filterName] ?? false),
      };

      return newFilters;
    });
  };

  const toggleOneOf = () => {
    setOneOf(prevOneOf => {
      const prevValue = prevOneOf[name] ?? true;

      return {
        ...prevOneOf,
        [name]: !prevValue,
      };
    });
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="subtitle2" className={classes.name}>
          {name}:
        </Typography>
        {!oneOfDisabled && (
          <Select
            value={currentOneOf ? 'One Of' : 'All Of'}
            onChange={() => toggleOneOf()}
            className={classes.select}
            aria-label={`Select and/or for ${name.toLowerCase()}`}
          >
            <MenuItem value="One Of">One Of</MenuItem>
            <MenuItem value="All Of">All Of</MenuItem>
          </Select>
        )}
      </Box>
      {Object.keys(filters).length <= 10 ? (
        <FormGroup className={classes.rulesList}>
          {Object.keys(filters).map(id => (
            <FormControlLabel
              key={`Filter-${name}-${id}`}
              control={
                <Checkbox
                  checked={checkedFilters[`${name}${id}`] ?? false}
                  onChange={() => toggleFilter(id)}
                  color="primary"
                  inputProps={{
                    'aria-label': `Filter ${name.toLowerCase()} by ${
                      filters[id].display
                    }`,
                  }}
                />
              }
              label={
                <Typography variant={'subtitle2'}>
                  {filters[id].display}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      ) : (
        <Autocomplete
          defaultValue={Object.values(filters).filter(
            filter => checkedFilters[`${name}${filter.id}`],
          )}
          aria-label={`Filter ${name.toLowerCase()}`}
          options={Object.values(filters)}
          getOptionLabel={filter => filter.display}
          multiple
          onChange={(_event, values) => {
            toggleAllFilters(values);
          }}
          renderInput={params => <TextField {...params} variant="standard" />}
        />
      )}
    </Box>
  );
};
