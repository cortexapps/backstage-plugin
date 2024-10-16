/*
 * Copyright 2024 Cortex Applications, Inc.
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
import React, { useCallback, useEffect, useState } from 'react';
import SyncIcon from '@material-ui/icons/Sync';
import CancelIcon from '@material-ui/icons/Cancel';
import {
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import { InfoCard, Link, WarningPanel } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { extensionApiRef } from '../../api/ExtensionApi';
import PollingLinearGauge from '../Common/PollingLinearGauge';
import moment from 'moment';
import { Entity } from '@backstage/catalog-model';
import { applyCustomMappings } from '../../utils/ComponentUtils';

interface SyncButtonProps {
  isSyncing: boolean;
  submitSyncTask: () => Promise<void>;
}

const SyncButton: React.FC<SyncButtonProps> = ({
  isSyncing,
  submitSyncTask,
}) => {
  return (
    <IconButton
      onClick={() => submitSyncTask()}
      disabled={isSyncing}
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

const CancelSyncButton: React.FC<CancelSyncButtonProps> = ({ cancelSync }) => {
  const [isCanceling, setIsCanceling] = useState(false);

  return (
    <IconButton
      onClick={() => {
        setIsCanceling(true);
        cancelSync().finally(() => setIsCanceling(false));
      }}
      aria-busy={isCanceling}
      aria-label="Cancel entity sync"
    >
      {isCanceling ? <CircularProgress /> : <CancelIcon />}
    </IconButton>
  );
};

export const SyncCard = () => {
  const catalogApi = useApi(catalogApiRef);
  const config = useApi(configApiRef);
  const cortexApi = useApi(cortexApiRef);
  const extensionApi = useApi(extensionApiRef);

  const [syncTaskProgressPercentage, setSyncTaskProgressPercentage] = useState<
    number | null
  >(null);

  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [cortexSyncError, setCortexSyncError] = useState<string | undefined>(
    undefined,
  );

  const getBackstageEntities = useCallback(async () => {
    const syncEntityFilter = await extensionApi.getSyncEntityFilter?.();
    const { items: entities } = await catalogApi.getEntities(
      syncEntityFilter?.kinds
        ? { filter: { kind: syncEntityFilter?.kinds } }
        : undefined,
    );

    const filteredEntities = syncEntityFilter?.entityFilter
      ? entities.filter(syncEntityFilter?.entityFilter)
      : entities;

    const customMappings = await extensionApi.getCustomMappings?.();
    const withCustomMappings: Entity[] = customMappings
      ? filteredEntities.map(entity =>
          applyCustomMappings(entity, customMappings),
        )
      : filteredEntities;

    return withCustomMappings;
  }, [catalogApi, extensionApi]);

  const submitEntitySync = useCallback(async () => {
    setIsSubmittingTask(true);
    const entities = await getBackstageEntities();
    const shouldGzipBody =
      config.getOptionalBoolean('cortex.syncWithGzip') ?? false;
      const syncChunkSize =
      config.getOptionalNumber('cortex.syncChunkSize');
    const groupOverrides = await extensionApi.getTeamOverrides?.(entities);
    setCortexSyncError(undefined);
    try {
      const progress = await cortexApi.submitEntitySync(
        entities,
        shouldGzipBody,
        groupOverrides,
        syncChunkSize,
      );
      setSyncTaskProgressPercentage(progress.percentage);
    } catch (e: any) {
      setCortexSyncError(e.message);
    }
    setIsSubmittingTask(false);
  }, [getBackstageEntities, config, cortexApi, extensionApi]);

  const cancelEntitySync = useCallback(async () => {
    await cortexApi.cancelEntitySync();
    setSyncTaskProgressPercentage(null);
    const lastSyncedTime = (await cortexApi.getLastEntitySyncTime()).lastSynced;
    setLastSyncedTime(lastSyncedTime);
  }, [cortexApi]);

  const updateEntitySyncProgress = useCallback(async () => {
    const currentProgress = await cortexApi.getEntitySyncProgress();
    if (currentProgress.percentage === null) {
      setLastSyncedTime((await cortexApi.getLastEntitySyncTime()).lastSynced);
    }
    setSyncTaskProgressPercentage(currentProgress.percentage);
  }, [cortexApi]);

  useEffect(() => {
    updateEntitySyncProgress();
  }, [updateEntitySyncProgress]);

  const updateLastEntitySyncTime = useCallback(async () => {
    setLastSyncedTime((await cortexApi.getLastEntitySyncTime()).lastSynced);
  }, [cortexApi]);

  useEffect(() => {
    updateLastEntitySyncTime();
  }, [updateLastEntitySyncTime]);

  return (
    <>
      {cortexSyncError !== undefined && (
        <WarningPanel severity="error" title={cortexSyncError}>
          There is already a sync in progress. Try again in 10 minutes.
        </WarningPanel>
      )}
      <InfoCard
        title="Sync entities"
        action={
          cortexSyncError === undefined && (
            <SyncButton
              isSyncing={
                syncTaskProgressPercentage !== null || isSubmittingTask
              }
              submitSyncTask={submitEntitySync}
            />
          )
        }
      >
        {syncTaskProgressPercentage !== null && (
          <Grid
            container
            alignItems="center"
            direction={'row'}
            justifyContent="center"
            style={{ marginBottom: '2px' }}
          >
            <Grid item lg={10} data-testid={`PollingLinearGauge-entity-sync`}>
              <PollingLinearGauge
                done={false}
                poll={updateEntitySyncProgress}
                value={syncTaskProgressPercentage}
              />
            </Grid>
            <Grid item lg={2}>
              <CancelSyncButton cancelSync={cancelEntitySync} />
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
          You can also set this up to automatically sync with our{' '}
          <Link to="https://www.npmjs.com/package/@cortexapps/backstage-backend-plugin">
            backend plugin
          </Link>
          .
        </Typography>
      </InfoCard>
    </>
  );
};
