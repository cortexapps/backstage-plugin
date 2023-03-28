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
import { DependencyGraph, Progress, WarningPanel } from '@backstage/core-components';
import React from 'react';
import { useApi } from "@backstage/core-plugin-api";
import { extensionApiRef } from "../../../api/ExtensionApi";
import { useAsync } from "react-use";
import { catalogApiRef } from "@backstage/plugin-catalog-react";
import { TeamOverrides } from "@cortexapps/backstage-plugin-extensions";

const createGraph = (teamOverrides: TeamOverrides) => {
  const groupNodes = teamOverrides.teams.map(team => {
    return {
      id: team.teamTag
    }
  })

  const groupEdges = teamOverrides.relationships.map(relationship => {
    return {
      from: relationship.parentTeamTag,
      to: relationship.childTeamTag
    }
  });

  const teamToUsers = teamOverrides.teams.reduce((previous, team) => {
    const teamTag = team.teamTag
    previous[teamTag] = previous[teamTag] ?? [];
    for (const emailUser of team.emailMembers ?? []) {
      previous[teamTag].push(emailUser.email);
    }
    return previous
  }, {} as Record<string, string[]>);

  const userEdges: {from: string, to: string}[] = Object
    .keys(teamToUsers)
    .flatMap(team => {
      return teamToUsers[team].map(user => {
        return {
          from: team,
          to: user
        }
      })
    });

  const userNodes = teamOverrides
    .teams
    .flatMap(team => team.emailMembers?.map(emailMember => emailMember.email) ?? [])
    .map(email => {
      return { id: email }
    })

  return {
    nodes: [...groupNodes, ...userNodes],
    edges: [...groupEdges, ...userEdges],
  }
}

export const GroupOverridesDebugger = () => {
  const catalogApi = useApi(catalogApiRef);
  const extensionApi = useApi(extensionApiRef);

  const { loading, error, value: teamOverrides } = useAsync(async () => {
    const { items: entities } = await catalogApi.getEntities();
    return extensionApi.getTeamOverrides?.(entities);
  })

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not load action items.">
        {error?.message}
      </WarningPanel>
    );
  }

  if (teamOverrides === undefined) {
    return <WarningPanel severity="warning" title="No group overrides defined."/>
  }

  if (teamOverrides.teams.length === 0) {
    return <WarningPanel severity="warning" title="No groups defined."/>
  }

  const graph = createGraph(teamOverrides);

  return (
    <DependencyGraph
      edges={graph.edges}
      nodes={graph.nodes}
    />
  )
}