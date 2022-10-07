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
import { useApi } from "@backstage/core-plugin-api";
import { catalogApiRef } from "@backstage/plugin-catalog-react";
import { useAsync } from "react-use";
import { DependencyGraph, Progress, WarningPanel } from "@backstage/core-components";
import { extensionApiRef } from "../../api/ExtensionApi";
import { isUndefined } from "lodash";

export const OverrideViewer = () => {
  const catalogApi = useApi(catalogApiRef);
  const extensionApi = useApi(extensionApiRef);

  const { value: entities, loading: loadingEntities, error: entityError } = useAsync(async () => {
    const entitiesResponse = await catalogApi.getEntities();
    return entitiesResponse.items
  });
  const { value: teams, loading: loadingOverrides, error: overrideError } = useAsync(async () => {
    return !isUndefined(extensionApi.getTeamOverrides) ? await extensionApi.getTeamOverrides(entities ?? []) : undefined;
  }, [extensionApi, entities]);

  if (loadingEntities || loadingOverrides) {
    return <Progress />;
  }

  if (entityError || overrideError) {
    return (
      <WarningPanel severity="error" title={`Could not load ${(entityError ? 'entities' : 'overrides')}.`}>
        {(entityError ?? overrideError)?.message}
      </WarningPanel>
    );
  }

  if (isUndefined(teams)) {
    return (
      <WarningPanel severity="info" title="No team overrides defined."/>
    )
  }

  return (
    <DependencyGraph
      nodes={teams.teams.map(team => {
        return {
          id: team.teamTag
        }
      })}
      edges={teams.relationships.map(relationship => {
        return {
         from: relationship.parentTeamTag,
         to: relationship.childTeamTag
        }
      })}
    />
  )
}