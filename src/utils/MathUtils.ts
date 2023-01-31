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

export type ExponentialBackoffOptions = {
  /** Starting delay, in milliseconds */
  initialDelay: number;
  maxDelay?: number;
  maxTries?: number;
  multiplier: number;
  numTries?: number;
};

/**
 * Immutable ExponentialBackoff helper
 *
 * @param multiplier Multiplier for exponential growth (e.g. 2.0 would yield [1000 -> 2000 -> 4000])
 * @param maxDelay Ceiling for delay, subsequent advances will not increase delay
 * @param maxTries Max tries, after which delay will return null
 * @param numTries Starting point for number of tries
 */
export class ExponentialBackoff {
  currentDelay;
  maxDelay;
  maxTries;
  multiplier;
  numTries;

  constructor(opts: ExponentialBackoffOptions) {
    const { initialDelay, multiplier, maxDelay, maxTries, numTries } = opts;
    this.currentDelay = initialDelay;
    this.maxDelay = maxDelay ?? Number.MAX_SAFE_INTEGER;
    this.maxTries = maxTries;
    this.multiplier = multiplier;
    this.numTries = numTries ?? 0;
  }

  delay(): number | null {
    if (this.numTries === this.maxTries) {
      return null;
    }
    return Math.min(this.currentDelay, this.maxDelay);
  }

  advance(): ExponentialBackoff {
    let nextDelay = Math.min(
      this.currentDelay * this.multiplier,
      this.maxDelay ?? Number.MAX_SAFE_INTEGER,
    );

    return new ExponentialBackoff({
      initialDelay: nextDelay,
      multiplier: this.multiplier,
      maxDelay: this.maxDelay,
      maxTries: this.maxTries,
      numTries: this.numTries + 1,
    });
  }
}
