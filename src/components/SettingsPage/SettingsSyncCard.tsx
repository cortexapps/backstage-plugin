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
import React, { useState } from 'react';
import SyncIcon from '@material-ui/icons/Sync';
import { CircularProgress, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core';
import { Info, Close } from '@material-ui/icons'
import { InfoCard, Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { cortexApiRef } from '../../api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { extensionApiRef } from '../../api/ExtensionApi';
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { OverrideViewer } from "./OverrideViewer";

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
    >
      {isSyncing ? <CircularProgress /> : <SyncIcon />}
    </IconButton>
  );
};

const OverrideViewerButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button startIcon={<Info/>} onClick={() => setOpen(true)}>
        Test Custom Mappings
      </Button>
      <Dialog fullScreen open={open}>
        <DialogTitle>
          Test Custom Mappings
          <IconButton onClick={() => setOpen(false)}>
            <Close/>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <OverrideViewer/>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const SettingsSyncCard = () => {
  const catalogApi = useApi(catalogApiRef);
  const cortexApi = useApi(cortexApiRef);
  const extensionApi = useApi(extensionApiRef);

  const syncEntities = async () => {
    const { items: entities } = await catalogApi.getEntities();
    const customMappings = await extensionApi.getCustomMappings?.();
    const groupOverrides = await extensionApi.getTeamOverrides?.(entities)
    await cortexApi.syncEntities(entities, customMappings, groupOverrides);
  };

  return (
    <InfoCard
      title="Sync Entities"
      action={<SyncButton syncEntities={syncEntities} />}
    >
      <Typography>
        Manually sync your Backstage entities with Cortex.
        <br />
        You can also set this up to automatically sync with our&nbsp;
        <Link to="https://www.npmjs.com/package/@cortexapps/backstage-backend-plugin">
          backend plugin
        </Link>
        .
      </Typography>
      <Box display="flex" alignItems="center">
        <OverrideViewerButton/>
      </Box>
    </InfoCard>
  );
};
