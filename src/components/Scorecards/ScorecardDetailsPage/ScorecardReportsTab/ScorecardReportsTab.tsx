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
import React from 'react';
import { Scorecard } from '../../../../api/types';
import { ItemCardGrid } from '@backstage/core-components';
import { ReportsPageCard } from '../../../ReportsPage/ReportsPage';

interface ScorecardReportsTabProps {
  scorecard: Scorecard;
}

export const ScorecardReportsTab = ({
  scorecard,
}: ScorecardReportsTabProps) => {
  return (
    <ItemCardGrid>
      <ReportsPageCard
        name="Bird's Eye"
        description="Dive into your Scorecards to get insight into performance, broken down by teams, groups, and rules and visualized as a heatmap."
        url={`/heatmap?scorecardId=${scorecard.id}`}
      />
      <ReportsPageCard
        name="Progress"
        description="Progress report of how Scorecards have changed over time, broken down by teams or groups."
        url={`/progress?scorecardId=${scorecard.id}`}
      />
    </ItemCardGrid>
  );
};
