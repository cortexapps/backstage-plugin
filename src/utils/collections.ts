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
export function groupByString<T>(
  items: T[],
  property: (item: T) => string | undefined,
): Record<string, T[]> {
  return items.reduce((obj: Record<string, T[]>, item: T) => {
    const key = property(item);
    if (key !== undefined) {
      const arr: T[] = obj[key] ?? [];
      arr.push(item);
      obj[key] = arr;
    }
    return obj;
  }, {});
}

export function mapByString<T>(
  items: T[],
  property: (item: T) => string | undefined,
): Record<string, T> {
  return items.reduce((obj: Record<string, T>, item: T) => {
    const key = property(item);
    if (key !== undefined) {
      obj[key] = item;
    }
    return obj;
  }, {});
}

export function mapValues<T, U>(
  obj: Record<string, T>,
  f: (t: T) => U,
): Record<string, U> {
  const out: Record<string, U> = {};
  Object.keys(obj).forEach(key => {
    out[key] = f(obj[key]);
  });

  return out;
}

export function filterNotUndefined<T>(items: (T | undefined)[]): T[] {
  const arr: T[] = [];
  for (const item of items) {
    if (item !== undefined) {
      arr.push(item);
    }
  }

  return arr;
}

export function dedupeByString<T>(items: T[], key: (item: T) => string): T[] {
  const grouped = groupByString(items, key);

  return filterNotUndefined(Object.keys(grouped).map(k => grouped[k][0]));
}
