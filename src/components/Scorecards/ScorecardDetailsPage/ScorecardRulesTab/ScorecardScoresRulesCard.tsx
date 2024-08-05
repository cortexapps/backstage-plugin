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
import React, { useMemo } from 'react';
import { Scorecard } from '../../../../api/types';
import { Box } from '@material-ui/core';
import { sortRules } from '../../../../utils/ScorecardRules';
import { CortexInfoCard } from '../../../Common/CortexInfoCard';
import { ScorecardRuleRow } from './ScorecardRuleRow';

interface SScorecardScoresRulesCardProps {
  scorecard: Scorecard;
}

export const ScorecardScoresRulesCard = ({
  scorecard,
}: SScorecardScoresRulesCardProps) => {
  const sortedRules = useMemo(() => sortRules(scorecard.rules), [scorecard]);

  return (
    <CortexInfoCard>
      <Box display="flex" flexDirection="column">
        {sortedRules.map(rule => (
          <ScorecardRuleRow
            key={`ScorecardRuleRowNew-${rule.id}`}
            rule={rule}
          />
        ))}
      </Box>
    </CortexInfoCard>
  );
};
