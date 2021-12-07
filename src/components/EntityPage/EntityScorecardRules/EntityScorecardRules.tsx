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
import React, { useMemo, useState } from 'react';
import { HeaderTabs, InfoCard, Progress } from '@backstage/core-components';
import { ServiceScorecardScore } from '../../../api/types';
import { ScorecardResultDetails } from '../../Scorecards/ScorecardDetailsPage/ScorecardsTableCard/ScorecardResultDetails';

interface EntityScorecardRulesProps {
  score?: ServiceScorecardScore;
}

export const EntityScorecardRules = ({ score }: EntityScorecardRulesProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedRules = useMemo(() => {
    return score?.evaluation?.rules?.filter(rule =>
      selectedIndex === 0 ? rule.score === 0 : rule.score > 0,
    );
  }, [selectedIndex, score]);

  if (score === undefined || selectedRules === undefined) {
    return <Progress />;
  }

  const passing = score.evaluation.rules.filter(rule => rule.score > 0);
  const failing = score.evaluation.rules.filter(rule => rule.score === 0);

  return (
    <InfoCard title="All Rules">
      <HeaderTabs
        tabs={[
          { id: 'failing', label: `Failing (${failing.length})` },
          { id: 'passing', label: `Passing (${passing.length})` },
        ]}
        onChange={setSelectedIndex}
      />
      <ScorecardResultDetails rules={selectedRules} />
    </InfoCard>
  );
};
