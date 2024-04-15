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
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
} from '@material-ui/core';
import {
  Button,
  ItemCardHeader,
  MarkdownContent,
} from '@backstage/core-components';
import { Truncated } from '../Common/Truncated';

interface ListCardProps {
  badges?: string[];
  description?: string;
  name: string;
  truncateToLines?: number;
  url: string;
}

export const ListCard = ({
  badges,
  description,
  name,
  truncateToLines,
  url,
}: ListCardProps) => {
  return (
    <Card>
      <CardMedia>
        <ItemCardHeader title={name} />
      </CardMedia>
      <CardContent>
        {description && (
          <>
            {truncateToLines ? (
              <Truncated
                text={description}
                truncateToLines={truncateToLines}
                renderText={(text) => <MarkdownContent content={text}/>}
              />
            ) : (
              <MarkdownContent content={description}/>
            )}
          </>
        )}
        {badges?.map(badge => (
          <Chip key={`${name}-badge-${badge}`} size="small" label={badge} />
        ))}
      </CardContent>
      <CardActions>
        <Button to={url} color="primary">
          Details
        </Button>
      </CardActions>
    </Card>
  );
};
