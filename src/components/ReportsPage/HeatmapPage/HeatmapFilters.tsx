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
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from '@material-ui/core';
import React, { Dispatch } from 'react';
import { GroupByDropdown } from '../Common/GroupByDropdown';
import { HeaderTypeDropdown } from '../Common/HeaderTypeDropdown';
import { HeatmapFiltersModal, ScoreFilters } from './HeatmapFiltersModal';
import { GroupByOption, HeaderType, ScorecardLadder } from '../../../api/types';
import { StringIndexable } from './HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';

export interface HeatmapPageFilters {
  selectedScorecardId?: number;
  groupBy: GroupByOption;
  headerType: HeaderType;
  scoreFilters: ScoreFilters;
  useHierarchy: boolean;
  hideWithoutChildren: boolean;
  path?: string[];
}

interface HeatmapFiltersProps {
  filters: HeatmapPageFilters;
  setFiltersAndNavigate: Dispatch<React.SetStateAction<HeatmapPageFilters>>;
  entitiesByTag: StringIndexable<HomepageEntity>;
  excludedGroupBys: GroupByOption[];
  ladder: ScorecardLadder | undefined;
}

export const HeatmapFilters: React.FC<HeatmapFiltersProps> = ({
  filters,
  setFiltersAndNavigate,
  entitiesByTag,
  excludedGroupBys,
  ladder,
}) => {
  const isHierarchyToggleAllowed = [
    GroupByOption.TEAM,
    GroupByOption.DOMAIN,
  ].includes(filters.groupBy);

  const onGroupByChange = (groupBy: GroupByOption) => {
    setFiltersAndNavigate(prev => ({
      ...prev,
      groupBy,
      path: undefined,
      useHierarchy: isHierarchyToggleAllowed ? filters.useHierarchy : false,
    }));
  };

  const onHeaderTypeChange = (headerType: HeaderType) => {
    setFiltersAndNavigate(prev => ({ ...prev, headerType }));
  };

  return (
    <Grid container direction="row" justifyContent="space-between">
      <Grid item>
        <Grid container direction="row" spacing={2} alignItems="center">
          <Grid item>
            <GroupByDropdown
              excluded={excludedGroupBys}
              groupBy={filters.groupBy}
              setGroupBy={onGroupByChange}
            />
          </Grid>
          {ladder && (
            <Grid item>
              <HeaderTypeDropdown
                headerType={filters.headerType}
                setHeaderType={onHeaderTypeChange}
              />
            </Grid>
          )}
          {isHierarchyToggleAllowed && (
            <Grid item>
              <Grid container direction="row" alignItems="center">
                <FormControlLabel
                  aria-label={`Use ${filters.groupBy.toLowerCase()} hierarchy`}
                  control={
                    <Checkbox
                      checked={filters.useHierarchy}
                      onChange={() => {
                        setFiltersAndNavigate(prev => ({
                          ...prev,
                          useHierarchy: !filters.useHierarchy,
                          path: undefined,
                          hideWithoutChildren: true,
                        }));
                      }}
                    />
                  }
                  label={
                    <Typography variant={'subtitle2'}>
                      Use {filters.groupBy.toLowerCase()} hierarchy
                    </Typography>
                  }
                />
                {filters.useHierarchy && (
                  <FormControlLabel
                    aria-label={`Hide ${filters.groupBy.toLowerCase()}s with 0 entities`}
                    control={
                      <Checkbox
                        checked={filters.hideWithoutChildren}
                        onChange={() =>
                          setFiltersAndNavigate(prev => ({
                            ...prev,
                            hideWithoutChildren: !filters.hideWithoutChildren,
                          }))
                        }
                      />
                    }
                    label={
                      <Typography variant={'subtitle2'}>
                        Hide {filters.groupBy.toLowerCase()}s with 0 entities
                      </Typography>
                    }
                  />
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item>
        <HeatmapFiltersModal
          filters={filters.scoreFilters}
          setFilters={scoreFilters =>
            setFiltersAndNavigate(prev => ({ ...prev, scoreFilters }))
          }
          entitiesByTag={entitiesByTag}
          ladder={ladder}
        />
      </Grid>
    </Grid>
  );
};
