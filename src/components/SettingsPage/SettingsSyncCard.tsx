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
import React, { useEffect, useState } from 'react';
import SyncIcon from '@material-ui/icons/Sync';
import CancelIcon from '@material-ui/icons/Cancel';
import {
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import { InfoCard, Link, WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { extensionApiRef } from '../../api/ExtensionApi';
import PollingProgressBar from '../Common/PollingProgressBar';
import { useAsync } from 'react-use';
import moment from 'moment';

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

interface CancelSyncButtonProps {
  cancelSync: () => Promise<void>;
}

const CancelSyncButton = ({ cancelSync }: CancelSyncButtonProps) => {
  const [isCancelling, setIsCancelling] = useState(false);
  return (
    <IconButton
      onClick={() => {
        setIsCancelling(true);
        cancelSync().finally(() => setIsCancelling(false));
      }}
      aria-busy={isCancelling}
      aria-label="Cancel entity sync"
    >
      {isCancelling ? <CircularProgress /> : <CancelIcon />}
    </IconButton>
  );
};

export const SettingsSyncCard = () => {
  const catalogApi = useApi(catalogApiRef);
  const cortexApi = useApi(cortexApiRef);
  const extensionApi = useApi(extensionApiRef);

  const [syncTaskProgressPercentage, setSyncTaskProgressPercentage] = useState<
    number | null
  >(null);

  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

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

  const cancelSync = async () => {
    await cortexApi.cancelSync();
  };

  const { value: initialSyncTaskProgress, error: syncProgressError } =
    useAsync(async () => {
      return await cortexApi.getSyncTaskProgress();
    }, []);

  const { value: initialLastSynced, error: lastSyncError } =
    useAsync(async () => {
      return await cortexApi.getLastSyncTime();
    }, []);

  useEffect(() => {
    if (
      syncTaskProgressPercentage === null &&
      initialSyncTaskProgress !== undefined
    ) {
      setSyncTaskProgressPercentage(initialSyncTaskProgress.percentage);
    }
  }, [
    initialSyncTaskProgress,
    setSyncTaskProgressPercentage,
    syncTaskProgressPercentage,
  ]);

  useEffect(() => {
    if (lastSyncedTime === null && initialLastSynced !== undefined) {
      setLastSyncedTime(initialLastSynced.lastSynced);
    }
  }, [initialLastSynced, lastSyncedTime, setLastSyncedTime]);

  return (
    <InfoCard
      title="Sync Entities"
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
      {syncTaskProgressPercentage !== null && (
        <Grid
          container
          alignItems="center"
          direction={'row'}
          justifyContent="center"
          style={{ marginBottom: '2px' }}
        >
          <Grid item lg={10} justifyContent="center">
            <PollingProgressBar
              done={false}
              poll={async () => {
                const currentProgress = await cortexApi.getSyncTaskProgress();
                setSyncTaskProgressPercentage(currentProgress.percentage);
                if (currentProgress.percentage === null) {
                  setLastSyncedTime(
                    (await cortexApi.getLastSyncTime()).lastSynced,
                  );
                }
              }}
              value={syncTaskProgressPercentage}
            />
          </Grid>
          <Grid item lg={2} justifyContent="center">
            <CancelSyncButton cancelSync={cancelSync} />
          </Grid>
        </Grid>
      )}
      {lastSyncedTime !== null ? (
        <Typography>
          <i>
            Last synced on{' '}
            {moment
              .utc(lastSyncedTime)
              .local()
              .format('MMM Do YYYY, h:mm:ss a')}
          </i>
        </Typography>
      ) : (
        <Typography>
          <i>Entities have never been synced before.</i>
        </Typography>
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
