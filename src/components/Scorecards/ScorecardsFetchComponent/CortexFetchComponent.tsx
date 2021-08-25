/*
 * Copyright 2021 Cortex Applications Inc.
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
import { useApi } from '@backstage/core';
import { useAsync } from 'react-use';
import { cortexApiRef } from '../../../api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { CortexScorecardsTable } from '../../CortexScorecardsTable/CortexScorecardsTable';

export const CortexFetchComponent = () => {
  const catalogApi = useApi(catalogApiRef);
  const cortexApi = useApi(cortexApiRef);

  const { value, loading, error } = useAsync(async () => {
    const { items: entities } = await catalogApi.getEntities({
      filter: { kind: 'Component' },
    });

    return await Promise.all(
      entities.map(async entity => {
        const scores = await cortexApi.getServiceScores(entity.metadata.name);
        return { entity, scores };
      }),
    );
  }, []);

  const entities = (value ?? []).map(entityScore => entityScore.entity);

  return (
    <CortexScorecardsTable
      entityScores={value ?? []}
      loading={loading}
      error={error}
      syncCortex={() => cortexApi.syncEntities(entities)}
    />
  );
};
