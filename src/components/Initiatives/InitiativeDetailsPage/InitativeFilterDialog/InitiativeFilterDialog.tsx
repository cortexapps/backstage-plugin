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
import { useLocation, useNavigate } from 'react-router';
import { stringifyUrl } from 'query-string';
import { Dialog } from '@material-ui/core';
import { FilterProvider } from '../../../FilterCard/useFilter';
import {
  InitiativeFilter,
  toQueryParams,
  useFiltersFromQueryParams,
  getPredicateFilterFromFilters,
} from './InitiativeFilterDialogUtils';
import { FilterDefinitionWithPredicate } from '../../../FilterCard/Filters';
import { InitiativeFilterForm } from '../InitiativeFilterForm/InitiativeFilterForm';

interface InitiativeFilterDialogProps {
  filters: Record<string, boolean>;
  filtersDefinition: FilterDefinitionWithPredicate<string>[];
  handleClose: () => void;
  oneOf: Record<string, boolean>;
  onSave: (filters: {
    checkedFilters: Record<string, boolean>;
    oneOf: Record<string, boolean>;
  }) => void;
  isOpen: boolean;
  setFilter: (filter: InitiativeFilter) => void;
}

export const InitiativeFilterDialog: React.FC<InitiativeFilterDialogProps> = ({
  filtersDefinition,
  handleClose,
  setFilter,
  isOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filters, oneOf } = useFiltersFromQueryParams(location.search);

  const handleSaveFilters = ({
    checkedFilters,
    oneOf,
  }: {
    checkedFilters: Record<string, boolean>;
    oneOf: Record<string, boolean>;
  }) => {
    const predicateFilter = getPredicateFilterFromFilters(
      checkedFilters,
      oneOf,
      filtersDefinition,
    );

    const queryParams = toQueryParams(checkedFilters, oneOf, filtersDefinition);

    setFilter(predicateFilter);

    navigate(
      stringifyUrl({
        url: location.pathname,
        query: queryParams,
      }),
      { replace: true },
    );

    handleClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <FilterProvider initialCheckedFilters={filters} initialOneOf={oneOf}>
        <InitiativeFilterForm
          filtersDefinition={filtersDefinition}
          onSave={handleSaveFilters}
        />
      </FilterProvider>
    </Dialog>
  );
};
