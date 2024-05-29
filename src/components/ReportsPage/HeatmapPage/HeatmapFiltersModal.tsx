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
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select } from '@material-ui/core';
import { StringIndexable } from './HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { sortBy } from 'lodash';
import { Clear } from '@material-ui/icons';

export interface ScoreFilters {
  serviceIds: number[];
}

export const defaultFilters: ScoreFilters = {
  serviceIds: [],
}

interface HeatmapFiltersModalProps {
  filters: ScoreFilters;
  setFilters: (scoreFilters: ScoreFilters) => void;
  entitiesByTag: StringIndexable<HomepageEntity>;
}

const ModalSelect: React.FC<{
  name: string,
  value: number[],
  onChange: (value: number[]) => void,
  onReset: () => void,
  options: React.ReactNode
}> = ({ name, value, onChange, onReset, options }) => {
  return (
    <Box display="flex" flexDirection="row">
      <FormControl variant="standard" fullWidth>
        <InputLabel>{name}</InputLabel>
        <Select
          multiple
          value={value}
          onChange={event => onChange(event.target.value as number[])}
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
  const handleSaveFilters = () => {
    setFilters(modalFilters);
    setIsOpen(false);
  };
  const setModalOpenAndResetFilters = () => {
    setModalFilters(filters);
    setIsOpen(true);
  }

  const { services } = useMemo(() => {
    const entitiesByType = {
      services: [] as HomepageEntity[],
    };

    Object.keys(entitiesByTag).forEach((key) => {
      const entity = entitiesByTag[key];
      switch (entity.type) {
        case "service":
          entitiesByType.services.push(entity);
          break;
        default:
          break;
      }
    });

    return {
      services: sortBy(entitiesByType.services, "name")
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
        <ModalSelect
          name='Services'
          onChange={(serviceIds) => setModalFilters({ serviceIds })}
          onReset={() => setModalFilters({ serviceIds: defaultFilters.serviceIds })}
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
