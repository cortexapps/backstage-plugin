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
import { FormControl, Select, MenuItem } from '@material-ui/core';
import React, { useMemo } from 'react';
import { getRuleTitle } from '../../../utils/ScorecardRules';
import { StringIndexable } from '../../ReportsPage/HeatmapPage/HeatmapUtils';
import { Rule, RuleOutcome } from '../../../api/types';

interface ScorecardsServiceRulesFilterProps {
  selected?: Rule;
  setSelected: (value?: Rule) => void;
  rules: RuleOutcome[];
}

const allRulesValue = 'all-rules';

const ScorecardsServiceRulesFilter: React.FC<ScorecardsServiceRulesFilterProps> =
  ({ selected, setSelected, rules }) => {
    const rulesMap: StringIndexable<Rule | undefined> = useMemo(() => {
      return rules.reduce(
        (acc, curr) => ({
          ...acc,
          [getRuleTitle(curr.rule)]: curr.rule,
        }),
        { [allRulesValue]: undefined },
      );
    }, [rules]);

    return (
      <FormControl>
        <Select
          value={selected ? getRuleTitle(selected) : allRulesValue}
          onChange={event =>
            setSelected(rulesMap[event.target.value as string])
          }
        >
          <MenuItem value={allRulesValue}>All rules</MenuItem>
          {rules.map(rule => (
            <MenuItem
              key={`rule-${rule.rule.id}`}
              value={getRuleTitle(rule.rule)}
            >
              {getRuleTitle(rule.rule)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

export default ScorecardsServiceRulesFilter;
