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
import { FilterDefinition, Filters } from './Filters';
import { CortexInfoCard } from '../Common/CortexInfoCard';
import { Box, makeStyles } from '@material-ui/core';

interface FilterCardProps {
  filterDefinitions: FilterDefinition[];
}

const useStyles = makeStyles(() => ({
  filterCardRoot: {
    width: 550,
    minWidth: 550,
  },
}));

export const FilterCard: React.FC<FilterCardProps> = ({
  filterDefinitions,
}) => {
  const classes = useStyles();

  return (
    <CortexInfoCard title="Filter By" className={classes.filterCardRoot}>
      <Box display="flex" gridGap={16} flexDirection="column">
        {filterDefinitions.map((filterDefinition, idx) => {
          return (
            <Filters
              key={`Filters-${filterDefinition.name}-${idx}`}
              {...filterDefinition}
            />
          );
        })}
      </Box>
    </CortexInfoCard>
  );
};
