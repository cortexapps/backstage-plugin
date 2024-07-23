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
import { Grid, makeStyles } from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';
import { useRouteRef } from '@backstage/core-plugin-api';
import { initiativeRouteRef } from '../../routes';
import { MetadataItem } from '../MetadataItem';
import { Link } from '@backstage/core-components';
import React from 'react';
import { useInitiativesCustomName } from '../../utils/hooks';
import { capitalize } from 'lodash';

const useStyles = makeStyles<BackstageTheme>(_ => ({
  initiativeInfo: {
    marginLeft: '2rem',
    marginBottom: '0.25rem',
  },
}));

interface GroupComponentRuleInitiativeInfoProps {
  initiativeActionItem: InitiativeActionItem;
}

export const GroupComponentRuleInitiativeInfo = ({
  initiativeActionItem,
}: GroupComponentRuleInitiativeInfoProps) => {
  const initiativeRef = useRouteRef(initiativeRouteRef);
  const classes = useStyles();

  const { singular: initiativeNameLabel } = useInitiativesCustomName();

  return (
    <Link
      to={initiativeRef({
        id: `${initiativeActionItem.initiative.initiativeId}`,
      })}
    >
      <Grid container direction={'row'} className={classes.initiativeInfo}>
        <MetadataItem gridSizes={{ lg: 6 }} label={capitalize(initiativeNameLabel)}>
          {initiativeActionItem.initiative.name}
        </MetadataItem>
        <MetadataItem gridSizes={{ lg: 6 }} label={'Deadline'}>
          {initiativeActionItem.initiative.targetDate}
        </MetadataItem>
      </Grid>
    </Link>
  );
};
