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
import React, { useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  makeStyles,
} from '@material-ui/core';
import {
  Initiative,
  InitiativeActionItem,
  ruleName,
} from '../../../../api/types';
import { FilterProvider, useFilter } from '../../../FilterCard/useFilter';
import { mapValues } from 'lodash';
import { mapByString } from '../../../../utils/collections';
import { FilterCard } from '../../../FilterCard';
import { AnyEntityRef, combinePredicates } from '../../../../utils/types';
import {
  toPredicateFilters,
  InitiativeFilter,
  groupAndSystemFilters,
} from './InitiativeFilterDialogUtils';
import { useFilters, useInitiativesCustomName } from '../../../../utils/hooks';
import { Progress } from '@backstage/core-components';

const useStyles = makeStyles(() => ({
  dialogContent: {
    padding: 0,
  },
}));

const createRulePredicate = (
  rule: string,
  actionItems: InitiativeActionItem[],
  pass: boolean,
) => {
  return (componentRef: AnyEntityRef) => {
    const passed = !actionItems.some(
      actionItem =>
        actionItem.componentRef === componentRef &&
        actionItem.rule.expression === rule,
    );

    return passed === pass;
  };
};

interface InitiativeFilterDialogProps {
  handleClose: () => void;
  initiative: Initiative;
  actionItems: InitiativeActionItem[];
  isOpen: boolean;
  setFilter: (filter: InitiativeFilter) => void;
}

const InitiativeFilterDialog = ({
  initiative,
  isOpen,
  actionItems,
  handleClose,
  setFilter,
}: InitiativeFilterDialogProps) => {
  const classes = useStyles();
  const { checkedFilters, oneOf } = useFilter();

  const ruleFilterDefinitions = useMemo(() => {
    return mapValues(
      mapByString(initiative.rules, rule => `${rule.ruleId}`),
      rule => {
        return {
          display: ruleName(rule),
          value: rule.expression,
          id: rule.ruleId.toString(),
        };
      },
    );
  }, [initiative.rules]);

  const { filterGroups, loading } = useFilters(
    (entityRef: string) => entityRef,
    {
      baseFilters: groupAndSystemFilters,
    },
  );

  const filtersDefinition = [
    {
      name: 'Failing rules',
      filters: ruleFilterDefinitions,
      generatePredicate: (failingRule: string) =>
        createRulePredicate(failingRule, actionItems, false),
    },
    {
      name: 'Passing rules',
      filters: ruleFilterDefinitions,
      generatePredicate: (passingRule: string) =>
        createRulePredicate(passingRule, actionItems, true),
    },
    ...(filterGroups ?? []),
  ];

  const handleSaveFilters = () => {
    const allFilters: InitiativeFilter[] = [];

    filtersDefinition.forEach((filterDefinition, idx) => {
      const predicateFilters = toPredicateFilters(
        checkedFilters,
        filterDefinition.name,
      );
      const filterOneOf = oneOf[filterDefinition.name] ?? true;

      allFilters[idx] = (componentRef: string) => {
        const results = Object.keys(predicateFilters)
          .filter(id => predicateFilters[id])
          .map(id =>
            filterDefinition.generatePredicate(
              filterDefinition.filters[id].value,
            )(componentRef),
          );

        if (results.length === 0) {
          return true;
        }

        return filterOneOf ? results.some(Boolean) : results.every(Boolean);
      };
    });

    setFilter(combinePredicates(Object.values(allFilters)));

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
    return (
      <FilterProvider>
        <InitiativeFilterDialog {...props} />
      </FilterProvider>
    );
  };
