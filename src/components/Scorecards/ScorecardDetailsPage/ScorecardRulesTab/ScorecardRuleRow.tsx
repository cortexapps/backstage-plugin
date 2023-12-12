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
import { Rule, ruleName, ScorecardLevelRule } from '../../../../api/types';
import { fallbackPalette } from '../../../../styles/styles';
import React, { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { MarkdownContent } from '@backstage/core-components';

interface ScorecardRuleRowProps {
  rule: ScorecardLevelRule | Rule;
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  expandIcon: {
    padding: 0,
  },
  ruleDescription: {
    margin: theme.spacing(1, 0),
    color: fallbackPalette.common.gray,
    '& p': {
      margin: 0,
    },
  },
  ruleQuery: {
    fontFamily: 'Monospace',
    fontSize: 12,
  },
}));

export const ScorecardRuleRow = ({ rule }: ScorecardRuleRowProps) => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const showExpandButton = rule.description || rule.filter || rule.expression;
  const hasWeight = 'weight' in rule;

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
        <Box>
          <Box display="flex" flexDirection="row">
            {hasWeight && (
              <Box ml={2} mr={1.5}>
                <Typography variant="subtitle2">{rule.weight} pt</Typography>
              </Box>
            )}
            <Typography variant="subtitle2">{ruleName(rule)}</Typography>
          </Box>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box ml={2}>
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
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};
