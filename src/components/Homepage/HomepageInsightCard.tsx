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
import React from 'react';
import {
  ActionItemUserInsight,
  FailingRuleUserInsight,
  HomepageEntity,
  UserInsight,
  UserInsightType,
} from '../../api/userInsightTypes';
import { Link } from '@backstage/core-components';
import { maybePluralize } from '../../utils/strings';
import moment from 'moment';
import { isNil } from 'lodash';
import { useRouteRef } from '@backstage/core-plugin-api';
import { initiativeRouteRef } from '../../routes';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { ScorecardRefLink } from '../ScorecardRefLink';
import { useHomepageInsightsLinkStyles } from '../../styles/styles';
import InsightCard from './InsightCard';
import { Initiative, Scorecard } from '../../api/types';

interface HomepageInsightCardProps {
  insight: UserInsight;
  scorecards: Scorecard[];
  initiatives: Initiative[];
  entities: HomepageEntity[];
}

export const HomepageInsightCard = ({
  insight,
  scorecards,
  initiatives,
  entities,
}: HomepageInsightCardProps) => {
  const initiativeRef = useRouteRef(initiativeRouteRef);
  const linkClasses = useHomepageInsightsLinkStyles();

  switch (insight.type) {
    case UserInsightType.ACTION_ITEM: {
      const actionItemInsight = insight as ActionItemUserInsight;
      const entity = entities?.find(
        currEntity => currEntity.id === actionItemInsight.entityId,
      );
      const initiative = initiatives?.find(
        currInitiative => currInitiative.id === actionItemInsight.initiativeId,
      );

      const entityRef = {
        kind: 'Component',
        namespace: 'default',
        name: entity?.name || '',
      };

      return (
        <InsightCard>
          You have{' '}
          {maybePluralize(actionItemInsight.ruleIds.length, 'action item')} due
          by {moment(actionItemInsight.targetDate).local().format('MMM Do')}
          {!isNil(entity) && (
            <>
              {' '}
              for{' '}
              <EntityRefLink entityRef={entityRef} className={linkClasses.root}>
                {entity.name}
              </EntityRefLink>
            </>
          )}{' '}
          {!isNil(initiative) && (
            <>
              {' '}
              for the{' '}
              <Link
                to={initiativeRef({
                  id: initiative.id.toString(),
                })}
                className={linkClasses.root}
              >
                {initiative.name}
              </Link>{' '}
              Initiative
            </>
          )}
        </InsightCard>
      );
    }
    case UserInsightType.FAILING_RULE: {
      const failingRuleInsight = insight as FailingRuleUserInsight;
      const entity = entities?.find(
        currEntity => currEntity.id === failingRuleInsight.entityId,
      );
      const scorecard = scorecards.find(
        scorecard => scorecard.id === failingRuleInsight.scorecardId,
      );

      const contentSuffix = failingRuleInsight.nextLadderLevel
        ? ` to reach ${failingRuleInsight.nextLadderLevel}`
        : '';

      const entityRef = {
        kind: 'Component',
        namespace: 'default',
        name: entity?.name || '',
      };

      return (
        <InsightCard>
          {maybePluralize(failingRuleInsight.ruleIds.length, 'rule')} left
          {!isNil(entity) && (
            <>
              {' '}
              for{' '}
              <EntityRefLink entityRef={entityRef} className={linkClasses.root}>
                {entity.name}
              </EntityRefLink>
            </>
          )}
          {contentSuffix}
          {!isNil(scorecard) && (
            <>
              {' '}
              in{' '}
              <ScorecardRefLink
                scorecardId={scorecard.id}
                className={linkClasses.root}
              >
                {scorecard.name}
              </ScorecardRefLink>
            </>
          )}
        </InsightCard>
      );
    }
    case UserInsightType.NO_ENTITIES_OWNED: {
      return (
        <InsightCard>
          Looks like you own no entities. Try creating one or add yourself as an
          owner to an existing one.
        </InsightCard>
      );
    }
    case UserInsightType.NO_FAILING_RULES: {
      return (
        <InsightCard>
          Great work! You don't have any more Scorecard rules left; all your
          services are crushing it! 🎉
        </InsightCard>
      );
    }
    case UserInsightType.NO_SCORECARDS: {
      return (
        <InsightCard>
          Looks like you have no scorecards - create one!
        </InsightCard>
      );
    }
    default: {
      return <></>;
    }
  }
};
