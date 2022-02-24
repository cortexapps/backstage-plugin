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
import React, { useMemo, useState } from 'react';
import {
  ScorecardLevel,
  ScorecardLadder,
  ruleName,
} from '../../../../api/types';
import { Grid, IconButton, Typography, Collapse } from '@material-ui/core';
import { InfoCard, MarkdownContent } from '@backstage/core-components';
import { useDetailCardStyles } from '../../../../styles/styles';
import { getSortedLadderLevels } from '../../../../utils/ScorecardLadderUtils';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { MetadataItem } from '../../../MetadataItem';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

interface ScorecardLaddersCardProps {
  ladder: ScorecardLadder;
}

const ScorecardLevelsRow = ({ level }: { level: ScorecardLevel }) => {
  const classes = useDetailCardStyles();

  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <Grid item lg={1}>
        <IconButton size="small" onClick={() => setOpen(!open)}>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRight />}
        </IconButton>
      </Grid>
      <Grid item lg={9}>
        <Typography variant="subtitle1" className={classes.level}>
          {level.name}
        </Typography>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <>
            {level.description && (
              <MetadataItem gridSizes={{ xs: 12 }} label="Description">
                <MarkdownContent content={level.description} />
              </MetadataItem>
            )}
            <MetadataItem gridSizes={{ xs: 12 }} label="Rules">
              {level.rules.map(rule => (
                <div key={`NextRule-${rule.id}`}>&#8226; {ruleName(rule)}</div>
              ))}
            </MetadataItem>
          </>
        </Collapse>
      </Grid>
      <Grid item lg={2}>
        <ScorecardLadderLevelBadge name={level.name} color={level.color} />
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
