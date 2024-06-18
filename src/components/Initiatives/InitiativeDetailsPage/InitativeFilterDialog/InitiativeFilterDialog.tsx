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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  makeStyles,
} from '@material-ui/core';
import { FilterProvider, useFilter } from '../../../FilterCard/useFilter';
import { FilterCard } from '../../../FilterCard';
import {
  InitiativeFilter,
  groupAndSystemFilters,
  toQueryParams,
  useFiltersFromQueryParams,
  getPredicateFilterFromFilters,
} from './InitiativeFilterDialogUtils';
import { useFilters, useInitiativesCustomName } from '../../../../utils/hooks';
import { Progress } from '@backstage/core-components';
import { FilterDefinitionWithPredicate } from '../../../FilterCard/Filters';
import { useLocation, useNavigate } from 'react-router';
import { stringifyUrl } from 'query-string';

const useStyles = makeStyles(() => ({
  dialogContent: {
    padding: 0,
  },
}));

interface InitiativeFilterDialogProps {
  filtersDefinition: FilterDefinitionWithPredicate<string>[];
  handleClose: () => void;
  isOpen: boolean;
  setFilter: (filter: InitiativeFilter) => void;
}

const InitiativeFilterDialog = ({
  filtersDefinition: filtersDefinitionProp,
  handleClose,
  isOpen,
  setFilter,
}: InitiativeFilterDialogProps) => {
  const classes = useStyles();
  const { checkedFilters, oneOf } = useFilter();
  const location = useLocation();
  const navigate = useNavigate();

  const { filterGroups, loading } = useFilters(
    (entityRef: string) => entityRef,
    {
      baseFilters: groupAndSystemFilters,
    },
  );

  const filtersDefinition: FilterDefinitionWithPredicate<string>[] = [
    ...filtersDefinitionProp,
    ...(filterGroups ?? []),
  ];

  const handleSaveFilters = () => {
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

  const { singular: initiativeName } = useInitiativesCustomName();

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Progress />
        ) : (
          <FilterCard
            filterDefinitions={filtersDefinition}
            title={`Filter ${initiativeName}`}
          />
        )}
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
  );
};

export const InitiativeFilterDialogWrapper: React.FC<InitiativeFilterDialogProps> =
  props => {
    const { filters, oneOf } = useFiltersFromQueryParams(
      window.location.search,
    );

    return (
      <FilterProvider initialCheckedFilters={filters} initialOneOf={oneOf}>
        <InitiativeFilterDialog {...props} />
      </FilterProvider>
    );
  };
