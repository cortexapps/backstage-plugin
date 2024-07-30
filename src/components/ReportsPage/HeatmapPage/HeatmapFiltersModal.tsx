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
import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { size } from 'lodash';
import { ModalSelect } from './HeatmapFiltersSelect';
import { DataFilterTypes, FilterConfigItem } from '@cortexapps/birdseye';

export interface ScoreFilters {
  serviceIds: number[];
  groups: string[];
  teams: string[];
  users: string[];
  domainIds: number[];
  levels: string[];
}

export const defaultFilters: ScoreFilters = {
  serviceIds: [],
  groups: [],
  teams: [],
  users: [],
  domainIds: [],
  levels: [],
};

interface HeatmapFiltersModalProps {
  filters: DataFilterTypes;
  filtersConfig: FilterConfigItem[];
  isOpen: boolean;
  setFilters: (filters: DataFilterTypes) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const HeatmapFiltersModal: React.FC<HeatmapFiltersModalProps> = ({
  filters,
  filtersConfig,
  isOpen,
  setFilters,
  setIsOpen,
}) => {
  const [updatedFilters, setUpdatedFilters] = useState<DataFilterTypes>(filters);

  const filterChangeHandler = useCallback((type: keyof DataFilterTypes, value: string[]) => {
    setUpdatedFilters({
      ...updatedFilters,
      [type]: value,
    });
  }, [updatedFilters]);

  const filterClearHandler = useCallback((type: keyof DataFilterTypes) => {
    setUpdatedFilters({
      ...updatedFilters,
      [type]: [],
    });
  }, [updatedFilters]);

  const applyFiltersHandler = useCallback(() => {
    setFilters(updatedFilters);
    setIsOpen(false);
  }, [setFilters, setIsOpen, updatedFilters]);

  useEffect(() => {
    setUpdatedFilters(filters);
  }, [filters, isOpen]);

  return (
    <>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
        <DialogTitle>Filter Bird's Eye Report</DialogTitle>
        <DialogContent>
          <Box display={'flex'} flexDirection={'column'} gridRowGap={16}>
            {
              filtersConfig.map(config => {
                if (size(config.options) === 0) {
                  return null;
                }

                return (
                  <ModalSelect
                    key={config.key}
                    name={config.label}
                    onChange={(values) => filterChangeHandler(config.key as keyof DataFilterTypes, values)}
                    onReset={() => filterClearHandler(config.key as keyof DataFilterTypes)}
                    value={updatedFilters[config.key as keyof DataFilterTypes]}
                    options={config.options.map(option => ({ label: option, value: option }))}
                  />
                );
              })
            }
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={applyFiltersHandler}
            color="primary"
            aria-label="Apply filters"
          >
            Apply filters
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
