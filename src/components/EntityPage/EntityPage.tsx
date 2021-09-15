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
import React from 'react';
import { Content, Progress, WarningPanel } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { EntityScorecardsCard } from './EntityScorecardsCard';
import { useEntityFromUrl } from '@backstage/plugin-catalog-react';
import { EntityInitiativesCard } from './EntityInitiativesCard';

export const EntityPage = () => {
  const { entity, loading, error } = useEntityFromUrl();

  if (loading) {
    return <Progress />;
  }

  if (error !== undefined || entity === undefined) {
    return (
      <WarningPanel
        severity="error"
        title="Could not load entity"
        message={error}
      />
    );
  }

  return (
    <Content>
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <EntityScorecardsCard entity={entity} />
        </Grid>
        <Grid item lg={8}>
          <EntityInitiativesCard entity={entity} />
        </Grid>
      </Grid>
    </Content>
  );
};
