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
import React from 'react';
import { Route } from 'react-router-dom';
import { Routes, useLocation } from 'react-router-dom';
import {
  ItemCardGrid,
  ItemCardHeader,
  LinkButton,
} from '@backstage/core-components';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
} from '@material-ui/core';
import { HeatmapPage } from './HeatmapPage';
import { ProgressPage } from './ProgressPage';
import { AllScorecardsPage } from './AllScorecardsPage/AllScorecardsPage';
import { useRouteRefParams } from '@backstage/core-plugin-api';
import { scorecardRouteRef } from '../../routes';

const ReportsPageCard = ({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) => {
  const location = useLocation();
  const { id: scorecardId } = useRouteRefParams(scorecardRouteRef);
  const isInReportsContext = location.pathname === 'cortex/reports';

  const renderRelativeLink = () => (
    <LinkButton to={`${location.pathname}${url}`} color="primary">
      Details
    </LinkButton>
  );

  const renderAbsoluteLink = () => {
    const reportUrl = `${window.location.origin}/cortex/reports${url}?scorecardId=${scorecardId}`;
    const redirect = () => {
      window.location.href = reportUrl;
    };

    return <Button onClick={redirect}>Details</Button>;
  };

  return (
    <Card>
      <CardMedia>
        <ItemCardHeader title={name} />
      </CardMedia>
      <CardContent>{description}</CardContent>
      <CardActions>
        {isInReportsContext ? renderRelativeLink() : renderAbsoluteLink()}
      </CardActions>
    </Card>
  );
};

const ReportsPageBody = () => {
  const location = useLocation();
  const isInReportsContext = location.pathname === 'cortex/reports';

  return (
    <ItemCardGrid>
      <ReportsPageCard
        name="Bird's Eye"
        description="Dive into your Scorecards to get insight into performance, broken down by teams, groups and rules and visualized as a heatmap."
        url="/heatmap"
      />
      {isInReportsContext && (
        <ReportsPageCard
          name="All Scorecards"
          description="See how services, teams, and groups are doing across all of your Scorecards in a single aggregated view."
          url="/all-scorecards"
        />
      )}
      <ReportsPageCard
        name="Progress"
        description="Progress report of how Scorecards have changed overtime broken down by teams or groups."
        url="/progress"
      />
    </ItemCardGrid>
  );
};

export const ReportsPage = () => {
  return (
    <Routes>
      <Route path="/" element={<ReportsPageBody />} />
      <Route path="/heatmap" element={<HeatmapPage />} />
      <Route path="/all-scorecards" element={<AllScorecardsPage />} />
      <Route path="/progress" element={<ProgressPage />} />
    </Routes>
  );
};
