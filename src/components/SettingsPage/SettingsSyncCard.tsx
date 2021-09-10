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
import React from "react";
import SyncIcon from '@material-ui/icons/Sync';
import { IconButton, Typography } from "@material-ui/core";
import { InfoCard, Link } from "@backstage/core-components";

const SyncButton = () => {
  return (
    <IconButton>
      <SyncIcon/>
    </IconButton>
  )
}

export const SettingsSyncCard = () => {
  return (
    <InfoCard title="Sync Entities" action={<SyncButton/>}>
      <Typography>
        Manually sync your Backstage entities with Cortex.
        <br/>
        You can also set this up to automatically sync
        with our&nbsp;
        <Link to="https://www.npmjs.com/package/@cortexapps/backstage-backend-plugin">
          backend plugin
        </Link>.
      </Typography>
    </InfoCard>
  )
}
