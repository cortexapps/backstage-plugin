import { isUndefined } from 'util';
import { RuleOutcome, ApplicableRuleOutcome } from '../../../api/types';

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
export const isPassingRule = (rule?: RuleOutcome) => {
  const score = (rule as ApplicableRuleOutcome).score;

  // We treat exempt rules as passing
  if (isUndefined(score)) return true;

  return score !== 0;
};

export const filterToFailingRules = (rules: RuleOutcome[]) => {
  return rules.filter(rule => !isPassingRule(rule));
};
