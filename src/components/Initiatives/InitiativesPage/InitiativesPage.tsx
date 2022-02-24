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
import { cortexApiRef } from '../../../api';
import { useAsync } from 'react-use';
import {
  Content,
  ContentHeader,
  EmptyState,
  ItemCardGrid,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Route } from 'react-router-dom';
import { Routes } from 'react-router';
import { InitiativeDetailsPage } from '../InitiativeDetailsPage';
import { InitiativeCard } from '../InitiativeCard';

const InitiativesPageBody = () => {
  const cortexApi = useApi(cortexApiRef);

  const {
    value: initiatives,
    loading,
    error,
  } = useAsync(async () => {
    return await cortexApi.getInitiatives();
  }, []);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not load initiatives.">
        {error.message}
      </WarningPanel>
    );
  }

  if (!initiatives?.length) {
    return (
      <EmptyState
        missing="info"
        title="No initiatives to display"
        description="You haven't added any initiatives yet."
      />
    );
  }

  return (
    <ItemCardGrid>
      {initiatives.map(initiative => (
        <InitiativeCard key={initiative.id} initiative={initiative} />
      ))}
    </ItemCardGrid>
  );
};

export const InitiativesPage = () => {
  const cortexApi = useApi(cortexApiRef);

  const {
    value: initiatives,
    loading,
    error,
  } = useAsync(async () => {
    return await cortexApi.getScorecards();
  }, []);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not load initiatives.">
        {error.message}
      </WarningPanel>
    );
  }

  if (!initiatives?.length) {
    return (
      <EmptyState
        missing="info"
        title="No initiatives to display"
        description="You haven't added any initiatives yet."
      />
    );
  }

  return (
    <Routes>
      <Route path="/:id" element={<InitiativeDetailsPage />} />
      <Route
        path="/"
        element={
          <Content>
            <ContentHeader title="Initiatives" />
            <InitiativesPageBody />
          </Content>
        }
      />
    </Routes>
  );
};
