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
import React, { useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { StringIndexable } from './HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { sortBy, uniq } from 'lodash';
import { Clear } from '@material-ui/icons';

export interface ScoreFilters {
  serviceIds: number[];
  groups: string[];
}

export const defaultFilters: ScoreFilters = {
  serviceIds: [],
  groups: [],
}

interface HeatmapFiltersModalProps {
  filters: ScoreFilters;
  setFilters: (scoreFilters: ScoreFilters) => void;
  entitiesByTag: StringIndexable<HomepageEntity>;
}

interface ModalSelectProps<T> {
  name: string,
  value: T[],
  onChange: (value: T[]) => void,
  onReset: () => void,
  options: React.ReactNode
}

const ModalSelect = <T,>({ name, value, onChange, onReset, options }: ModalSelectProps<T>) => {
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

export const HeatmapFiltersModal: React.FC<HeatmapFiltersModalProps> = ({ filters, setFilters, entitiesByTag }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState(filters);
  const setModalFiltersPartially = (filters: Partial<ScoreFilters>) => setModalFilters((prev) => ({ ...prev, ...filters }));
  const handleSaveFilters = () => {
    setFilters(modalFilters);
    setIsOpen(false);
  };
  const setModalOpenAndResetFilters = () => {
    setModalFilters(filters);
    setIsOpen(true);
  }

  const { services, groups } = useMemo(() => {
    const results = {
      services: [] as HomepageEntity[],
      groups: [] as string[],
    };

    Object.keys(entitiesByTag).forEach((key) => {
      const entity = entitiesByTag[key];
      switch (entity.type) {
        case "service":
          results.services.push(entity);
          break;
        default:
          break;
      }
      results.groups.push(...entity.serviceGroupTags)
    });

    return {
      services: sortBy(results.services, "name"),
      groups: sortBy(uniq(results.groups)),
    };
  }, [entitiesByTag]);

  const filtersCount = useMemo(() => {
    return Object.values(filters).reduce((total, item) => total + item.length, 0)
  }, [filters]);

  return <>
    <Button
      onClick={setModalOpenAndResetFilters}
      variant="outlined"
      aria-label="Filter"
    >
      Filters
      {filtersCount > 0 && <> ({filtersCount})</>}
    </Button>
    {filtersCount > 0 && (
      <Button
        onClick={() => setFilters(defaultFilters)}
        variant="text"
        aria-label="Clear filters"
        title="Clear filters"
      >
        <Clear />
      </Button>
    )}
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>Filter Bird's eye report</DialogTitle>
      <DialogContent>
        <Box display={"flex"} flexDirection={"column"} gridRowGap={16}>
          <ModalSelect
            name='Services'
            onChange={(serviceIds) => setModalFiltersPartially({ serviceIds })}
            onReset={() => setModalFiltersPartially({ serviceIds: defaultFilters.serviceIds })}
            value={modalFilters.serviceIds}
            options={services.map((service) => (
              <MenuItem
                key={`ScorecardOption-${service.id}`}
                value={service.id}
              >
                {service.name}
              </MenuItem>
            ))}
          />
          <ModalSelect
            name='Groups'
            onChange={(groups) => setModalFiltersPartially({ groups })}
            onReset={() => setModalFiltersPartially({ groups: defaultFilters.groups })}
            value={modalFilters.groups}
            options={groups.map((groupTag) => (
              <MenuItem
                key={`ScorecardOption-${groupTag}`}
                value={groupTag}
              >
                {groupTag}
              </MenuItem>
            ))}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSaveFilters}
          color="primary"
          aria-label="Apply filters"
        >
          Apply filters
        </Button>
      </DialogActions>
    </Dialog>
  </>;
}
