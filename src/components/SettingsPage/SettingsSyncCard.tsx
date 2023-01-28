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
import React, { useEffect, useState } from 'react';
import SyncIcon from '@material-ui/icons/Sync';
import { CircularProgress, IconButton, Typography } from '@material-ui/core';
import {
  InfoCard,
  LinearGauge,
  Link,
  WarningPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { extensionApiRef } from '../../api/ExtensionApi';
import PollingProgressBar from '../Common/PollingProgressBar';
import { useAsync } from 'react-use';
import { percentify } from '../../utils/NumberUtils';

interface SyncButtonProps {
  syncEntities: () => Promise<void>;
}

const SyncButton = ({ syncEntities }: SyncButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);

  return (
    <IconButton
      onClick={() => {
        setIsSyncing(true);
        syncEntities().finally(() => setIsSyncing(false));
      }}
      aria-busy={isSyncing}
      aria-label="Sync Entities"
    >
      {isSyncing ? <CircularProgress /> : <SyncIcon />}
    </IconButton>
  );
};

export const SettingsSyncCard = () => {
  const catalogApi = useApi(catalogApiRef);
  const cortexApi = useApi(cortexApiRef);
  const extensionApi = useApi(extensionApiRef);

  const [syncTaskProgressPercentage, setSyncTaskProgressPercentage] = useState<
    number | undefined
  >(undefined);

  const syncEntities = async () => {
    const { items: entities } = await catalogApi.getEntities();
    const customMappings = await extensionApi.getCustomMappings?.();
    const groupOverrides = await extensionApi.getTeamOverrides?.(entities);
    const progress = await cortexApi.submitSyncTask(
      entities,
      customMappings,
      groupOverrides,
    );
    setSyncTaskProgressPercentage(progress.percentage);
  };

  const {
    value: initialSyncTaskProgress,
    // loading: syncProgressLoading,
    error: syncProgressError,
  } = useAsync(async () => {
    console.log('sad sad get sync task progress');
    return await cortexApi.getSyncTaskProgress();
  }, []);

  const {
    // value: lastSynced,
    // loading: lastSyncLoading,
    error: lastSyncError,
  } = useAsync(async () => {
    console.log('sad sad get last sync time');
    return await cortexApi.getLastSyncTime();
  }, []);

  useEffect(() => {
    setSyncTaskProgressPercentage(initialSyncTaskProgress?.percentage);
  }, [
    initialSyncTaskProgress,
    setSyncTaskProgressPercentage,
    // syncTaskProgressPercentage,
  ]);

  console.log('sad sad ' + syncTaskProgressPercentage);
  return (
    <InfoCard
      title="Sync 20"
      action={<SyncButton syncEntities={syncEntities} />}
    >
      {syncProgressError && (
        <WarningPanel
          severity="error"
          title="Could not load Cortex entity sync progress."
        >
          {syncProgressError.message}
        </WarningPanel>
      )}
      {lastSyncError && (
        <WarningPanel
          severity="error"
          title="Could not load date of most recent Cortex entity sync."
        >
          {lastSyncError.message}
        </WarningPanel>
      )}
      {syncTaskProgressPercentage !== undefined && (
        <PollingProgressBar
          done={false}
          poll={async () =>
            setSyncTaskProgressPercentage(
              (await cortexApi.getSyncTaskProgress())?.percentage,
            )
          }
          value={syncTaskProgressPercentage}
        />
      )}
      <Typography>
        Manually sync your Backstage entities with Cortex.
        <br />
        You can also set this up to automatically sync with our&nbsp;
        <Link to="https://www.npmjs.com/package/@cortexapps/backstage-backend-plugin">
          backend plugin
        </Link>
        .
      </Typography>
    </InfoCard>
  );
};
