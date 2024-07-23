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

import { InitiativeActionItem } from '../../api/types';
import { Collapse, Grid, IconButton, makeStyles } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import React, { useState } from 'react';
import { MetadataItem } from '../MetadataItem';
import { BackstageTheme } from '@backstage/theme';
import { GroupComponentRuleInitiativeInfo } from './GroupComponentRuleInitiativeInfo';
import { useInitiativesCustomName } from '../../utils/hooks';

const useStyles = makeStyles<BackstageTheme>(_ => ({
  ruleRow: {
    marginBottom: '0.25rem',
  },
}));

interface GroupComponentRuleInitiativesRowProps {
  componentName: string;
  ruleExpression: string;
  initiativeActionItems: InitiativeActionItem[];
}

export const GroupComponentRuleInitiativesRow = ({
  componentName,
  ruleExpression,
  initiativeActionItems,
}: GroupComponentRuleInitiativesRowProps) => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const { plural: initiativesName } = useInitiativesCustomName();

  return (
    <React.Fragment>
      <Grid container className={classes.ruleRow} direction={'row'}>
        <Grid item lg={1}>
          <IconButton
            aria-label={`Show ${initiativesName} for ${componentName} with rule ${ruleExpression}`}
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRight />}
          </IconButton>
        </Grid>
        <MetadataItem gridSizes={{ lg: 11 }} label={'Rule'}>
          {ruleExpression}
        </MetadataItem>
      </Grid>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {initiativeActionItems.map(initiativeActionItem => (
          <GroupComponentRuleInitiativeInfo
            key={`GroupComponentRuleInitiativeInfo-${initiativeActionItem.componentRef}-${initiativeActionItem.rule.expression}-${initiativeActionItem.initiative.initiativeId}`}
            initiativeActionItem={initiativeActionItem}
          />
        ))}
      </Collapse>
    </React.Fragment>
  );
};
