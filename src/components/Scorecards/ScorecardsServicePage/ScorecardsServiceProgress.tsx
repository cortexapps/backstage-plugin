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
import { Button, Typography } from '@material-ui/core';
import { useCortexFrontendUrl, useDropdown } from '../../../utils/hooks';
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../../api';
import { useAsync } from 'react-use';
import { EmptyState, Progress, WarningPanel } from '@backstage/core-components';
import { CompoundEntityRef } from '@backstage/catalog-model';
import { Timeseries } from '../../Timeseries';
import moment from 'moment';
import Box from '@material-ui/core/Box';
import { Point } from '@nivo/line';
import { getLookbackRange, Lookback } from '../../../utils/lookback';
import { RuleOutcome, RuleOutcomeType, RuleResult } from '../../../api/types';
import { LookbackDropdown } from '../../ReportsPage/Common/LookbackDropdown';
import { cortexScorecardPageUrl } from '../../../utils/URLUtils';

interface ScorecardsServiceProgressProps {
  scorecardId: string;
  entityRef: CompoundEntityRef;
  setSelectedRules: (rules: RuleOutcome[]) => void;
}

/**
 * Convert cached results to standardized RuleName version.
 * TODO: Use current scorecards' rules to use titles where possible
 * @param cachedRuleResults Cached historical results per rule.
 */
export function toScorecardServiceScoresRule(
  cachedRuleResults: RuleResult[],
): RuleOutcome[] {
  return cachedRuleResults.map(ruleResult => {
    return {
      ...ruleResult,
      rule: {
        id: ruleResult.id,
        expression: ruleResult.expression,
        weight: ruleResult.weight,
      },
      type: RuleOutcomeType.APPLICABLE,
    };
  });
}

export const ScorecardsServiceProgress = ({
  scorecardId,
  entityRef,
  setSelectedRules,
}: ScorecardsServiceProgressProps) => {
  const cortexApi = useApi(cortexApiRef);

  const [lookback, setLookback] = useDropdown(Lookback.MONTHS_1);

  const {
    value: historicalScores,
    loading,
    error,
  } = useAsync(async () => {
    const [startDate, endDate] = getLookbackRange(lookback!!);
    return cortexApi.getHistoricalScores(
      scorecardId,
      entityRef,
      startDate,
      endDate,
    );
  }, [lookback]);

  const data = useMemo(() => {
    return historicalScores?.map(scorecardResult => {
      return {
        x: new Date(scorecardResult.dateCreated),
        y: (scorecardResult.possibleScore === 0
          ? 0
          : (scorecardResult.totalScore / scorecardResult.possibleScore) * 100
        ).toFixed(2),
      };
    });
  }, [historicalScores]);

  const cortexBaseUrl = useCortexFrontendUrl();

  if (loading) {
    return <Progress />;
  }

  if (error || data === undefined || historicalScores === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecard scores.">
        {error?.message ?? ''}
      </WarningPanel>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        missing="data"
        title="Scorecard has not been evaluated yet."
        description="Wait until next Scorecard evaluation, or manually trigger from within Cortex."
        action={
          <Button
            variant="contained"
            color="primary"
            href={cortexScorecardPageUrl({
              scorecardId: scorecardId,
              cortexUrl: cortexBaseUrl,
            })}
          >
            Go to Cortex
          </Button>
        }
      />
    );
  }

  return (
    <>
      <LookbackDropdown lookback={lookback} setLookback={setLookback} />
      {data.length > 0 && (
        <Timeseries
          data={[{ id: `${scorecardId}-${entityRef}`, data: data }]}
          onClick={(point: Point) => {
            setSelectedRules(
              toScorecardServiceScoresRule(
                historicalScores[point.index].ruleResults,
              ),
            );
          }}
          tooltip={point => {
            return (
              <Box
                bgcolor="background.paper"
                border={1}
                borderRadius="borderRadius"
                borderColor="divider"
              >
                <Typography>
                  {moment
                    .utc(historicalScores[point.point.index].dateCreated)
                    .fromNow()}
                </Typography>
              </Box>
            );
          }}
        />
      )}
    </>
  );
};
