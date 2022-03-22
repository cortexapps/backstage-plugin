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
import { List, ListItem, Typography } from '@material-ui/core';
import { RuleResultDetails } from './RuleResultDetails';
import { ruleName, ScorecardServiceScoresRule } from '../../../../api/types';

interface ScorecardResultDetailsProps {
  rules: ScorecardServiceScoresRule[];
  hideWeights?: boolean;
}

export const ScorecardResultDetails = ({
  rules,
  hideWeights,
}: ScorecardResultDetailsProps) => {
  const sortedRules = useMemo(
    () =>
      [...rules].sort((a, b) => {
        if (a.score === b.score) {
          return ruleName(a.rule).localeCompare(ruleName(b.rule));
        }

        return a.score - b.score;
      }),
    [rules],
  );

  return (
    <List>
      {sortedRules.length === 0 && (
        <ListItem alignItems="flex-start">
          <Typography variant="body1">No rules.</Typography>
        </ListItem>
      )}
      {sortedRules.map(rule => (
        <RuleResultDetails
          key={`RuleResultDetails-${rule.rule.id}`}
          rule={rule}
          hideWeight={hideWeights}
        />
      ))}
    </List>
  );
};
