/*
 * Copyright 2021 Cortex Applications, Inc.
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
import { Content, EmptyState, InfoCard } from '@backstage/core-components';
import { useEntityFromUrl } from '@backstage/plugin-catalog-react';
import { parseEntityName } from '@backstage/catalog-model';

import { useCortexApi } from '../../utils/hooks';
import { defaultSystemRefContext } from '../../utils/ComponentUtils';
import { useDetailCardStyles } from '../../styles/styles';
import { SystemPageRow } from './SystemPageRow';

import { GroupByOption } from '../../api/types';

export const SystemPage = () => {
  const classes = useDetailCardStyles();
  const { entity } = useEntityFromUrl();
  const { value: serviceGroupScores } = useCortexApi(
    api => api.getServiceScorecardScores(GroupByOption.SERVICE_GROUP),
    [GroupByOption.SERVICE_GROUP],
  );
  const mySystemScores = useMemo(
    () =>
      serviceGroupScores?.filter(serviceGroupScore => {
        const { name } = parseEntityName(
          serviceGroupScore?.identifier ?? '',
          defaultSystemRefContext,
        );
        return name === entity?.metadata.name;
      })?.[0],
    [serviceGroupScores],
  );
  const myComponents = useMemo(
    () =>
      entity?.relations
        ?.filter(({ type }) => type === 'hasPart')
        .map(({ target }) => target.name),
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
  const data = useMemo(
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

  return (
    <Content>
      <InfoCard title="System Scorecards" className={classes.root}>
        {data?.length === 0 ? (
          <EmptyState missing="data" title="No scorecards found." />
        ) : (
          <Table>
            <TableBody>
              {data?.map(_ => (
                <SystemPageRow
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
