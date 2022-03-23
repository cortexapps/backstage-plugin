/*
 * Copyright 2022 Cortex Applications, Inc.
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
  ruleName,
  Scorecard,
  ScorecardServiceScore,
} from '../../../../api/types';
import { ScorecardServiceScoreFilter } from '../ScorecardDetails';
import { FilterCard } from '../../../FilterCard';
import { mapByString, mapValues } from '../../../../utils/collections';
import { useFilters } from '../../../../utils/hooks';
import { Progress } from '@backstage/core-components';
import {
  humanizeEntityRef,
  getEntityRelations,
} from '@backstage/plugin-catalog-react';
import {
  parseEntityRef,
  RELATION_OWNED_BY,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import { stringifyAnyEntityRef } from '../../../../utils/types';
import {
  defaultGroupRefContext,
  defaultSystemRefContext,
} from '../../../../utils/ComponentUtils';

const createRulePredicate = (pass: boolean, ruleExpression: string) => {
  return (score: ScorecardServiceScore) => {
    const rulePassed =
      (score.rules.find(rule => ruleExpression === rule.rule.expression)
        ?.score ?? 0) > 0;

    return rulePassed === pass;
  };
};

interface ScorecardFilterCardProps {
  scorecard: Scorecard;
  setFilter: (filter: ScorecardServiceScoreFilter) => void;
}

export const ScorecardFilterCard = ({
  scorecard,
  setFilter,
}: ScorecardFilterCardProps) => {
  const ruleFilterDefinitions = useMemo(() => {
    return mapValues(
      mapByString(scorecard.rules, rule => rule.id.toString()),
      rule => {
        return {
          display: ruleName(rule),
          value: rule.expression,
        };
      },
    );
  }, [scorecard.rules]);

  const { filterGroups, loading } = useFilters(
    (score: ScorecardServiceScore) => score.componentRef,
    {
      baseFilters: [
        {
          name: 'Groups',
          groupProperty: entity =>
            getEntityRelations(entity, RELATION_OWNED_BY, {
              kind: 'group',
            }).map(entityRef =>
              stringifyAnyEntityRef(entityRef, { defaultKind: 'group' }),
            ),
          formatProperty: (groupRef: string) =>
            humanizeEntityRef(
              parseEntityRef(groupRef),
              defaultGroupRefContext,
            ),
        },
        {
          name: 'Systems',
          groupProperty: entity =>
            getEntityRelations(entity, RELATION_PART_OF, {
              kind: 'system',
            }).map(entityRef =>
              stringifyAnyEntityRef(entityRef, { defaultKind: 'system' }),
            ),
          formatProperty: (groupRef: string) =>
            humanizeEntityRef(
              parseEntityRef(groupRef),
              defaultSystemRefContext,
            ),
        },
      ],
    },
  );

  if (loading || filterGroups === undefined) {
    return <Progress />;
  }

  return (
    <FilterCard
      setFilter={setFilter}
      filterDefinitions={[
        {
          name: 'Failing Rule',
          filters: ruleFilterDefinitions,
          generatePredicate: (failingRule: string) =>
            createRulePredicate(false, failingRule),
        },
        {
          name: 'Passing Rule',
          filters: ruleFilterDefinitions,
          generatePredicate: (passingRule: string) =>
            createRulePredicate(true, passingRule),
        },
        ...filterGroups,
      ]}
    />
  );
};
