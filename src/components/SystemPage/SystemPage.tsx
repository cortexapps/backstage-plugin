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
import React, { useMemo } from 'react';
import { Table, TableBody } from '@material-ui/core';
import {
  Content,
  EmptyState,
  InfoCard,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';

import { useCortexApi, usePartialScorecardCompareFn } from '../../utils/hooks';
import { defaultSystemRefContext } from '../../utils/ComponentUtils';
import { useDetailCardStyles } from '../../styles/styles';
import { SystemPageRow } from './SystemPageRow';

import { GroupByOption } from '../../api/types';
import { isUndefined } from 'lodash';

export const SystemPage = () => {
  const classes = useDetailCardStyles();
  const { entity } = useEntity();
  const { value: serviceGroupScores } = useCortexApi(
    api => api.getServiceScorecardScores(GroupByOption.SERVICE_GROUP),
    [GroupByOption.SERVICE_GROUP],
  );

  const mySystemScores = useMemo(
    () =>
      serviceGroupScores?.filter(serviceGroupScore => {
        const { name } = parseEntityRef(
          serviceGroupScore?.identifier ?? '',
          defaultSystemRefContext,
        );
        return name === entity?.metadata.name;
      })?.[0],
    [serviceGroupScores, entity],
  );

  const myComponents = useMemo(
    () =>
      entity?.relations
        ?.filter(({ type }) => type === 'hasPart')
        .map(({ targetRef }) => parseEntityRef(targetRef).name),
    [entity],
  );

  const { value: scorecardScores } = useCortexApi(
    api =>
      mySystemScores?.scores
        ? Promise.all(
            mySystemScores?.scores.map(score =>
              api.getScorecardScores(score.scorecardId),
            ),
          )
        : Promise.resolve([]),
    [mySystemScores],
  );

  const scorecardData = useMemo(
    () =>
      mySystemScores?.scores.map((score, index) => ({
        score,
        scoresForScorecard:
          scorecardScores?.[index]?.filter(({ componentRef }) =>
            myComponents?.includes(componentRef),
          ) ?? [],
      })),
    [mySystemScores, myComponents, scorecardScores],
  );

  const {
    compareFn: scorecardCompareFn,
    loading: loadingScorecardCompareFn,
    error: scorecardCompareFnError,
  } = usePartialScorecardCompareFn();

  const sortedScorecardData = useMemo(() => {
    return scorecardData?.sort(
      isUndefined(scorecardCompareFn)
        ? undefined
        : (a, b) =>
            scorecardCompareFn(
              { id: a.score.scorecardId },
              { id: b.score.scorecardId },
            ),
    );
  }, [scorecardData, scorecardCompareFn]);

  if (loadingScorecardCompareFn) {
    return <Progress />;
  }

  if (scorecardCompareFnError) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecards.">
        {scorecardCompareFnError.message}
      </WarningPanel>
    );
  }

  return (
    <Content>
      <InfoCard title="System Scorecards" className={classes.root}>
        {sortedScorecardData?.length === 0 ? (
          <EmptyState missing="data" title="No scorecards found." />
        ) : (
          <Table>
            <TableBody>
              {sortedScorecardData?.map(_ => (
                <SystemPageRow
                  key={`SystemPageRow-${_.score.scorecardId}`}
                  score={_.score}
                  scoresForScorecard={_.scoresForScorecard}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </InfoCard>
    </Content>
  );
};
