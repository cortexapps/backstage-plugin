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
import { Rule, Scorecard, ScorecardRuleExemptionResult, ScorecardServiceScore, } from '../../../../api/types';
import { Box, makeStyles, Tooltip, Typography } from '@material-ui/core';
import { getRuleTitle } from '../../../../utils/ScorecardRules';
import { RuleExemptionStatus } from './RuleExemptionStatus';
import { CortexInfoCard } from '../../../Common/CortexInfoCard';
import { getExpirationText, getIsActive, } from './ScorecardRuleExemptionsTabUtils';
import ScorecardRuleExemptionTooltip from './ScorecardRuleExemptionTooltip';
import { ScorecardServiceRefLink } from '../../../ScorecardServiceRefLink';
import { isEmpty } from 'lodash';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { entityComponentRef } from '../../../../utils/ComponentUtils';

interface ScorecardRuleExemptionsTabProps {
  entitiesByTag: StringIndexable<HomepageEntity>;
  ruleExemptions: ScorecardRuleExemptionResult['scorecardRuleExemptions'];
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
}

const useRuleExemptionsTabStyles = makeStyles(() => ({
  text: {
    fontWeight: 600,
  },
}));

export const ScorecardRuleExemptionsTab = ({
  entitiesByTag,
  ruleExemptions = {},
  scorecard,
  scores,
}: ScorecardRuleExemptionsTabProps) => {
  const classes = useRuleExemptionsTabStyles();

  const rulesMap = useMemo(
    () =>
      scorecard.rules.reduce<Record<Rule['id'], string>>((acc, rule) => {
        acc[rule.id] = getRuleTitle(rule);
        return acc;
      }, {}),
    [scorecard.rules],
  );

  const scoresMap = useMemo(
    () =>
      scores.reduce<Record<ScorecardServiceScore['serviceId'], string>>(
        (acc, score) => {
          acc[score.serviceId] = score.componentRef;
          return acc;
        },
        {},
      ),
    [scores],
  );

  return (
    <CortexInfoCard>
      <Box display="flex" flexDirection="column">
        {isEmpty(ruleExemptions) ? (
          <Typography variant="body2">
            No rule exemptions found for this Scorecard.
          </Typography>
        ) : (
          Object.entries(ruleExemptions).map(([id, ruleExemptionById]) => {
            return (
              <React.Fragment key={`RuleExemption-${id}`}>
                {ruleExemptionById.filter(getIsActive).map(ruleExemption => {
                  let entityTag = scoresMap[ruleExemption.entityId] ?? '';

                  return (
                    <Tooltip
                      key={`RuleExemption-${id}-${ruleExemption.id}`}
                      title={
                        <ScorecardRuleExemptionTooltip
                          exemption={ruleExemption}
                        />
                      }
                      placement="bottom-start"
                    >
                      <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                        >
                          <RuleExemptionStatus
                            type={ruleExemption.status.type}
                          />

                          <Typography variant="body2">
                            <Typography
                              variant="body2"
                              component="span"
                              className={classes.text}
                            >
                              {rulesMap[ruleExemption.ruleId]}
                            </Typography>{' '}
                            for{' '}
                            {entityTag ? (
                              <ScorecardServiceRefLink
                                scorecardId={scorecard.id}
                                componentRef={entityComponentRef(
                                  entitiesByTag,
                                  entityTag,
                                )}
                              >
                                {ruleExemption.entityName}
                              </ScorecardServiceRefLink>
                            ) : (
                              ruleExemption.entityName
                            )}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {getExpirationText(ruleExemption)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            );
          })
        )}
      </Box>
    </CortexInfoCard>
  );
};
