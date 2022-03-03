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
import { Initiative } from '../../../../api/types';
import { useDetailCardStyles } from '../../../../styles/styles';
import { InfoCard, MarkdownContent } from '@backstage/core-components';
import { Chip, Grid } from '@material-ui/core';
import { MetadataItem } from '../../../MetadataItem';
import { useRouteRef } from '@backstage/core-plugin-api';
import { scorecardRouteRef } from '../../../../routes';
import moment from 'moment/moment';
import { ScorecardLadderLevelBadge } from '../../../Common/ScorecardLadderLevelBadge';
import { ScorecardRuleRow } from '../../../Scorecards/ScorecardDetailsPage/ScorecardRulesCard/ScorecardRuleRow';

interface InitiativeMetadataCardProps {
  initiative: Initiative;
}

export const InitiativeMetadataCard = ({
  initiative,
}: InitiativeMetadataCardProps) => {
  const classes = useDetailCardStyles();
  const scorecardRef = useRouteRef(scorecardRouteRef);

  console.log(initiative);
  const filteredByServiceGroups = initiative.tags.length !== 0;
  const filteredByServices = initiative.componentRefs.length !== 0;
  const filteredByBoth = filteredByServiceGroups && filteredByServices;

  const filtersLabel = `Filtered ${
    filteredByBoth
      ? 'by Services & Service Groups'
      : filteredByServices
      ? `to ${initiative.componentRefs.length} Services`
      : 'by Service Groups'
  }`;

  return (
    <InfoCard title="Details" className={classes.root}>
      <Grid container>
        {initiative.description && (
          <MetadataItem gridSizes={{ xs: 12 }} label="Description">
            <MarkdownContent content={initiative.description} />
          </MetadataItem>
        )}
        <MetadataItem gridSizes={{ xs: 12 }} label="Deadline">
          {moment.utc(initiative.targetDate).local().fromNow()}
        </MetadataItem>
        <MetadataItem gridSizes={{ xs: 12 }} label="Scorecard">
          <Chip
            size="small"
            label={initiative.scorecard.name}
            clickable
            component="a"
            href={scorecardRef({ id: `${initiative.scorecard.id}` })}
          />
        </MetadataItem>
        <MetadataItem gridSizes={{ xs: 12 }} label="Owner">
          {initiative.creator.name}
        </MetadataItem>
        {initiative.tags.length > 0 && (
          <MetadataItem gridSizes={{ xs: 12 }} label="Applies To">
            {initiative.tags.map(s => (
              <Chip key={s.id} size="small" label={s.tag} />
            ))}
          </MetadataItem>
        )}
        {initiative.emphasizedLevels.length !== 0 && (
          <MetadataItem gridSizes={{ xs: 12 }} label="Prioritized Ladder Level">
            {initiative.emphasizedLevels.map(level => (
              <div key={`Initiative-EmphasizeLevel-${level.levelId}`}>
                {level.levelName}
                <ScorecardLadderLevelBadge
                  name={level.levelName}
                  color={level.levelColor}
                />
              </div>
            ))}
          </MetadataItem>
        )}
        {initiative.emphasizedRules.length !== 0 && (
          <MetadataItem gridSizes={{ xs: 12 }} label="Prioritized Ladder Level">
            <Grid container>
              {initiative.emphasizedRules.map(rule => (
                <ScorecardRuleRow
                  key={`Initiative-EmphasizeRule-${rule.ruleId}`}
                  rule={rule}
                />
              ))}
            </Grid>
          </MetadataItem>
        )}
        <MetadataItem gridSizes={{ xs: 12 }} label={filtersLabel}>
          {(filteredByServiceGroups || !filteredByServices) && (
            <MetadataItem
              gridSizes={{ xs: 12 }}
              label={filteredByBoth ? 'Service Groups' : 'Applies to'}
            >
              {initiative.tags.map(s => (
                <Chip key={s.id} size="small" label={s.tag} />
              ))}
              {initiative.tags.length === 0 && (
                <Chip size="small" label="All" />
              )}
            </MetadataItem>
          )}
        </MetadataItem>
      </Grid>
    </InfoCard>
  );
};
