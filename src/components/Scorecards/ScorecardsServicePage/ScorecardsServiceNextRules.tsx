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
import React, { useMemo } from 'react';
import { ScorecardLadder, ScorecardServiceScore } from '../../../api/types';
import { Grid, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import LoyaltyIcon from '@material-ui/icons/Loyalty';
import { useDetailCardStyles } from '../../../styles/styles';
import { getSortedLadderLevels } from '../../../utils/ScorecardLadderUtils';

interface ScorecardsServiceNextRulesProps {
  ladder: ScorecardLadder;
  score: ScorecardServiceScore;
}

export const ScorecardsServiceNextRules = ({
  ladder,
  score,
}: ScorecardsServiceNextRulesProps) => {
  const classes = useDetailCardStyles();

  const currentLevel = score.ladderLevels?.[0]?.currentLevel ?? undefined;
  const levels = useMemo(() => getSortedLadderLevels(ladder), [ladder]);

  const nextLevel = useMemo(() => {
    if (currentLevel === undefined) {
      return levels[0];
    }

    const currLevelIndex = levels.findIndex(
      level => level.name === currentLevel.name,
    );
    const nextLevelIndex = currLevelIndex + 1;
    return levels.length === nextLevelIndex
      ? undefined
      : levels[nextLevelIndex];
  }, [levels, currentLevel]);

  const nextRules = useMemo(
    () =>
      nextLevel?.rules.filter(levelRule => {
        const ruleScore = score.rules.find(
          rule => rule.rule.expression === levelRule.expression,
        );
        const rulePasses = ruleScore?.score !== 0;
        return !rulePasses;
      }) ?? [],
    [nextLevel, score],
  );

  return (
    <InfoCard title="Ladder Progress" className={classes.root}>
      <Grid container direction="column">
        <Grid item>
          {currentLevel !== undefined ? (
            <Typography variant="subtitle1" className={classes.level}>
              <b>Current Level: </b> {currentLevel.name}
              <LoyaltyIcon style={{ color: `${currentLevel.color}` }} />
            </Typography>
          ) : (
            <Typography variant="subtitle1" className={classes.level}>
              This service hasn't achieved any levels yet.
            </Typography>
          )}
        </Grid>
        <Grid item>
          {nextLevel !== undefined ? (
            <>
              <Typography variant="subtitle1" className={classes.level}>
                <b>Next Level: </b> {nextLevel.name}
                <LoyaltyIcon style={{ color: `${nextLevel.color}` }} />
                <br />
                Complete these rules to get to the next level:
                <br />
                {nextRules.map(rule => (
                  <i>
                    &#8226; {rule.title ?? rule.expression}
                    <br />
                  </i>
                ))}
              </Typography>
            </>
          ) : (
            <Typography variant="subtitle1" className={classes.level}>
              Congratulations!! This service has achieved all levels!
            </Typography>
          )}
        </Grid>
      </Grid>
    </InfoCard>
  );
};
