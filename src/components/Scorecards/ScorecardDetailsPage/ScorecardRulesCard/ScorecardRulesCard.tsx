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
import React from 'react';
import { Rule, Scorecard } from '../../../../api/types';
import { Grid, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { useDetailCardStyles } from '../../../../styles/styles';

interface ScorecardRulesCardProps {
  scorecard: Scorecard;
}

const ScorecardRulesRow = ({ rule }: { rule: Rule }) => {
  const classes = useDetailCardStyles();

  return (
    <React.Fragment>
      <Grid item lg={10}>
        <Typography variant="subtitle1" className={classes.rule}>
          {rule.title ?? rule.expression}
        </Typography>
        {rule.description && <i>{rule.description}</i>}
      </Grid>
      <Grid item lg={2}>
        <b>{rule.weight}</b>
      </Grid>
    </React.Fragment>
  );
};

export const ScorecardRulesCard = ({ scorecard }: ScorecardRulesCardProps) => {
  const classes = useDetailCardStyles();

  return (
    <InfoCard title="Rules" className={classes.root}>
      <Grid container>
        {scorecard.rules.map(rule => (
          <ScorecardRulesRow key={rule.id} rule={rule} />
        ))}
      </Grid>
    </InfoCard>
  );
};
