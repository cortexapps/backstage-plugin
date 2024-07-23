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
import React, { useEffect, useMemo, useState } from 'react';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { Content, Progress, WarningPanel } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { useAsync } from 'react-use';
import { cortexApiRef } from '../../../api';
import { scorecardServiceDetailsRouteRef } from '../../../routes';
import Box from '@material-ui/core/Box';
import { ScorecardsServiceProgress } from './ScorecardsServiceProgress';
import { entityEquals } from '../../../utils/types';
import { ScorecardsServiceNextRules } from './ScorecardsServiceNextRules';
import { RuleOutcome } from '../../../api/types';
import { useEntitiesByTag } from '../../../utils/hooks';
import { ScorecardsServiceRulesDetails } from './ScorecardsServiceRulesDetails';
import { ScorecardsServiceStatistics } from './ScorecardsServiceStatistics';
import { ScorecardServiceHeader } from './ScorecardsServiceHeader';

export const ScorecardsServicePage = () => {
  const cortexApi = useApi(cortexApiRef);

  const { scorecardId, kind, namespace, name } = useRouteRefParams(
    scorecardServiceDetailsRouteRef,
  );

  const { entitiesByTag, loading: loadingEntities } = useEntitiesByTag();

  const entityRef = { kind, namespace, name };

  const [selectedRules, setSelectedRules] = useState<RuleOutcome[]>([]);

  const { value, loading, error } = useAsync(async () => {
    const allScores = await cortexApi.getScorecardScores(+scorecardId);
    const ladders = await cortexApi.getScorecardLadders(+scorecardId);
    const scorecard = await cortexApi.getScorecard(+scorecardId);

    const score = allScores.find(entityScore => {
      if (!entitiesByTag[entityScore.componentRef]) {
        return false;
      }

      return entityEquals(
        entitiesByTag[entityScore.componentRef].definition,
        entityRef,
      );
    });

    return { allScores, score, scorecard, ladders };
  }, [entitiesByTag]);

  const { allScores, score, ladders, scorecard } = value ?? {
    allScores: [],
    score: undefined,
    scorecard: undefined,
    ladders: [],
  };

  useEffect(() => {
    setSelectedRules(score?.rules ?? []);
  }, [score]);

  const scores = useMemo(
    () => allScores?.map(score => score.scorePercentage).sort(),
    [allScores],
  );

  if (loading || loadingEntities) {
    return <Progress />;
  }

  if (error || score === undefined || scorecard === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecard scores.">
        {error?.message ?? ''}
      </WarningPanel>
    );
  }

  // currently we only support 1 ladder per Scorecard
  const ladder = ladders?.[0];

  return (
    <Content>
      <ScorecardServiceHeader
        entitiesByTag={entitiesByTag}
        score={score}
        scorecard={scorecard}
      />

      <Grid container direction="row" spacing={1}>
        <Grid item lg={4}>
          <ScorecardsServiceRulesDetails ruleOutcomes={selectedRules} />
        </Grid>
        <Grid item lg={8} xs={12}>
          <Box marginBottom={1}>
            <ScorecardsServiceStatistics
              scores={scores}
              score={score}
              rules={selectedRules}
            />
          </Box>

          {ladder && (
            <ScorecardsServiceNextRules
              scorecardId={+scorecardId}
              entityRef={entityRef}
            />
          )}
          <ScorecardsServiceProgress
            scorecardId={scorecardId}
            entityRef={entityRef}
            rules={selectedRules}
          />
        </Grid>
      </Grid>
    </Content>
  );
};
