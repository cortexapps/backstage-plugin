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
import { Button } from "@material-ui/core";
import React from "react";
import { cortexApiRef } from "../../../api";
import { useAsync } from "react-use";
import { Content, ContentHeader, EmptyState, ItemCardGrid, Progress, WarningPanel, } from '@backstage/core-components';
import { useApi } from "@backstage/core-plugin-api";
import { ScorecardCard } from "../ScorecardCard";
import { Route } from 'react-router-dom';
import { ScorecardDetailsPage } from "../ScorecardDetailsPage";
import { Routes } from "react-router";
import { ScorecardsServicePage } from "../ScorecardDetailsPage/ScorecardsTableCard/ScorecardsServicePage";

const ScorecardsPageBody = () => {
  const cortexApi = useApi(cortexApiRef);

  const { value: scorecards, loading, error } = useAsync(async () => {
    return await cortexApi.getScorecards();
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

  if (!scorecards?.length) {
    return (
      <EmptyState
        missing="info"
        title="No scorecards to display"
        description="You haven't added any scorecards yet."
        action={
          <Button
            variant="contained"
            color="primary"
            href="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-domain"
          >
            Read more
          </Button>
        }
      />
    );
  }

  return (
    <ItemCardGrid>
      {scorecards.map((scorecard) => (
        <ScorecardCard key={scorecard.id} scorecard={scorecard} />
      ))}
    </ItemCardGrid>
  );
}

export const ScorecardsPage = () =>  {
  const cortexApi = useApi(cortexApiRef);

  const { value: scorecards, loading, error } = useAsync(async () => {
    return await cortexApi.getScorecards();
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

  if (!scorecards?.length) {
    return (
      <EmptyState
        missing="info"
        title="No scorecards to display"
        description="You haven't added any scorecards yet."
        action={
          <Button
            variant="contained"
            color="primary"
            href="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-domain"
          >
            Read more
          </Button>
        }
      />
    );
  }

  return (
    <Routes>
      <Route path="/:scorecardId/service/:serviceId" element={<ScorecardsServicePage/>}/>
      <Route path="/:id" element={<ScorecardDetailsPage/>}/>
      <Route path="/" element={(
        <Content>
          <ContentHeader title="Scorecards" />
          <ScorecardsPageBody />
        </Content>
      )}
      />
    </Routes>
  );
}

