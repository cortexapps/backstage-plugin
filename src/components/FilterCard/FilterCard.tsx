/*
 * Copyright 2021 Cortex Applications, Inc.
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
import { InfoCard } from '@backstage/core-components';
import React, { useState } from 'react';
import { useDetailCardStyles } from '../../styles/styles';
import { combinePredicates, Predicate } from '../../utils/types';
import { FilterDefinition, Filters } from './Filters';

interface FilterCardProps<T> {
  setFilter: (filter: Predicate<T>) => void;
  filterDefinitions: FilterDefinition<T, any>[];
}

export const FilterCard = <T extends {}>({
  setFilter,
  filterDefinitions,
}: FilterCardProps<T>) => {
  const classes = useDetailCardStyles();

  const [_, setAllFilters] = useState<Predicate<T>[]>([]);

  const updateFilter = (i: number, filter: Predicate<T>) => {
    setAllFilters(prevFilters => {
      const newFilters = [...prevFilters];
      newFilters[i] = filter;
      setFilter(combinePredicates(Object.values(newFilters)));
      return newFilters;
    });
  };

  return (
    <InfoCard title="Filter By" className={classes.root}>
      {filterDefinitions.map((filterDefinition, i) => {
        const setPredicate = (filter: Predicate<T>) => updateFilter(i, filter);
        return (
          <Filters key={i} setPredicate={setPredicate} {...filterDefinition} />
        );
      })}
    </InfoCard>
  );
};
