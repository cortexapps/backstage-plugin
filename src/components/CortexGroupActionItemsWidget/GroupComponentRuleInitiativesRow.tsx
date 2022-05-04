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

import { InitiativeActionItem } from '../../api/types';
import { Collapse, Grid, IconButton, makeStyles } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import React, { useState } from 'react';
import { Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { initiativeRouteRef } from '../../routes';
import { MetadataItem } from '../MetadataItem';
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>(_ => ({
  todo: {
    marginLeft: '2rem',
    marginBottom: '0.25rem',
  },
  todo2: {
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
  const initiativeRef = useRouteRef(initiativeRouteRef);
  const classes = useStyles();
  return (
    <React.Fragment>
      <Grid container className={classes.todo2} direction={'row'}>
        <Grid item lg={1}>
          <IconButton
            aria-label={`Show initiatives for ${componentName} with rule ${ruleExpression}`}
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
        {initiativeActionItems.map((initiativeActionItem, index) => (
          <Link
            key={`${initiativeActionItem.componentRef}-${index}`}
            to={initiativeRef({
              id: `${initiativeActionItem.initiative.initiativeId}`,
            })}
          >
            <Grid container direction={'row'} className={classes.todo}>
              <MetadataItem gridSizes={{ lg: 6 }} label={'Initiative'}>
                {initiativeActionItem.initiative.name}
              </MetadataItem>
              <MetadataItem gridSizes={{ lg: 6 }} label={'Deadline'}>
                {initiativeActionItem.initiative.targetDate}
              </MetadataItem>
            </Grid>
          </Link>
        ))}
      </Collapse>
    </React.Fragment>
  );
};
