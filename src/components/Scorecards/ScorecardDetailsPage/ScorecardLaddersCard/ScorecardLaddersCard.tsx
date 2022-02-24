/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { ScorecardLevel, ScorecardLadder } from '../../../../api/types';
import { Grid, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import LoyaltyIcon from '@material-ui/icons/Loyalty';
import { useDetailCardStyles } from '../../../../styles/styles';
import { getSortedLadderLevels } from '../../../../utils/ScorecardLadderUtils';

interface ScorecardLaddersCardProps {
  ladder: ScorecardLadder;
}

const ScorecardLevelsRow = ({ level }: { level: ScorecardLevel }) => {
  const classes = useDetailCardStyles();

  return (
    <React.Fragment>
      <Grid item lg={10}>
        <Typography variant="subtitle1" className={classes.level}>
          {level.name}
        </Typography>
        {level.description && (
          <i>
            {level.description}
            <br />
          </i>
        )}
        {level.rules.map(rule => (
          <i key={`NextRule-${rule.id}`}>
            &#8226; {rule.title ?? rule.expression}
            <br />
          </i>
        ))}
      </Grid>
      <Grid item lg={2}>
        <LoyaltyIcon style={{ color: `${level.color}` }} />
      </Grid>
    </React.Fragment>
  );
};

export const ScorecardLaddersCard = ({ ladder }: ScorecardLaddersCardProps) => {
  const classes = useDetailCardStyles();
  const levels = useMemo(() => getSortedLadderLevels(ladder), [ladder]);

  return (
    <InfoCard title="Ladders" className={classes.root}>
      <Grid container>
        {levels.map(level => (
          <ScorecardLevelsRow key={level.id} level={level} />
        ))}
      </Grid>
    </InfoCard>
  );
};
