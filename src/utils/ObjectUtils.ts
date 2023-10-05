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
import { StringIndexable } from '../components/ReportsPage/HeatmapPage/HeatmapUtils';
import { Predicate } from './types';

export const filterByValues = <T>(
  obj: StringIndexable<T>,
  map: Predicate<T>,
): StringIndexable<T> => {
  let out: StringIndexable<T> = {};
  Object.keys(obj).forEach((key: string) => {
    const val = obj[key];
    if (map(val)) {
      out[key] = val;
    }
  });

  return out;
};
