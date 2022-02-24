/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { useDetailCardStyles } from '../../../../styles/styles';
import React, { useState } from 'react';
import { Collapse, Grid, IconButton, Typography } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { MetadataItem } from '../../../MetadataItem';
import { MarkdownContent } from '@backstage/core-components';

interface ScorecardRuleRowProps {
  rule: Rule | ScorecardLevelRule;
}

export const ScorecardRuleRow = ({ rule }: ScorecardRuleRowProps) => {
  const classes = useDetailCardStyles();

  const [open, setOpen] = useState(false);
  const showExpandButton = rule.description || rule.title;
  const hasTitle = !!rule.title;
  const hasWeight = 'weight' in rule;

  return (
    <React.Fragment>
      <Grid item lg={1}>
        {showExpandButton && (
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRight />}
          </IconButton>
        )}
      </Grid>
      <Grid item lg={9}>
        <Typography variant="subtitle1" className={classes.rule}>
          {ruleName(rule)}
        </Typography>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <>
            {rule.description && (
              <MetadataItem gridSizes={{ xs: 12 }} label="Description">
                <MarkdownContent content={rule.description} />
              </MetadataItem>
            )}
            {hasTitle && (
              <MetadataItem gridSizes={{ xs: 12 }} label="Expression">
                {rule.expression}
              </MetadataItem>
            )}
          </>
        </Collapse>
      </Grid>
      {hasWeight && (
        <Grid item lg={2}>
          <b>{rule.weight}</b>
        </Grid>
      )}
    </React.Fragment>
  );
};
