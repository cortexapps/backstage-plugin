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
import { Scorecard } from '../../../../api/types';
import { Grid } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { ScorecardRuleRow } from './ScorecardRuleRow';
import { useDetailCardStyles } from '../../../../styles/styles';
import { sortRules } from '../../../../utils/ScorecardRules';

interface ScorecardRulesCardProps {
  scorecard: Scorecard;
}

export const ScorecardRulesCard = ({ scorecard }: ScorecardRulesCardProps) => {
  const classes = useDetailCardStyles();

  const sortedRules = useMemo(() => sortRules(scorecard.rules), [scorecard]);

  return (
    <InfoCard title="Rules" className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <b>Rule</b>
        </Grid>
        <Grid item xs={4}>
          <b>Weight</b>
        </Grid>
        <Grid item xs={4}>
          <b>Filter</b>
        </Grid>
        {sortedRules.map(rule => (
          <ScorecardRuleRow key={`ScorecardRuleRow-${rule.id}`} rule={rule} />
        ))}
      </Grid>
    </InfoCard>
  );
};
