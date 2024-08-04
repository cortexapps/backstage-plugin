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
import { InitiativeLadderLevel, InitiativeRule } from '../../../../api/types';
import { Box, Grid, alpha, makeStyles } from '@material-ui/core';
import { fallbackPalette } from '../../../../styles/styles';
import { CortexInfoCard } from '../../../Common/CortexInfoCard';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';
import { ScorecardRuleRow } from '../../../Scorecards/ScorecardDetailsPage/ScorecardRulesTab/ScorecardRuleRow';

interface InitiativeLevelsTabProps {
  levels: InitiativeLadderLevel[];
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

export const InitiativeLevelsTab: React.FC<InitiativeLevelsTabProps> = ({
  levels,
  rules,
}) => {
  const classes = useInitiativeLevelsTabStyles();

  // Support for single level only
  const level = levels[0];

  return (
    <CortexInfoCard padding="dense">
      <Box className={classes.levelBlock}>
        <Grid container spacing={0}>
          <Grid item md={2} xs={3}>
            <ScorecardLadderLevelBadge
              showName
              name={level.levelName}
              color={level.levelColor}
            />
          </Grid>
          <Grid item md={10} xs={9}>
            <Box display="flex" flexDirection="column">
              {rules.map((rule, idx) => (
                <ScorecardRuleRow
                  key={`ScorecardRuleRowNew-${idx}`}
                  rule={rule}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </CortexInfoCard>
  );
};
