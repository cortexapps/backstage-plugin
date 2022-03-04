/*
 * Copyright 2021 Cortex Applications, Inc.
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
import { ruleName } from '../api/types';

export function isRulePassing<T extends { score: number }>(rule: T): boolean {
  return rule.score > 0;
}

export function isRuleFailing<T extends { score: number }>(rule: T): boolean {
  return rule.score === 0;
}

export function filterPassingRules<T extends { score: number }>(
  rules: T[],
): T[] {
  return rules.filter(isRulePassing);
}

export function filterFailingRules<T extends { score: number }>(
  rules: T[],
): T[] {
  return rules.filter(isRuleFailing);
}

type Comparator<T> = (a: T, b: T) => number; // -1 | 0 | 1

function chainedComparator<T>(...comparators: Comparator<T>[]): Comparator<T> {
  return (a: T, b: T) => {
    let order = 0;
    let i = 0;

    while (!order && comparators[i]) {
      order = comparators[i++](a, b);
    }

    return order;
  };
}

export function sortRules<
  T extends {
    expression: string;
    title?: string;
    score?: number;
    weight?: number;
  },
>(rules: T[]) {
  return [...rules].sort(
    chainedComparator(
      (a, b) => (b?.score ?? 0) - (a?.score ?? 0),
      (a, b) => (b?.weight ?? 0) - (a?.weight ?? 0),
      (a, b) => ruleName(a).localeCompare(ruleName(b)),
    ),
  );
}
