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
import React, { useMemo } from 'react';
import { ScorecardLevel, ScorecardLadder } from '../../../../api/types';
import { Divider, Grid, Typography } from '@material-ui/core';
import { InfoCard, MarkdownContent } from '@backstage/core-components';
import { useDetailCardStyles } from '../../../../styles/styles';
import { getSortedLadderLevels } from '../../../../utils/ScorecardLadderUtils';
import { MetadataItem } from '../../../MetadataItem';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';
import { ScorecardRuleRow } from '../ScorecardRulesCard/ScorecardRuleRow';

interface ScorecardLaddersCardProps {
  ladder: ScorecardLadder;
}

const ScorecardLevelsRow = ({ level }: { level: ScorecardLevel }) => {
  const classes = useDetailCardStyles();

  return (
    <React.Fragment>
      <Grid container item direction="row" lg={3} spacing={4}>
        <Grid item lg={1}>
          <ScorecardLadderLevelBadge name={level.name} color={level.color} />
        </Grid>
        <Grid item lg={2}>
          <Typography variant="subtitle1" className={classes.level}>
            {level.name}
          </Typography>
        </Grid>
      </Grid>
      {/* <Grid item lg={1}>
        <IconButton size="small" onClick={() => setOpen(!open)}>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRight />}
        </IconButton>
      </Grid> */}
      <Grid item lg={9}>
        <>
          {level.description && (
            <MetadataItem gridSizes={{ xs: 12 }} label="Description">
              <MarkdownContent content={level.description} />
            </MetadataItem>
          )}
          <MetadataItem gridSizes={{ xs: 12 }}>
            {level.rules.map(rule => (
              <Grid container direction={'row'}>
                <ScorecardRuleRow key={`NextRule-${rule.id}`} rule={rule} />
              </Grid>
            ))}
          </MetadataItem>
        </>
      </Grid>
    </React.Fragment>
  );
};

export const ScorecardLaddersCard = ({ ladder }: ScorecardLaddersCardProps) => {
  const classes = useDetailCardStyles();
  const levels = useMemo(() => getSortedLadderLevels(ladder), [ladder]);

  return (
    <InfoCard title="Ladders" className={classes.root}>
      <Grid container direction={'column'}>
        {levels.map((level, index, levels) => (
          <>
            <Grid container direction={'row'}>
              <ScorecardLevelsRow
                key={`ScorecardLevelsRow-${level.id}`}
                level={level}
              />
            </Grid>
            {index !== levels.length - 1 && (
              <Divider style={{ margin: '12px' }} />
            )}
          </>
        ))}
      </Grid>
    </InfoCard>
  );
};
