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
import React from "react";
import { GroupByDropdown } from "../Common/GroupByDropdown";
import { HeaderTypeDropdown } from "../Common/HeaderTypeDropdown";
import { HeatmapFiltersModal, ScoreFilters } from "./HeatmapFiltersModal";
import { GroupByOption, HeaderType, ScorecardLadder } from "../../../api/types";
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
  setFiltersAndNavigate: (partialFilters: Partial<HeatmapPageFilters>) => void;
  entitiesByTag: StringIndexable<HomepageEntity>;
  excludedGroupBys: GroupByOption[];
  ladder: ScorecardLadder | undefined;
}

export const HeatmapFilters: React.FC<HeatmapFiltersProps> = ({ filters, setFiltersAndNavigate, entitiesByTag, excludedGroupBys, ladder }) => {
  const isHierarchyToggleAllowed = [GroupByOption.TEAM, GroupByOption.DOMAIN].includes(filters.groupBy);

  const onGroupByChange = (groupBy: GroupByOption) => {
    setFiltersAndNavigate({ groupBy, useHierarchy: isHierarchyToggleAllowed ? filters.useHierarchy : false });
  }

  const onHeaderTypeChange = (headerType: HeaderType) => {
    setFiltersAndNavigate({ headerType });
  }

  return (
    <Grid container direction="row" justifyContent="space-between">
      <Grid item>
        <Grid container direction="row" spacing={2} alignItems="center">
          <Grid item>
            <GroupByDropdown excluded={excludedGroupBys} groupBy={filters.groupBy} setGroupBy={onGroupByChange} />
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
                  aria-label={`Use ${filters.groupBy} hierarchy`}
                  control={
                    <Checkbox
                      checked={filters.useHierarchy}
                      onChange={() => setFiltersAndNavigate({ useHierarchy: !filters.useHierarchy, hideWithoutChildren: true })}
                    />
                  }
                  label={
                    <InputLabel>
                      Use {filters.groupBy} hierarchy
                    </InputLabel>
                  }
                />
                {filters.useHierarchy && (
                  <FormControlLabel
                    aria-label={`Hide ${filters.groupBy}s with 0 entities`}
                    control={
                      <Checkbox
                        checked={filters.hideWithoutChildren}
                        onChange={() => setFiltersAndNavigate({ hideWithoutChildren: !filters.hideWithoutChildren })}
                      />
                    }
                    label={
                      <InputLabel>
                        Hide {filters.groupBy}s with 0 entities
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
          setFilters={(scoreFilters) => setFiltersAndNavigate({ scoreFilters })}
          entitiesByTag={entitiesByTag}
          ladder={ladder}
        />
      </Grid>
    </Grid>
  )
}
