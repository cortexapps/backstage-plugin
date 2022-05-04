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
import React from 'react';
import { DefaultEntityRefLink } from '../DefaultEntityLink';
import { MetadataItem } from '../MetadataItem';
import { CompoundEntityRef } from '@backstage/catalog-model';
import { InitiativeActionItem } from '../../api/types';
import { TeamServiceRuleInitiativesRow } from './TeamServiceRuleInitiativesRow';
import { makeStyles } from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>(_ => ({
  todo: {
    marginBottom: '0.35rem',
  },
}));

interface TeamServiceActionItemsRowProps {
  serviceComponentRef: CompoundEntityRef;
  ruleToInitiativeActionItem: Record<string, InitiativeActionItem[]>;
}

export const TeamServiceActionItemsRow = ({
  serviceComponentRef,
  ruleToInitiativeActionItem,
}: TeamServiceActionItemsRowProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <div className={classes.todo}>
        <DefaultEntityRefLink entityRef={serviceComponentRef}>
          <MetadataItem gridSizes={{ lg: 12 }}>
            {serviceComponentRef.name}
          </MetadataItem>
        </DefaultEntityRefLink>
      </div>
      {Object.keys(ruleToInitiativeActionItem).map(rule => (
        <TeamServiceRuleInitiativesRow
          key={rule}
          ruleExpression={rule}
          initiativeActionItems={ruleToInitiativeActionItem[rule]}
        />
      ))}
    </React.Fragment>
  );
};
