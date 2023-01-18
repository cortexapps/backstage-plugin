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
import { percentify, safeDivide } from './NumberUtils';

describe('NumberUtils', () => {
  it('percentify handles 0', () => {
    expect(percentify(0)).toBe(0);
  });

  it('percentify handles 1', () => {
    expect(percentify(1)).toBe(100);
  });

  it('percentify handles decimals less than 1 that lack precise float representation', () => {
    expect(percentify(0.58)).toBe(58);
  });

  it('percentify handles values greater than 1', () => {
    expect(percentify(29)).toBe(29);
  });

  it('safeDivide should handle 0 in the denominator', () => {
    expect(safeDivide(2, 0)).toBe(0);
  });

  it('safeDivide should handle normal division', () => {
    expect(safeDivide(1, 2)).toBe(0.5);
  });
});
