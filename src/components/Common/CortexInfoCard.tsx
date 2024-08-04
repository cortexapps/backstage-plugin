/*
 * Copyright 2024 Cortex Applications, Inc.
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
import React, { PropsWithChildren } from 'react';
import { InfoCard } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core';
import classnames from 'classnames';

interface CortexInfoCardProps extends PropsWithChildren {
  title?: React.ReactNode;
  padding?: 'default' | 'dense';
  className?: string;
}

export const useCortexInfoCardStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(1),
  },
  cardRoot: {
    padding: theme.spacing(2),
  },
  cardDense: {
    padding: theme.spacing(0),
  },
  cardHeader: {
    padding: theme.spacing(2),
  },
  cardHeaderTitle: {
    fontWeight: 700,
    margin: 0,
  },
}));

export const CortexInfoCard: React.FC<CortexInfoCardProps> = ({
  children,
  title,
  padding = 'default',
  className,
}) => {
  const classes = useCortexInfoCardStyles();

  return (
    <InfoCard
      title={title}
      className={classnames(classes.root, className)}
      cardClassName={classnames({
        [classes.cardRoot]: padding === 'default',
        [classes.cardDense]: padding === 'dense',
      })}
      headerProps={{
        className: classes.cardHeader,
        titleTypographyProps: {
          variant: 'body1',
          className: classes.cardHeaderTitle,
        },
      }}
    >
      {children}
    </InfoCard>
  );
};
