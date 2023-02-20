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

const suffixes: Record<string, string> = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
};

const english_ordinal_rules = new Intl.PluralRules('en', { type: 'ordinal' });

export function ordinal(value: number) {
  return suffixes[english_ordinal_rules.select(value)];
}

// Only handles cases where the plural form has a suffix appended. Does not handle cases like baby => babies, person => people
export const maybePluralizeOnlyNoun = (
  count = 0,
  singularNoun = '',
  suffix = 's',
) => `${singularNoun}${count !== 1 ? suffix : ''}`;

export function maybePluralize(
  count: number = 0,
  singularNoun: string = '',
  suffix: string = 's',
): string {
  return `${count} ${maybePluralizeOnlyNoun(count, singularNoun, suffix)}`;
}

export const joinWithSpecialLastJoin = (
  strings: string[],
  {
    joiner = ', ',
    lastJoiner,
    lastJoinerWhenTwoItems = lastJoiner,
  }: {
    joiner?: string;
    lastJoiner: string;
    lastJoinerWhenTwoItems?: string;
  },
) => {
  if (strings.length === 1) {
    return strings[0];
  } else if (strings.length === 2) {
    return strings.join(lastJoinerWhenTwoItems);
  }
  return strings.slice(0, -1).join(joiner) + lastJoiner + strings.slice(-1);
};
