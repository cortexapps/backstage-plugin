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
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem } from '@material-ui/core';
import { StringIndexable } from './HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { sortBy, uniq } from 'lodash';
import { Clear } from '@material-ui/icons';
import { ModalSelect } from './HeatmapFiltersSelect';

export interface ScoreFilters {
  serviceIds: number[];
  groups: string[];
  teams: string[];
  users: string[];
}

export const defaultFilters: ScoreFilters = {
  serviceIds: [],
  groups: [],
  teams: [],
  users: [],
}

interface HeatmapFiltersModalProps {
  filters: ScoreFilters;
  setFilters: (scoreFilters: ScoreFilters) => void;
  entitiesByTag: StringIndexable<HomepageEntity>;
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

  const { services, groups, teams, users } = useMemo(() => {
    const results = {
      services: [] as HomepageEntity[],
      groups: [] as string[],
      teams: [] as HomepageEntity[],
      users: [] as string[],
    };

    Object.keys(entitiesByTag).forEach((key) => {
      const entity = entitiesByTag[key];
      switch (entity.type) {
        case "service":
          results.services.push(entity);
          break;
        case "team":
          results.teams.push(entity);
          break;
        default:
          break;
      }
      results.groups.push(...entity.serviceGroupTags);
      results.users.push(...entity.serviceOwnerEmails.map((owner) => owner.email));
    });

    return {
      services: sortBy(results.services, "name"),
      groups: sortBy(uniq(results.groups)),
      teams: sortBy(results.teams, "name"),
      users: sortBy(uniq(results.users)),
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
                key={`ScorecardOption-service-${service.id}`}
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
                key={`ScorecardOption-group-${groupTag}`}
                value={groupTag}
              >
                {groupTag}
              </MenuItem>
            ))}
          />
          <ModalSelect
            name='Teams'
            onChange={(teams) => setModalFiltersPartially({ teams })}
            onReset={() => setModalFiltersPartially({ teams: defaultFilters.teams })}
            value={modalFilters.teams}
            options={teams.map((team) => (
              <MenuItem
                key={`ScorecardOption-team-${team.id}`}
                value={team.codeTag}
              >
                {team.codeTag}
              </MenuItem>
            ))}
          />
          <ModalSelect
            name='Users'
            onChange={(users) => setModalFiltersPartially({ users })}
            onReset={() => setModalFiltersPartially({ users: defaultFilters.users })}
            value={modalFilters.users}
            options={users.map((usersEmail) => (
              <MenuItem
                key={`ScorecardOption-user-${usersEmail}`}
                value={usersEmail}
              >
                {usersEmail}
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
