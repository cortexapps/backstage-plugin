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
import React, { useState } from 'react';
import { Box, Collapse, IconButton, Typography } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { MarkdownContent } from '@backstage/core-components';

import classNames from 'classnames';
import { useIconsStyles } from '../../../styles/styles';
import { RuleDetail, isRuleFailing } from '../../../utils/ScorecardRules';
import { ruleName } from '../../../api/types';
import { isNil } from 'lodash';

export interface ScorecardServiceRuleRowProps {
  classes: ClassNameMap<string>;
  rule: RuleDetail;
  isFailing?: boolean;
  hideWeight?: boolean;
}

export const ScorecardServiceRuleRow = ({
  classes,
  hideWeight,
  rule,
}: ScorecardServiceRuleRowProps) => {
  const [open, setOpen] = useState(false);
  const iconsClasses = useIconsStyles();
  const showExpandButton = rule.description || rule.filter || rule.expression;
  const isFailing = isRuleFailing(rule);

  return (
    <Box className={classes.root}>
      <Box display="flex" flexDirection="row">
        <Box>
          {showExpandButton && (
            <IconButton
              size="small"
              onClick={() => setOpen(!open)}
              className={classes.expandIcon}
            >
              {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
          )}
        </Box>

        {!isNil(rule.score) && (
          <>
            {isFailing ? (
              <CancelIcon
                color="error"
                className={classNames(
                  iconsClasses.statusIcon,
                  iconsClasses.failingRule,
                )}
              />
            ) : (
              <CheckCircleIcon
                className={classNames(
                  iconsClasses.statusIcon,
                  iconsClasses.passingRule,
                )}
              />
            )}
          </>
        )}
        <Box>
          <Typography
            variant="subtitle2"
            className={classNames({ [iconsClasses.failingRule]: isFailing })}
          >
            {ruleName(rule)}
          </Typography>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <>
              {rule.error && (
                <Typography color="error" className={classes.ruleQuery}>
                  {rule.error}
                </Typography>
              )}
              {isFailing && rule.failureMessage && (
                <MarkdownContent
                  className={classes.ruleDescription}
                  content={rule.failureMessage}
                />
              )}
              {rule.description && (
                <MarkdownContent
                  className={classes.ruleDescription}
                  content={rule.description}
                />
              )}
              {rule.expression && (
                <Typography variant="caption" className={classes.ruleQuery}>
                  {rule.expression}
                </Typography>
              )}
              {rule.filter?.query && (
                <Typography variant="overline">{rule.filter.query}</Typography>
              )}
            </>
          </Collapse>
        </Box>
      </Box>
      {!hideWeight && (
        <Box>
          <Typography variant="caption">{rule.weight}</Typography>
        </Box>
      )}
    </Box>
  );
};
