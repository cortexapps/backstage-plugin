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
import React, { useCallback, useState } from 'react';
import {
  HeaderType,
  GroupByOption,
  FilterConfigItem,
  Filters,
} from '@cortexapps/birdseye';
import { map, mapValues, size, sum } from 'lodash';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { HeatmapFiltersModal } from './HeatmapFiltersModal';
import { Clear } from '@material-ui/icons';

interface HeatmapSettingsProps {
  filters: Filters;
  filtersConfig: FilterConfigItem[];
  groupBy: GroupByOption;
  groupByOptions: GroupByOption[];
  setDataFilters: (filters: Filters['dataFilters']) => void;
  setGroupBy: (groupBy: GroupByOption) => void;
  setHideTeamsWithoutEntities: (hide: boolean) => void;
  setReportType: (type: HeaderType) => void;
  setUseHierarchy: (useHierarchy: boolean) => void;
  shouldShowReportType: boolean;
  showHierarchy: boolean;
}

export const HeatmapSettings: React.FC<HeatmapSettingsProps> = ({
  filters,
  filtersConfig,
  groupBy,
  groupByOptions,
  setDataFilters,
  setGroupBy,
  setHideTeamsWithoutEntities,
  setReportType,
  setUseHierarchy,
  shouldShowReportType,
  showHierarchy,
}) => {
  const [isFilterModalOpened, setFilterModalOpened] = useState(false);

  const groupChangeHandler = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const newGroup = groupByOptions.find(
        option => option === event.target.value,
      );
      if (!newGroup) {
        return;
      }
      setGroupBy(newGroup);
    },
    [groupByOptions, setGroupBy],
  );

  const reportTypeChangeHandler = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      if (
        event.target.value !== HeaderType.Ladder &&
        event.target.value !== HeaderType.Rules
      ) {
        return;
      }
      setReportType(event.target.value);
    },
    [setReportType],
  );

  const clearFiltersHandler = useCallback(() => {
    const emptyFilter = mapValues(filters.dataFilters, () => []);
    setDataFilters(emptyFilter);
  }, [filters.dataFilters, setDataFilters]);

  const filtersCount = sum(map(filters.dataFilters, size));

  return (
    <Grid container direction={'row'} justifyContent={'space-between'}>
      <Grid item>
        <Grid container direction={'row'}>
          <Grid item>
            <FormControl>
              <InputLabel style={{ minWidth: '100px' }}>Group By</InputLabel>
              <Select value={groupBy} onChange={groupChangeHandler}>
                {groupByOptions.map(value => (
                  <MenuItem key={`GroupByOption-${value}`} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {shouldShowReportType && (
            <Grid item>
              <FormControl>
                <InputLabel style={{ minWidth: '100px' }}>Driven By</InputLabel>
                <Select
                  value={filters.headerType}
                  onChange={reportTypeChangeHandler}
                >
                  <MenuItem
                    key={'DrivenByOption-Rules'}
                    value={HeaderType.Rules}
                  >
                    Rules
                  </MenuItem>
                  <MenuItem
                    key={'DrivenByOption-Levels'}
                    value={HeaderType.Ladder}
                  >
                    Levels
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          {showHierarchy && (
            <Grid item>
              <FormControlLabel
                aria-label={'Show hierarchy'}
                control={
                  <Checkbox
                    checked={filters.useHierarchy}
                    onChange={() => {
                      setUseHierarchy(!filters.useHierarchy);
                    }}
                  />
                }
                label={
                  <Typography variant={'subtitle2'}>Show hierarchy</Typography>
                }
              />
            </Grid>
          )}
          {showHierarchy && (
            <Grid item>
              <FormControlLabel
                aria-label={'Hide teams without entities'}
                control={
                  <Checkbox
                    checked={filters.hideTeamsWithoutServices}
                    onChange={() => {
                      setHideTeamsWithoutEntities(
                        !filters.hideTeamsWithoutServices,
                      );
                    }}
                  />
                }
                label={
                  <Typography variant={'subtitle2'}>
                    Hide teams without entities
                  </Typography>
                }
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item>
        <Button
          onClick={() => setFilterModalOpened(true)}
          variant="outlined"
          aria-label="Filter"
        >
          Filters
          {filtersCount > 0 && <> ({filtersCount})</>}
        </Button>
        {filtersCount > 0 && (
          <Button
            onClick={clearFiltersHandler}
            variant="text"
            aria-label="Clear filters"
            title="Clear filters"
          >
            <Clear />
          </Button>
        )}
      </Grid>
      <HeatmapFiltersModal
        isOpen={isFilterModalOpened}
        filters={filters.dataFilters}
        filtersConfig={filtersConfig}
        setFilters={setDataFilters}
        setIsOpen={setFilterModalOpened}
      />
    </Grid>
  );
};
