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
import { Card, CardActions, CardContent, CardMedia } from '@material-ui/core';
import React from 'react';
// import { ItemCardHeader } from '../ItemCardHeader';
import { Button, ItemCardHeader } from '@backstage/core-components';

interface ListCardProps {
  name: string;
  creatorName: string;
  description?: string;
  url: string;
}

export const ListCard = ({
  name,
  creatorName,
  description,
  url,
}: ListCardProps) => {
  return (
    <Card>
      <CardMedia>
        <ItemCardHeader title={name} subtitle={`By ${creatorName}`} />
      </CardMedia>
      <CardContent>{description}</CardContent>
      <CardActions>
        <Button to={url} color="primary">
          Details
        </Button>
      </CardActions>
    </Card>
  );
};
