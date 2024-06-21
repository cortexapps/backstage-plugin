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
import { Progress } from '@backstage/core-components';
import {
  makeStyles,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';
import React from 'react';
import { useFilters, useInitiativesCustomName } from '../../../../utils/hooks';
import { FilterCard } from '../../../FilterCard';
import { FilterDefinitionWithPredicate } from '../../../FilterCard/Filters';
import { useFilter } from '../../../FilterCard/useFilter';
import { groupAndSystemFilters } from '../InitativeFilterDialog/InitiativeFilterDialogUtils';

const useStyles = makeStyles(() => ({
  dialogContent: {
    padding: 0,
  },
}));

interface InitiativeFilterFormProps {
  filtersDefinition: FilterDefinitionWithPredicate<string>[];
  onSave: (filters: {
    checkedFilters: Record<string, boolean>;
    oneOf: Record<string, boolean>;
  }) => void;
}

export const InitiativeFilterForm = ({
  filtersDefinition: filtersDefinitionProp,
  onSave,
}: InitiativeFilterFormProps) => {
  const classes = useStyles();
  const { checkedFilters, oneOf } = useFilter();

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

  const { singular: initiativeName } = useInitiativesCustomName();

  return (
    <>
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
          onClick={() => onSave({ checkedFilters, oneOf })}
          color="primary"
          aria-label="Apply filters"
        >
          Apply filters
        </Button>
      </DialogActions>
    </>
  );
};
