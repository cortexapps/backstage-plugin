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
import React, { useState } from 'react';
import { ruleName, ScorecardServiceScoresRule } from '../../../../api/types';
import {
  Collapse,
  Grid,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import CheckIcon from '@material-ui/icons/Check';
import { MarkdownContent } from '@backstage/core-components';
import { MetadataItem } from '../../../MetadataItem';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { isRuleFailing } from '../../../../utils/rules';

const useStyles = makeStyles({
  rule: {
    borderRadius: 8,
  },
});

interface RuleResultDetailsProps {
  rule: ScorecardServiceScoresRule;
  hideWeight?: boolean;
}

export const RuleResultDetails = ({
  rule,
  hideWeight,
}: RuleResultDetailsProps) => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const showExpandButton = rule.rule.description || rule.rule.title;
  const hasTitle = !!rule.rule.title;
  const isFailing = isRuleFailing(rule);

  return (
    <ListItem alignItems="flex-start">
      {showExpandButton && (
        <ListItemAvatar>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRight />}
          </IconButton>
        </ListItemAvatar>
      )}
      <ListItemAvatar>
        {!isFailing ? (
          <CheckIcon color="primary" />
        ) : (
          <ErrorIcon color="error" />
        )}
      </ListItemAvatar>
      <ListItem>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={classes.rule}
        >
          <Grid item xs={10}>
            <ListItemText
              primary={ruleName(rule.rule)}
              style={{ wordWrap: 'break-word' }}
            />
            <Collapse in={open} timeout="auto" unmountOnExit>
              <>
                {rule.rule.description && (
                  <MetadataItem gridSizes={{ xs: 12 }} label="Description">
                    <MarkdownContent content={rule.rule.description} />
                  </MetadataItem>
                )}
                {hasTitle && (
                  <MetadataItem gridSizes={{ xs: 12 }} label="Expression">
                    {rule.rule.expression}
                  </MetadataItem>
                )}
              </>
            </Collapse>
          </Grid>
          {rule.error && (
            <Grid item xs={10}>
              <Typography color="error" style={{ wordWrap: 'break-word' }}>
                {rule.error}
              </Typography>
            </Grid>
          )}
          {isFailing && rule.rule.failureMessage && (
            <Grid item xs={10}>
              <Typography color="error" style={{ wordWrap: 'break-word' }}>
                <MarkdownContent content={rule.rule.failureMessage} />
              </Typography>
            </Grid>
          )}
        </Grid>
      </ListItem>
      {hideWeight !== true && <ListItemText primary={`${rule.rule.weight}`} />}
    </ListItem>
  );
};
