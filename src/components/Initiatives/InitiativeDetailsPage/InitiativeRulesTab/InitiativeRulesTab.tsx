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
import React from 'react';
import { InitiativeRule } from '../../../../api/types';
import { Box, alpha, makeStyles } from '@material-ui/core';
import { fallbackPalette } from '../../../../styles/styles';
import { CortexInfoCard } from '../../../Common/CortexInfoCard';
import { ScorecardRuleRow } from '../../../Scorecards/ScorecardDetailsPage/ScorecardRulesTab/ScorecardRuleRow';

interface InitiativeRulesTabProps {
  rules: InitiativeRule[];
}

export const useInitiativeLevelsTabStyles = makeStyles(() => ({
  levelBlock: {
    padding: 16,
    borderBottom: `1px solid ${alpha(fallbackPalette.common.white, 0.12)}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
}));

export const InitiativeRulesTab: React.FC<InitiativeRulesTabProps> = ({
  rules,
}) => {
  return (
    <CortexInfoCard>
      <Box display="flex" flexDirection="column">
        {rules.map((rule, idx) => (
          <ScorecardRuleRow key={`ScorecardRuleRowNew-${idx}`} rule={rule} />
        ))}
      </Box>
    </CortexInfoCard>
  );
};
