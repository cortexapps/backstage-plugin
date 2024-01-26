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
  ScorecardLadder,
  ScorecardServiceScore,
  ruleName,
} from '../../../../api/types';
import { FilterProvider, useFilter } from '../../../FilterCard/useFilter';
import { mapValues } from 'lodash';
import { mapByString } from '../../../../utils/collections';
import { useFilters } from '../../../../utils/hooks';
import { FilterCard } from '../../../FilterCard';
import { Progress } from '@backstage/core-components';
import { combinePredicates } from '../../../../utils/types';
import { ScorecardServiceScoreFilter } from '../ScorecardDetails';
import {
  groupAndSystemFilters,
  createApplicableRulePredicate,
  createExemptRulePredicate,
  createNotEvaluatedRulePredicate,
  toPredicateFilters,
  createLevelPredicate,
} from './ScorecardFilterDialogUtils';
import { FilterDefinition } from '../../../FilterCard/Filters';

const useStyles = makeStyles(() => ({
  dialogContent: {
    padding: 0,
  },
}));

interface ScorecardFilterDialogProps {
  handleClose: () => void;
  isOpen: boolean;
  ladder?: ScorecardLadder;
  scorecard: Scorecard;
  setFilter: Function;
}

export const ScorecardFilterDialog = ({
  handleClose,
  isOpen,
  ladder,
  scorecard,
  setFilter,
}: ScorecardFilterDialogProps) => {
  const classes = useStyles();
  const { checkedFilters, oneOf } = useFilter();

  const ruleFilterDefinitions: FilterDefinition['filters'] = useMemo(() => {
    return mapValues(
      mapByString(scorecard.rules, rule => rule.id.toString()),
      rule => ({
        display: ruleName(rule),
        value: rule.expression,
        id: rule.id.toString(),
      }),
    );
  }, [scorecard.rules]);

  const levelDefinitions: FilterDefinition['filters'] = useMemo(() => {
    if (!ladder || !ladder.levels) {
      return {};
    }

    const sortedLevels = ladder.levels.sort(
      (level1, level2) => level2.rank - level1.rank,
    );

    return {
      'No level': {
        display: 'No level',
        value: '',
        id: '',
      },
      ...mapValues(
        mapByString(sortedLevels, level => level.id.toString()),
        level => ({
          display: level.name,
          value: level.id.toString(),
          id: level.id.toString(),
        }),
      ),
    };
  }, [ladder]);

  const { filterGroups, loading } = useFilters(
    (score: ScorecardServiceScore) => score.componentRef,
    {
      baseFilters: groupAndSystemFilters,
    },
  );

  const filtersDefinition = [
    {
      name: 'Levels',
      oneOfDisabled: true,
      filters: levelDefinitions,
      generatePredicate: (level: string) => createLevelPredicate(level),
    },
    {
      name: 'Failing rules',
      filters: ruleFilterDefinitions,
      generatePredicate: (failingRule: string) =>
        createApplicableRulePredicate(false, failingRule),
    },
    {
      name: 'Passing rules',
      filters: ruleFilterDefinitions,
      generatePredicate: (passingRule: string) =>
        createApplicableRulePredicate(true, passingRule),
    },
    {
      name: 'Exempt rules',
      filters: ruleFilterDefinitions,
      generatePredicate: (exemptRule: string) =>
        createExemptRulePredicate(exemptRule),
    },
    {
      name: 'Rules not yet evaluated',
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
          <FilterCard
            filterDefinitions={filtersDefinition}
            title="Filter Scorecard"
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

export const ScorecardFilterDialogWrapper: React.FC<ScorecardFilterDialogProps> =
  props => {
    return (
      <FilterProvider>
        <ScorecardFilterDialog {...props} />
      </FilterProvider>
    );
  };
