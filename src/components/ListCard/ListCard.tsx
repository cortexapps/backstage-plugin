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
import React, { useMemo, useState } from 'react';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  makeStyles,
} from '@material-ui/core';
import {
  Button,
  ItemCardHeader,
  MarkdownContent,
} from '@backstage/core-components';
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>(styles => ({
  linkButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: styles.palette.primary.main,
    cursor: 'pointer',
    fontSize: styles.typography.body2.fontSize,
    padding: 0,
  },
}));

interface ListCardProps {
  badges?: string[];
  description?: string;
  name: string;
  truncateToCharacters?: number;
  url: string;
}

export const ListCard = ({
  badges,
  description,
  name,
  truncateToCharacters,
  url,
}: ListCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const classes = useStyles();

  const descriptionToShow = useMemo(() => {
    if (!description) {
      return '';
    }

    if (truncateToCharacters && !isExpanded) {
      return description.substring(0, truncateToCharacters) + '...';
    }

    return description;
  }, [description, isExpanded, truncateToCharacters]);

  return (
    <Card>
      <CardMedia>
        <ItemCardHeader title={name} />
      </CardMedia>
      <CardContent>
        {description && (
          <>
            <MarkdownContent content={descriptionToShow ?? ''} />
            {truncateToCharacters && description.length > truncateToCharacters && (
              <button
                className={classes.linkButton}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Less' : 'More'}
              </button>
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
