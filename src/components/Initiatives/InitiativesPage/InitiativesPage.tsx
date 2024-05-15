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
import { cortexApiRef } from '../../../api';
import { useAsync } from 'react-use';
import { EmptyState, Progress, WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Route, Routes } from 'react-router-dom';
import { InitiativeDetailsPage } from '../InitiativeDetailsPage';
import { InitiativesList } from './InitiativesList';
import { useInitiativesCustomName } from '../../../utils/hooks';
import { capitalize } from 'lodash';

export const InitiativesPage = () => {
  const cortexApi = useApi(cortexApiRef);

  const {
    value: scorecards,
    loading,
    error,
  } = useAsync(async () => {
    return await cortexApi.getScorecards();
  }, []);
  
  const { plural: initiativesName } = useInitiativesCustomName();

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title={`Could not load ${initiativesName}.`}>
        {error.message}
      </WarningPanel>
    );
  }

  if (!scorecards?.length) {
    return (
      <EmptyState
        missing="info"
        title={`No ${initiativesName} to display`}
        description="You haven't added any scorecards yet."
      />
    );
  }

  return (
    <Routes>
      <Route path="/:id" element={<InitiativeDetailsPage />} />
      <Route path="/" element={<InitiativesList />} />
    </Routes>
  );
};
