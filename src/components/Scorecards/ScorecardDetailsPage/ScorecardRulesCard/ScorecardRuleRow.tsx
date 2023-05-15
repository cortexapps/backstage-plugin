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
import {
  InitiativeRule,
  Rule,
  ruleName,
  ScorecardLevelRule,
} from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import React, { useState } from 'react';
import {
  Chip,
  Collapse,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { MetadataItem } from '../../../MetadataItem';
import { MarkdownContent } from '@backstage/core-components';

interface ScorecardRuleRowProps {
  rule: Rule | ScorecardLevelRule | InitiativeRule;
}

export const ScorecardRuleRow = ({ rule }: ScorecardRuleRowProps) => {
  const classes = useDetailCardStyles();

  const [open, setOpen] = useState(false);
  const showExpandButton = rule.description || rule.title;
  const hasTitle = !!rule.title;
  const hasWeight = 'weight' in rule;

  return (
    <React.Fragment>
      {showExpandButton && (
        <Grid item xs={1}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRight />}
          </IconButton>
        </Grid>
      )}
      <Grid item xs={4}>
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
      <Grid item xs={4}>
        {hasWeight && (
          <Typography className={classes.rule}>{rule.weight}</Typography>
        )}
      </Grid>
      <Grid item xs={4}>
        {rule.filter?.query && (
          <Typography className={classes.rule}>{rule.filter.query}</Typography>
        )}
        {rule.filter?.includedTags && rule.filter?.includedTags.length !== 0 && (
          <MetadataItem gridSizes={{ xs: 12 }} label="Applies to">
            {rule.filter?.includedTags.map(s => (
              <Chip
                key={`Scorecard-Filter-IncludedServiceGroup-${s}`}
                size="small"
                label={s}
              />
            ))}
          </MetadataItem>
        )}
        {rule.filter?.excludedTags && rule.filter?.excludedTags.length !== 0 && (
          <MetadataItem gridSizes={{ xs: 12 }} label="Does not apply to">
            {rule.filter.excludedTags.map(s => (
              <Chip
                key={`Scorecard-Filter-ExcludedServiceGroup-${s}`}
                size="small"
                label={s}
              />
            ))}
          </MetadataItem>
        )}
      </Grid>
    </React.Fragment>
  );
};
