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
import { useApi } from "@backstage/core-plugin-api";
import { cortexApiRef } from "../../api";
import { useAsync } from "react-use";
import { Entity, stringifyEntityRef } from "@backstage/catalog-model";
import { EmptyState, InfoCard, Progress, WarningPanel } from "@backstage/core-components";
import { Table, TableBody } from "@material-ui/core";
import { EntityScorecardsCardRow } from "./EntityScorecardsCardRow";

interface EntityScorecardsCardProps {
  entity: Entity
}

export const EntityScorecardsCard = ({
  entity
}: EntityScorecardsCardProps) => {

  const cortexApi = useApi(cortexApiRef);

  const { value: scores, loading, error } = useAsync(async () => {
    return await cortexApi.getServiceScores(stringifyEntityRef(entity));
  }, []);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not load scorecards.">
        {error.message}
      </WarningPanel>
    );
  }

  if (!scores?.length) {
    return (
      <EmptyState
        missing="info"
        title="No scorecards to display"
        description="You haven't added any scorecards yet."
      />
    );
  }


  return (
    <InfoCard title="Scorecards">
      <Table>
        <TableBody>
          { scores.map(score => (
            <EntityScorecardsCardRow score={score}/>
          ))}
        </TableBody>
      </Table>
    </InfoCard>
  )
}
