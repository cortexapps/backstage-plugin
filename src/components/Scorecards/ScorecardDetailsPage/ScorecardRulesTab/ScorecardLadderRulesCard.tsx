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
import { ScorecardLadder } from '../../../../api/types';
import { Box, Grid, alpha, makeStyles } from '@material-ui/core';
import { fallbackPalette } from '../../../../styles/styles';
import { CortexInfoCard } from '../../../Common/CortexInfoCard';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';
import { ScorecardRuleRow } from './ScorecardRuleRow';

interface ScorecardLadderRulesCardProps {
  ladder: ScorecardLadder;
}

export const useCortexInfoCardStyles = makeStyles(() => ({
  levelBlock: {
    padding: 16,
    borderBottom: `1px solid ${alpha(fallbackPalette.common.white, 0.12)}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
}));

export const ScorecardLadderRulesCard = ({
  ladder,
}: ScorecardLadderRulesCardProps) => {
  const classes = useCortexInfoCardStyles();

  const sortedLevels = useMemo(
    () => ladder.levels.sort((level1, level2) => level2.rank - level1.rank),
    [ladder],
  );

  return (
    <CortexInfoCard padding="dense">
      {sortedLevels.map(level => (
        <Box
          key={`ScorecardLadderRow-${level.id}`}
          className={classes.levelBlock}
        >
          <Grid container spacing={0}>
            <Grid item md={2} xs={3}>
              <ScorecardLadderLevelBadge
                showName
                name={level.name}
                color={level.color}
              />
            </Grid>
            <Grid item md={10} xs={9}>
              <Box display="flex" flexDirection="column">
                {level.rules.map(rule => (
                  <ScorecardRuleRow
                    key={`ScorecardRuleRowNew-${rule.id}`}
                    rule={rule}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      ))}
    </CortexInfoCard>
  );
};
