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
import { Card, CardActions, CardContent, CardMedia, } from '@material-ui/core';
import React from 'react';

import { Button, ItemCardHeader } from '@backstage/core-components';
import { Scorecard } from "../../../api/types";
import { useRouteRef } from "@backstage/core-plugin-api";
import { rootRouteRef } from "../../../routes";

type ScorecardCardProps = {
  scorecard: Scorecard;
};

// TODO: Use subRouteRefs, currently RoutedTabs doesn't update URL to default to first tab
export const ScorecardCard = ({ scorecard }: ScorecardCardProps) => {

  const root = useRouteRef(rootRouteRef)

  return (
    <Card>
      <CardMedia>
        <ItemCardHeader title={scorecard.name} subtitle={`By ${scorecard.creator.name}`}/>
      </CardMedia>
      <CardContent>
        {scorecard.description}
      </CardContent>
      <CardActions>
        <Button to={`${root()}/scorecards/${scorecard.id}`} color="primary">
          Details
        </Button>
      </CardActions>
    </Card>
  );
};
