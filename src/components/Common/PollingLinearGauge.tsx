/*
 * Copyright 2024 Cortex Applications, Inc.
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

import { LinearGauge } from '@backstage/core-components';
import React, { useState } from 'react';
import { ExponentialBackoff } from '../../utils/MathUtils';
import { useInterval } from '../../utils/HookUtils';

interface PollingLinearGaugeProps {
  backoffMultiplier?: number;
  done?: boolean;
  initialDelay?: number;
  maxDelay?: number;
  poll: () => Promise<void>;
  value: number;
}

const PollingLinearGauge: React.FC<PollingLinearGaugeProps> = ({
  backoffMultiplier = 1.2,
  done = false,
  initialDelay = 1000,
  maxDelay = 1000,
  poll,
  value,
}) => {
  const [exponentialBackoff, setExponentialBackoff] = useState(
    () =>
      new ExponentialBackoff({
        initialDelay: initialDelay,
        multiplier: backoffMultiplier,
        maxDelay: maxDelay,
      }),
  );

  useInterval(
    async () => {
      await poll();
      setExponentialBackoff(backoff => backoff.advance());
    },
    done ? null : exponentialBackoff.delay(),
  );

  return <LinearGauge value={value} />;
};

export default PollingLinearGauge;
