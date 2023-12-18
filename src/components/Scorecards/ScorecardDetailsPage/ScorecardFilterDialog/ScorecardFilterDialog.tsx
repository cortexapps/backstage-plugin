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
  Scorecard,
  ScorecardServiceScore,
  ruleName,
} from '../../../../api/types';
import { FilterProvider, useFilter } from '../../../FilterCardNew/useFilter';
import { mapValues } from 'lodash';
import { mapByString } from '../../../../utils/collections';
import { useFilters } from '../../../../utils/hooks';
import { FilterCard } from '../../../FilterCardNew';
import { Progress } from '@backstage/core-components';
import { combinePredicates } from '../../../../utils/types';
import { ScorecardServiceScoreFilter } from '../ScorecardDetails';
import {
  groupAndSystemFilters,
  createApplicableRulePredicate,
  createExemptRulePredicate,
  createNotEvaluatedRulePredicate,
  toPredicateFilters,
} from './ScorecardFilterDialogUtils';

const useStyles = makeStyles(() => ({
  dialogContent: {
    padding: 0,
  },
}));

interface ScorecardFilterDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  scorecard: Scorecard;
  setFilter: Function;
}

export const ScorecardFilterDialog = ({
  isOpen,
  handleClose,
  scorecard,
  setFilter,
}: ScorecardFilterDialogProps) => {
  const classes = useStyles();
  const { checkedFilters, oneOf } = useFilter();

  const ruleFilterDefinitions = useMemo(() => {
    return mapValues(
      mapByString(scorecard.rules, rule => rule.id.toString()),
      rule => ({
        display: ruleName(rule),
        value: rule.expression,
        id: rule.id.toString(),
      }),
    );
  }, [scorecard.rules]);

  const { filterGroups, loading } = useFilters(
    (score: ScorecardServiceScore) => score.componentRef,
    {
      baseFilters: groupAndSystemFilters,
    },
  );

  const filtersDefinition = [
    {
      name: 'Failing Rule',
      filters: ruleFilterDefinitions,
      generatePredicate: (failingRule: string) =>
        createApplicableRulePredicate(false, failingRule),
    },
    {
      name: 'Passing Rule',
      filters: ruleFilterDefinitions,
      generatePredicate: (passingRule: string) =>
        createApplicableRulePredicate(true, passingRule),
    },
    {
      name: 'Exempt Rule',
      filters: ruleFilterDefinitions,
      generatePredicate: (exemptRule: string) =>
        createExemptRulePredicate(exemptRule),
    },
    {
      name: 'Rule Not Yet Evaluated',
      filters: ruleFilterDefinitions,
      generatePredicate: (notEvaluatedRule: string) =>
        createNotEvaluatedRulePredicate(notEvaluatedRule),
    },
    ...(filterGroups ?? []),
  ];

  const handleSaveFilters = () => {
    const allFilters: ScorecardServiceScoreFilter[] = [];

    filtersDefinition.forEach((filterDefinition, idx) => {
      const predicateFilters = toPredicateFilters(
        checkedFilters,
        filterDefinition.name,
      );
      const filterOneOf = oneOf[filterDefinition.name] ?? true;

      allFilters[idx] = (score: ScorecardServiceScore) => {
        const results = Object.keys(predicateFilters)
          .filter(id => predicateFilters[id])
          .map(id =>
            filterDefinition.generatePredicate(
              filterDefinition.filters[id].value,
            )(score),
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

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent className={classes.dialogContent}>
        {loading || filterGroups === undefined ? (
          <Progress />
        ) : (
          <FilterCard filterDefinitions={filtersDefinition} />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSaveFilters}
          color="primary"
          aria-label="Close modal"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ScorecardFilterDialogWrapper: React.FC<ScorecardFilterDialogProps> =
  props => {
    return (
      <FilterProvider>
        <ScorecardFilterDialog {...props} />
      </FilterProvider>
    );
  };
