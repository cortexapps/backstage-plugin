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
import { isUndefined } from 'lodash';
import { CortexLayout } from '../CortexLayout';
import { ScorecardsPage } from '../../extensions';
import { SettingsPage } from '../SettingsPage';
import { InitiativesPage } from '../Initiatives/InitiativesPage';
import { ReportsPage } from '../ReportsPage';
import { useAsync } from 'react-use';
import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../api';
import { Permission } from '../../api/types';

export const CortexPage = ({
  title = 'Cortex',
  subtitle = 'Understand and improve your services.',
}) => {
  const cortexApi = useApi(cortexApiRef);

  const {
    value: permissions,
    loading: loadingPermissions,
    error,
  } = useAsync(async () => {
    return await cortexApi.getUserPermissions();
  }, []);

  if (loadingPermissions) {
    return <Progress />;
  }

  return (
    <CortexLayout title={title} subtitle={subtitle}>
      <CortexLayout.Route path="scorecards" title="Scorecards">
        <ScorecardsPage />
      </CortexLayout.Route>
      <CortexLayout.Route path="reports" title="Reports">
        <ReportsPage />
      </CortexLayout.Route>
      <CortexLayout.Route path="initiatives" title="Initiatives">
        <InitiativesPage />
      </CortexLayout.Route>
      {/*
      Show the settings page if there is an error (will occur when email header authorization returns an error, which is a valid use case)
      or if the user has the EDIT_SETTINGS permission
       */}
      {(!isUndefined(error) ||
        (permissions &&
          permissions?.permissions.includes(Permission.EDIT_SETTINGS))) && (
        <CortexLayout.Route path="settings" title="Settings">
          <SettingsPage />
        </CortexLayout.Route>
      )}
    </CortexLayout>
  );
};
