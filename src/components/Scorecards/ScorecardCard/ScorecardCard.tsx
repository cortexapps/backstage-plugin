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
