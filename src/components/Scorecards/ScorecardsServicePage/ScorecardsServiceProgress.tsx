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
import React, { useMemo, useState } from 'react';
import { Button, Typography } from '@material-ui/core';
import { useCortexFrontendUrl, useDropdown, useHideCortexLinks } from '../../../utils/hooks';
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../../api';
import { useAsync } from 'react-use';
import { EmptyState, Progress, WarningPanel } from '@backstage/core-components';
import { CompoundEntityRef } from '@backstage/catalog-model';
import Box from '@material-ui/core/Box';
import { getLookbackRange, Lookback } from '../../../utils/lookback';
import { Rule, RuleOutcome } from '../../../api/types';
import { LookbackDropdown } from '../../ReportsPage/Common/LookbackDropdown';
import { cortexScorecardPageUrl } from '../../../utils/URLUtils';
import { isUndefined } from 'lodash';
import { ScorecardsServiceOverallScoreProgress } from './ScorecardsServiceOverallScoreProgress';
import { ScorecardsServiceRuleProgress } from './ScorecardsServiceRuleProgress';
import ScorecardsServiceRulesFilter from './ScorecardsServiceRulesFilter';
import {
  CortexInfoCard,
  useCortexInfoCardStyles,
} from '../../Common/CortexInfoCard';

interface ScorecardsServiceProgressProps {
  scorecardId: string;
  entityRef: CompoundEntityRef;
  rules: RuleOutcome[];
}

export const ScorecardsServiceProgress = ({
  scorecardId,
  entityRef,
  rules,
}: ScorecardsServiceProgressProps) => {
  const cortexApi = useApi(cortexApiRef);

  const [lookback, setLookback] = useDropdown(Lookback.MONTHS_1);
  const [selected, setSelected] = useState<Rule | undefined>(undefined);

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
  const rulesCardClasses = useCortexInfoCardStyles();

  const hideLink = useHideCortexLinks();

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
    const actionButton = hideLink ? undefined : (
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
    )

    return (
      <CortexInfoCard title="Progress">
        <EmptyState
          missing="data"
          title="Scorecard has not been evaluated yet."
          description="Wait until next Scorecard evaluation, or manually trigger from within Cortex."
          action={actionButton}
        />
      </CortexInfoCard>
    );
  }

  return (
    <CortexInfoCard
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body1"
            className={rulesCardClasses.cardHeaderTitle}
          >
            Progress
          </Typography>
          <Box display="flex" flexDirection="row" gridGap={8}>
            <LookbackDropdown lookback={lookback} setLookback={setLookback} />
            <ScorecardsServiceRulesFilter
              selected={selected}
              rules={rules}
              setSelected={setSelected}
            />
          </Box>
        </Box>
      }
    >
      {isUndefined(selected) ? (
        <ScorecardsServiceOverallScoreProgress
          results={historicalScores}
          scorecardId={scorecardId}
        />
      ) : (
        <ScorecardsServiceRuleProgress
          expression={selected.expression}
          results={historicalScores}
          scorecardId={scorecardId}
        />
      )}
    </CortexInfoCard>
  );
};
