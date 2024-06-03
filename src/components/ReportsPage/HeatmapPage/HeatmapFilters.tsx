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
import { Checkbox, FormControlLabel, Grid, InputLabel } from "@material-ui/core";
import React, { ChangeEvent } from "react";
import { GroupByDropdown } from "../Common/GroupByDropdown";
import { HeaderTypeDropdown } from "../Common/HeaderTypeDropdown";
import { HeatmapFiltersModal, ScoreFilters } from "./HeatmapFiltersModal";
import { GroupByOption, HeaderType } from "../../../api/types";
import { StringIndexable } from "./HeatmapUtils";
import { HomepageEntity } from "../../../api/userInsightTypes";

export interface HeatmapPageFilters {
  selectedScorecardId?: number;
  groupBy: GroupByOption;
  headerType: HeaderType;
  scoreFilters: ScoreFilters;
  useHierarchy: boolean;
  hideWithoutChildren: boolean;
}

interface HeatmapFiltersProps {
  filters: HeatmapPageFilters;
  setFilters: (partialFilters: Partial<HeatmapPageFilters>) => void;
  entitiesByTag: StringIndexable<HomepageEntity>;
  excludedGroupBys: GroupByOption[];
}

export const HeatmapFilters: React.FC<HeatmapFiltersProps> = ({ filters, setFilters, entitiesByTag, excludedGroupBys }) => {
  const onGroupByChange = (event: ChangeEvent<{ value: unknown }>) => {
    const groupBy = event.target.value as GroupByOption;
    setFilters({ groupBy, useHierarchy: groupBy === GroupByOption.TEAM ? filters.useHierarchy : false });
  }

  const onHeaderTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFilters({ headerType: event.target.value as HeaderType });
  }

  return (
    <Grid container direction="row" justifyContent="space-between">
      <Grid item>
        <Grid container direction="row" spacing={2} alignItems="center">
          <Grid item>
            <GroupByDropdown excluded={excludedGroupBys} groupBy={filters.groupBy} setGroupBy={onGroupByChange} />
          </Grid>
          <Grid item>
            <HeaderTypeDropdown
              headerType={filters.headerType}
              setHeaderType={onHeaderTypeChange}
            />
          </Grid>
          {filters.groupBy === GroupByOption.TEAM && (
            <Grid item>
              <Grid container direction="row" alignItems="center">
                <FormControlLabel
                  aria-label='Use Team hierarchy'
                  control={
                    <Checkbox
                      checked={filters.useHierarchy}
                      onChange={() => setFilters({ useHierarchy: !filters.useHierarchy, hideWithoutChildren: true })}
                    />
                  }
                  label={
                    <InputLabel>
                      Use Team hierarchy
                    </InputLabel>
                  }
                />
                {filters.useHierarchy && (
                  <FormControlLabel
                    aria-label='Hide Teams with 0 entities'
                    control={
                      <Checkbox
                        checked={filters.hideWithoutChildren}
                        onChange={() => setFilters({ hideWithoutChildren: !filters.hideWithoutChildren })}
                      />
                    }
                    label={
                      <InputLabel>
                        Hide Teams with 0 entities
                      </InputLabel>
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
          setFilters={(scoreFilters) => setFilters({ scoreFilters })}
          entitiesByTag={entitiesByTag}
        />
      </Grid>
    </Grid>
  )
}
