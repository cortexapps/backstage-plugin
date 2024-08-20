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
import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { StringIndexable } from './HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { sortBy, uniqBy } from 'lodash';
import { Clear } from '@material-ui/icons';
import { ModalSelect, ModalSelectItem } from './HeatmapFiltersSelect';
import { ScorecardLadder } from '../../../api/types';

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
  filters: ScoreFilters;
  setFilters: (scoreFilters: ScoreFilters) => void;
  entitiesByTag: StringIndexable<HomepageEntity>;
  ladder: ScorecardLadder | undefined;
  onClear: () => void;
}

export const HeatmapFiltersModal: React.FC<HeatmapFiltersModalProps> = ({
  filters,
  setFilters,
  entitiesByTag,
  ladder,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState(filters);
  const setModalFiltersPartially = (filters: Partial<ScoreFilters>) =>
    setModalFilters(prev => ({ ...prev, ...filters }));
  const handleSaveFilters = () => {
    setFilters(modalFilters);
    setIsOpen(false);
  };
  const setModalOpenAndResetFilters = () => {
    setModalFilters(filters);
    setIsOpen(true);
  };

  const { services, groups, teams, users, domains } = useMemo(() => {
    const results = {
      services: [] as ModalSelectItem[],
      groups: [
        { value: "No group", label: "No group" },
      ] as ModalSelectItem[],
      teams: [
        { value: "No team", label: "No team" },
      ] as ModalSelectItem[],
      users: [] as ModalSelectItem[],
      domains: [
        { value: -1, label: "No domain" },
      ] as ModalSelectItem[],
    };

    Object.keys(entitiesByTag).forEach(key => {
      const entity = entitiesByTag[key];
      switch (entity.type) {
        case 'service':
          results.services.push({ label: entity.name, value: entity.id });
          break;
        case 'team':
          results.teams.push({ label: entity.name, value: entity.codeTag });
          break;
        case 'domain':
          results.domains.push({ label: entity.name, value: entity.id });
          break;
        default:
          break;
      }
      results.groups.push(
        ...entity.serviceGroupTags.map(groupTag => ({ label: groupTag, value: groupTag }))
      );
      results.users.push(
        ...entity.serviceOwnerEmails.map(owner => ({ label: owner.email, value: owner.email })),
      );
    });

    return {
      services: sortBy(results.services, 'label'),
      groups: sortBy(uniqBy(results.groups, 'value'), 'label'),
      teams: sortBy(results.teams, 'label'),
      users: sortBy(uniqBy(results.users, 'value'), 'label'),
      domains: sortBy(results.domains, 'label'),
    };
  }, [entitiesByTag]);

  const levels = useMemo(
    () => [...(ladder?.levels.map(({ name }) => name) ?? []), 'No Level'],
    [ladder],
  );

  const filtersCount = useMemo(() => {
    return Object.values(filters).reduce(
      (total, item) => total + item.length,
      0,
    );
  }, [filters]);

  return (
    <>
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
          onClick={onClear}
          variant="text"
          aria-label="Clear filters"
          title="Clear filters"
        >
          <Clear />
        </Button>
      )}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
        <DialogTitle>Filter Bird's Eye Report</DialogTitle>
        <DialogContent>
          <Box display={'flex'} flexDirection={'column'} gridRowGap={16}>
            <ModalSelect
              name="Entities"
              onChange={serviceIds => setModalFiltersPartially({ serviceIds })}
              onReset={() =>
                setModalFiltersPartially({
                  serviceIds: defaultFilters.serviceIds,
                })
              }
              value={modalFilters.serviceIds}
              options={services}
            />
            <ModalSelect
              name="Domains"
              onChange={domainIds => setModalFiltersPartially({ domainIds })}
              onReset={() =>
                setModalFiltersPartially({
                  domainIds: defaultFilters.domainIds,
                })
              }
              value={modalFilters.domainIds}
              options={domains}
            />
            <ModalSelect
              name="Groups"
              onChange={groups => setModalFiltersPartially({ groups })}
              onReset={() =>
                setModalFiltersPartially({ groups: defaultFilters.groups })
              }
              value={modalFilters.groups}
              options={groups}
            />
            <ModalSelect
              name="Teams"
              onChange={teams => setModalFiltersPartially({ teams })}
              onReset={() =>
                setModalFiltersPartially({ teams: defaultFilters.teams })
              }
              value={modalFilters.teams}
              options={teams}
            />
            <ModalSelect
              name="Users"
              onChange={users => setModalFiltersPartially({ users })}
              onReset={() =>
                setModalFiltersPartially({ users: defaultFilters.users })
              }
              value={modalFilters.users}
              options={users}
            />
            {levels?.length && (
              <ModalSelect
                name="Levels"
                onChange={levels => setModalFiltersPartially({ levels })}
                onReset={() =>
                  setModalFiltersPartially({ levels: defaultFilters.levels })
                }
                value={modalFilters.levels}
                options={levels.map(level => ({ label: level, value: level }))}
              />
            )}
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
    </>
  );
};
