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

import { Box, Typography } from '@material-ui/core';
import React from 'react';
import {
  RuleDetail,
  getRuleTitle,
  isRuleFailing,
} from '../../../utils/ScorecardRules';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { useIconsStyles } from '../../../styles/styles';
import classNames from 'classnames';
import { isNil } from 'lodash';

interface ScorecardsServiceTooltipRuleRowProps {
  rule: RuleDetail;
}

export const ScorecardsServiceTooltipRuleRow: React.FC<ScorecardsServiceTooltipRuleRowProps> =
  ({ rule }) => {
    const isFailing = isRuleFailing(rule);
    const iconStyles = useIconsStyles();

    return (
      <Box display={'flex'} flexDirection={'row'} gridGap={4}>
        {!isNil(rule.score) && (
          <Box>
            {isFailing ? (
              <CancelIcon
                color="error"
                className={classNames(
                  iconStyles.statusIcon,
                  iconStyles.failingRule,
                )}
              />
            ) : (
              <CheckCircleIcon
                className={classNames(
                  iconStyles.statusIcon,
                  iconStyles.passingRule,
                )}
              />
            )}
          </Box>
        )}
        <Box>
          <Typography
            variant="subtitle2"
            className={classNames({
              [iconStyles.failingRule]: isFailing,
              [iconStyles.passingRule]: !isFailing,
            })}
          >
            {getRuleTitle(rule)}
          </Typography>
        </Box>
      </Box>
    );
  };
